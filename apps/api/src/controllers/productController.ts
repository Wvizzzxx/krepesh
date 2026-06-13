import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Product } from '../models/Product'
import { createProductSchema, updateProductSchema, paginationSchema } from '../validators'
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

export function productRoutes(app: FastifyInstance): void {
  app.get('/api/products', async (request, reply) => {
    try {
      const params = paginationSchema.parse(request.query)
      const filter: Record<string, unknown> = {}
      if (params.categoryId) filter.categoryId = params.categoryId
      if (params.search) filter.$text = { $search: params.search }

      const sort: Record<string, 1 | -1> = {}
      sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1

      const skip = (params.page - 1) * params.limit
      const [products, total] = await Promise.all([
        Product.find(filter).populate('categoryId').sort(sort).skip(skip).limit(params.limit),
        Product.countDocuments(filter),
      ])

      reply.send({
        success: true,
        data: {
          items: products,
          total,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(total / params.limit),
        },
      })
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Zod validation error:', error.errors)
        return handleZodError(error, reply)
      }
      handleError(reply, 500, 'Failed to fetch products')
    }
  })

  app.get('/api/products/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const product = await Product.findById(id).populate('categoryId')
      if (!product) return handleError(reply, 404, 'Product not found')
      reply.send({ success: true, data: product })
    } catch {
      handleError(reply, 500, 'Failed to fetch product')
    }
  })

  app.post(
    '/api/products',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const body = createProductSchema.parse(request.body)
        const product = await Product.create({ ...body, slug: slugify(body.name) })
        reply.status(201).send({ success: true, data: product })
      } catch (error) {
        if (error instanceof ZodError) return handleZodError(error, reply)
        console.error('Create product error:', error)
        handleError(reply, 500, 'Failed to create product')
      }
    },
  )

  app.put(
    '/api/products/:id',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const body = updateProductSchema.parse(request.body)
        const update: Record<string, unknown> = { ...body }
        if (body.name) update.slug = slugify(body.name)

        const product = await Product.findByIdAndUpdate(id, update, { new: true })
        if (!product) return handleError(reply, 404, 'Product not found')
        reply.send({ success: true, data: product })
      } catch (error) {
        if (error instanceof ZodError) return handleZodError(error, reply)
        console.error('Update product error:', error)
        handleError(reply, 500, 'Failed to update product')
      }
    },
  )

  app.delete(
    '/api/products/:id',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const product = await Product.findByIdAndDelete(id)
        if (!product) return handleError(reply, 404, 'Product not found')
        // Delete associated images
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            const localPath = resolveUploadPath(img)
            if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath)
          }
        }
        reply.send({ success: true })
      } catch {
        handleError(reply, 500, 'Failed to delete product')
      }
    },
  )

  // Upload images for a product
  app.post(
    '/api/products/:id/images',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const files = await request.files()
        const imageUrls: string[] = []

        for await (const file of files) {
          const url = await app.saveUpload(file)
          imageUrls.push(url)
        }

        const product = await Product.findByIdAndUpdate(
          id,
          { $push: { images: { $each: imageUrls } } },
          { new: true },
        )
        if (!product) return handleError(reply, 404, 'Product not found')
        reply.send({ success: true, data: imageUrls })
      } catch (error) {
        console.error('Upload images error:', error)
        const message = error instanceof Error ? error.message : 'Unknown upload error'
        handleError(reply, 500, `Failed to upload images: ${message}`)
      }
    },
  )

  // Delete a specific image from product
  app.delete(
    '/api/products/:id/images',
    { preHandler: [authenticate, adminOnly] },
    async (request: FastifyRequest, reply) => {
      try {
        const { id } = request.params as { id: string }
        const { imageUrl } = request.body as { imageUrl: string }

        const product = await Product.findByIdAndUpdate(
          id,
          { $pull: { images: imageUrl } },
          { new: true },
        )
        if (!product) return handleError(reply, 404, 'Product not found')

        // Delete file from disk
        const localPath = resolveUploadPath(imageUrl)
        if (localPath && fs.existsSync(localPath)) fs.unlinkSync(localPath)

        reply.send({ success: true })
      } catch {
        handleError(reply, 500, 'Failed to delete image')
      }
    },
  )
}
