import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { config } from './config'
import { connectDB } from './db/connection'
import authPlugin from './plugins/auth'
import errorHandlerPlugin from './plugins/globalErrorHandler'
import uploadPlugin from './plugins/upload'
import { authRoutes } from './controllers/authController'
import { categoryRoutes } from './controllers/categoryController'
import { productRoutes } from './controllers/productController'
import { orderRoutes } from './controllers/orderController'
import { adminRoutes } from './controllers/adminController'

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('[API] Starting...')
console.log(`[API] Config: Port=${config.port}, Host=${config.host}, Env=${config.nodeEnv}`)

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    transport: config.nodeEnv === 'development'
      ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' } }
      : undefined,
  },
})

async function start(): Promise<void> {
  console.log('[API] Initializing...')
  
  try {
    // Register plugins
    console.log('[API] Registering CORS...')
    await app.register(cors, { origin: config.corsOrigin })
    
    console.log('[API] Registering JWT...')
    await app.register(jwt, { secret: config.jwtSecret })
    
    console.log('[API] Registering auth plugin...')
    await app.register(authPlugin)
    
    console.log('[API] Registering error handler...')
    await app.register(errorHandlerPlugin)
    
    console.log('[API] Registering upload plugin...')
    await app.register(uploadPlugin)

    // Serve uploaded files statically
    console.log('[API] Setting up static file serving...')
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    await app.register(fastifyStatic, {
      root: uploadsDir,
      prefix: '/uploads/',
    })

    // Register routes
    console.log('[API] Registering routes...')
    authRoutes(app)
    categoryRoutes(app)
    productRoutes(app)
    orderRoutes(app)
    adminRoutes(app)

    // Health check
    app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

    // Connect to MongoDB
    console.log('[API] Connecting to MongoDB...')
    await connectDB()

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'] as const
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down gracefully`)
        await app.close()
        await mongoose.disconnect()
        process.exit(0)
      })
    }

    // Start server
    console.log(`[API] Starting server on ${config.host}:${config.port}...`)
    await app.listen({ port: config.port, host: config.host })
    app.log.info(`Server running on http://${config.host}:${config.port}`)
  } catch (error) {
    console.error('[API] Failed to start:')
    console.error('[API] Error:', error)
    if (error instanceof Error) {
      console.error('[API] Message:', error.message)
      console.error('[API] Stack:', error.stack)
    }
    process.exit(1)
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
