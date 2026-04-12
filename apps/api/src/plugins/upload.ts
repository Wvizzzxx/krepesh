import FastifyMultipart, { FastifyMultipartOptions } from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  console.log(`[Upload] Created uploads directory: ${UPLOADS_DIR}`)
}

async function uploadPlugin(app: FastifyInstance): Promise<void> {
  await app.register(FastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB per file
      files: 10, // max 10 files per request
    },
  } as FastifyMultipartOptions)

  // Helper to save files
  app.decorate('saveUpload', async function (file: any): Promise<string> {
    const ext = path.extname(file.filename) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filepath = path.join(UPLOADS_DIR, filename)
    await file.toDisk(filepath)
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
