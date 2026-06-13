import mongoose from 'mongoose'

export interface IProduct {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  categoryId: mongoose.Types.ObjectId
  images: string[]
  stock: number
  specifications: Record<string, string>
  discountPrice: number | null
  averageRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

const productSchema = new mongoose.Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  specifications: { type: Map, of: String },
  discountPrice: { type: Number, min: 0, default: null },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true })

productSchema.index({ slug: 1 })
productSchema.index({ categoryId: 1 })
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })

export const Product = mongoose.model<IProduct>('Product', productSchema)
