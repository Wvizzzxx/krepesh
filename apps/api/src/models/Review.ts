import mongoose from 'mongoose'

export interface IReview {
  _id: string
  productId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  rating: number
  title: string
  comment: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  adminResponse?: string
  adminRespondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new mongoose.Schema<IReview>({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  comment: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  isVerifiedPurchase: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  adminResponse: { 
    type: String,
    maxlength: 500
  },
  adminRespondedAt: { 
    type: Date 
  }
}, { timestamps: true })

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true }) // Один отзыв от пользователя на товар
reviewSchema.index({ productId: 1, isApproved: 1 }) // Для получения одобренных отзывов по товару
reviewSchema.index({ userId: 1 }) // Для получения отзывов пользователя
reviewSchema.index({ rating: 1 }) // Для сортировки по рейтингу
reviewSchema.index({ createdAt: -1 }) // Для сортировки по дате

export const Review = mongoose.model<IReview>('Review', reviewSchema)