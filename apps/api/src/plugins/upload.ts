import FastifyMultipart, { FastifyMultipartOptions } from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  console.log(`[Upload] Created uploads directory: ${UPLOADS_DIR}`)
}

async function uploadPlugin(app: FastifyInstance): Promise<void> {
  await app.register(FastifyMultipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB per file
      files: 10, // max 10 files per request
    },
  } as FastifyMultipartOptions)

  // Helper to save files
  app.decorate('uploadsDir', UPLOADS_DIR)

  app.decorate('saveUpload', async function (filePart: any): Promise<string> {
    const ext = path.extname(filePart?.filename || '') || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filepath = path.join(UPLOADS_DIR, filename)

    if (typeof filePart?.toBuffer === 'function') {
      const buffer = await filePart.toBuffer()
      await fs.promises.writeFile(filepath, buffer)
    } else if (filePart?.file && typeof filePart.file.pipe === 'function') {
      await pipeline(filePart.file, fs.createWriteStream(filepath))
    } else if (filePart && typeof filePart.pipe === 'function') {
      await pipeline(filePart, fs.createWriteStream(filepath))
    } else {
      throw new Error('Unsupported upload payload format')
    }

    return `/uploads/${filename}`
  })
}

// Extend FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    saveUpload(file: any): Promise<string>
  }
}

export default fp(uploadPlugin, { name: 'upload-plugin' })
