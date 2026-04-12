import mongoose from 'mongoose'

export interface ICategory {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, trim: true },
  image: { type: String },
}, { timestamps: true })

categorySchema.index({ slug: 1 })
categorySchema.index({ name: 'text' })

export const Category = mongoose.model<ICategory>('Category', categorySchema)
