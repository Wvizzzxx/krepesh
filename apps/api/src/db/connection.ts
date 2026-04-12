import mongoose from 'mongoose'
import { config } from '../config'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('[MongoDB] Connected successfully')
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
    throw error
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
  console.log('[MongoDB] Disconnected')
}
