import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Asset } from '../models/Asset'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, adminOnly } from '../middleware/auth'
import { slugify } from '../utils/slug'
import path from 'path'
import fs from 'fs'
import { z } from 'zod'

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')

function resolveUploadPath(imageUrl: string): string | null {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return null
  const fileName = imageUrl.replace(/^\/uploads\//, '')
  return path.join(UPLOADS_DIR, fileName)
}

const createAssetSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['icon', 'placeholder'], { errorMap: () => ({ message: 'Type must be icon or placeholder' }) }),
  emoji: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

const updateAssetSchema = z.object({
  key: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(['icon', 'placeholder']).optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export function assetRoutes(app: FastifyInstance): void {
  // Get all assets
  app.get('/api/assets', async (request, reply) => {
    try {
      const { type, location } = request.query as { type?: string; location?: string }
      const query: Record<string, unknown> = {}
      if (type) query.type = type
      if (location) query.location = location

      const assets = await Asset.find(query).sort({ location: 1, name: 1 })
      reply.send({ success: true, data: assets })
    } catch {
      handleError(reply, 500, 'Failed to fetch assets')
    }
  })

  // Get asset by ID
  app.get('/api/assets/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const asset = await Asset.findById(id)
      if (!asset) return handleError(reply, 404, 'Asset not found')
      reply.send({ success: true, data: asset })
    } catch {
      handleError(reply, 500, 'Failed to fetch asset')
    }
  })

  // Create asset
  app.post('/api/assets', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const body = createAssetSchema.parse(request.body)
      const asset = await Asset.create({
        ...body,
        slug: slugify(body.name),
        url: '',
      })
      reply.status(201).send({ success: true, data: asset })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Create asset error:', error)
      handleError(reply, 500, 'Failed to create asset')
    }
  })

  // Upsert asset by key (for seed and initialization)
  app.post('/api/assets/upsert', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const body = createAssetSchema.parse(request.body)
      const existing = await Asset.findOne({ key: body.key })
      if (existing) {
        // Update existing - don't clear url if not provided
        const update: Record<string, unknown> = { ...body }
        if (body.name) update.slug = slugify(body.name)
        const asset = await Asset.findByIdAndUpdate(existing._id, update, { new: true })
        reply.send({ success: true, data: asset, created: false })
      } else {
        const asset = await Asset.create({
          ...body,
          slug: slugify(body.name),
          url: '',
        })
        reply.status(201).send({ success: true, data: asset, created: true })
      }
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Upsert asset error:', error)
      handleError(reply, 500, 'Failed to upsert asset')
    }
  })

  // Update asset
  app.put('/api/assets/:id', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = updateAssetSchema.parse(request.body)
      const update: Record<string, unknown> = { ...body }
      if (body.name) update.slug = slugify(body.name)

      const asset = await Asset.findByIdAndUpdate(id, update, { new: true })
      if (!asset) return handleError(reply, 404, 'Asset not found')
      reply.send({ success: true, data: asset })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Update asset error:', error)
      handleError(reply, 500, 'Failed to update asset')
    }
  })

  // Delete asset
  app.delete('/api/assets/:id', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const asset = await Asset.findByIdAndDelete(id)
      if (!asset) return handleError(reply, 404, 'Asset not found')

      // Delete file if exists
      if (asset.url) {
        const localPath = resolveUploadPath(asset.url)
        if (localPath && fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
        }
      }
      reply.send({ success: true })
    } catch {
      handleError(reply, 500, 'Failed to delete asset')
    }
  })

  // Upload asset image
  app.post('/api/assets/:id/image', { preHandler: [authenticate, adminOnly] }, async (request: FastifyRequest, reply) => {
    try {
      const { id } = request.params as { id: string }
      const file = await request.file()
      if (!file) return handleError(reply, 400, 'No file provided')

      const url = await app.saveUpload(file)
      
      // Delete old file if exists
      const asset = await Asset.findById(id)
      if (asset?.url) {
        const localPath = resolveUploadPath(asset.url)
        if (localPath && fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
        }
      }

      const updatedAsset = await Asset.findByIdAndUpdate(id, { url }, { new: true })
      if (!updatedAsset) return handleError(reply, 404, 'Asset not found')

      reply.send({ success: true, data: url })
    } catch (error) {
      console.error('Upload asset image error:', error)
      handleError(reply, 500, 'Failed to upload image')
    }
  })

  // Remove asset image (revert to emoji/icon)
  app.delete('/api/assets/:id/image', { preHandler: [authenticate, adminOnly] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const asset = await Asset.findById(id)
      if (!asset) return handleError(reply, 404, 'Asset not found')

      // Delete file if exists
      if (asset.url) {
        const localPath = resolveUploadPath(asset.url)
        if (localPath && fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
        }
      }

      const updatedAsset = await Asset.findByIdAndUpdate(id, { url: '' }, { new: true })
      reply.send({ success: true, data: updatedAsset })
    } catch {
      handleError(reply, 500, 'Failed to remove image')
    }
  })
}