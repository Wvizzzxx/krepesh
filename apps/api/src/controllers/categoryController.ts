import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Category } from '../models/Category'
import { createCategorySchema, updateCategorySchema } from '../validators'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, adminOnly } from '../middleware/auth'
import { slugify } from '../utils/slug'
import path from 'path'
import fs from 'fs'

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')

function resolveUploadPath(imageUrl: string): string | null {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return null
  const fileName = imageUrl.replace(/^\/uploads\//, '')
  return path.join(UPLOADS_DIR, fileName)
}

export function categoryRoutes(app: FastifyInstance): void {
  app.get('/api/categories', async (_request, reply) => {
    try {
      const categories = await Category.find().sort({ name: 1 })
      reply.send({ success: true, data: categories })
    } catch {
      handleError(reply, 500, 'Failed to fetch categories')
    }
  })

  app.get('/api/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const category = await Category.findById(id)
      if (!category) return handleError(reply, 404, 'Category not found')
      reply.send({ success: true, data: category })
    } catch {
      handleError(reply, 500, 'Failed to fetch category')
    }
  })

  app.post('/api/categories', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const body = createCategorySchema.parse(request.body)
      const category = await Category.create({ ...body, slug: slugify(body.name) })
      reply.status(201).send({ success: true, data: category })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Create category error:', error)
      handleError(reply, 500, 'Failed to create category')
    }
  })

  app.put(
    '/api/categories/:id',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = updateCategorySchema.parse(request.body)
        const update: Record<string, unknown> = { ...body }
        if (body.name) update.slug = slugify(body.name)

        const category = await Category.findByIdAndUpdate(id, update, { new: true })
        if (!category) return handleError(reply, 404, 'Category not found')
        reply.send({ success: true, data: category })
      } catch (error) {
        if (error instanceof ZodError) return handleZodError(error, reply)
        console.error('Update category error:', error)
        handleError(reply, 500, 'Failed to update category')
      }
    },
  )

  app.delete(
    '/api/categories/:id',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const category = await Category.findByIdAndDelete(id)
        if (!category) return handleError(reply, 404, 'Category not found')
        // Delete category image if exists
        if (category.image) {
          const localPath = resolveUploadPath(category.image)
          if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath)
        }
        reply.send({ success: true })
      } catch {
        handleError(reply, 500, 'Failed to delete category')
      }
    },
  )

  // Upload category image
  app.post(
    '/api/categories/:id/image',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const file = await request.file()
        if (!file) return handleError(reply, 400, 'No file provided')

        const url = await app.saveUpload(file)
        const category = await Category.findByIdAndUpdate(id, { image: url }, { new: true })
        if (!category) return handleError(reply, 404, 'Category not found')
        reply.send({ success: true, data: url })
      } catch {
        console.error('Upload category image error:')
        handleError(reply, 500, 'Failed to upload image')
      }
    },
  )
}
