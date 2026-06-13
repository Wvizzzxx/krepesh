import mongoose from 'mongoose'

export interface IAsset {
  _id: string
  key: string         // Unique identifier like 'sidebar-dashboard', 'home-delivery'
  name: string
  slug: string
  type: 'icon' | 'placeholder'
  emoji?: string      // Emoji character used on the site
  url: string         // Path to uploaded image (empty = use emoji/fa icon)
  description?: string
  location?: string   // Where it's used: 'sidebar', 'home', 'categories', 'products'
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

const assetSchema = new mongoose.Schema<IAsset>({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  type: { type: String, required: true, enum: ['icon', 'placeholder'] },
  emoji: { type: String, default: '' },
  url: { type: String, default: '' },
  description: { type: String },
  location: { type: String, default: '' },
  width: { type: Number },
  height: { type: Number },
}, { timestamps: true })

assetSchema.index({ type: 1 })
assetSchema.index({ location: 1 })

export const Asset = mongoose.model<IAsset>('Asset', assetSchema)