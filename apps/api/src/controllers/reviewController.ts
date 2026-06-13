import { FastifyInstance, FastifyRequest } from 'fastify'
import mongoose from 'mongoose'
import { Review } from '../models/Review'
import { Product } from '../models/Product'
import { handleError } from '../plugins/errorHandler'
import { authenticate, getJwtPayload } from '../middleware/auth'

export function reviewRoutes(app: FastifyInstance): void {
  // Получение отзывов для товара (публичное)
  app.get('/api/products/:productId/reviews', async (request: FastifyRequest, reply) => {
    try {
      const { productId } = request.params as { productId: string }
      const reviews = await Review.find({ productId, isApproved: true })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
      reply.send({ success: true, data: reviews })
    } catch {
      handleError(reply, 500, 'Failed to fetch reviews')
    }
  })

  // Создание отзыва (требует аутентификации)
  app.post('/api/reviews', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { productId, rating, title, comment } = request.body as any
      const userId = getJwtPayload(request).userId

      const existingReview = await Review.findOne({ productId, userId })
      if (existingReview) {
        return handleError(reply, 400, 'Вы уже оставляли отзыв на этот товар')
      }

      const review = await Review.create({
        productId,
        userId,
        rating,
        title,
        comment,
        isApproved: false,
      })

      await updateProductRating(productId)

      reply.status(201).send({ success: true, data: review })
    } catch (error: any) {
      handleError(reply, 500, error.message || 'Failed to create review')
    }
  })

  // Все отзывы (для администраторов)
  app.get('/api/admin/reviews', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { isApproved, productId } = request.query as { isApproved?: string; productId?: string }
      const filter: any = {}
      if (isApproved !== undefined) filter.isApproved = isApproved === 'true'
      if (productId) filter.productId = productId

      const reviews = await Review.find(filter)
        .populate('productId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })

      reply.send({ success: true, data: reviews })
    } catch {
      handleError(reply, 500, 'Failed to fetch reviews')
    }
  })

  // Изменение статуса отзыва
  app.patch('/api/admin/reviews/:reviewId/status', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { reviewId } = request.params as { reviewId: string }
      const { isApproved } = request.body as { isApproved: boolean }

      const review = await Review.findByIdAndUpdate(reviewId, { isApproved }, { new: true })
      if (!review) return handleError(reply, 404, 'Отзыв не найден')

      await updateProductRating(review.productId.toString())

      reply.send({ success: true, data: review })
    } catch {
      handleError(reply, 500, 'Failed to update review')
    }
  })

  // Ответ на отзыв
  app.post('/api/admin/reviews/:reviewId/respond', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { reviewId } = request.params as { reviewId: string }
      const { response } = request.body as { response: string }

      const review = await Review.findByIdAndUpdate(reviewId, {
        adminResponse: response,
        adminRespondedAt: new Date(),
      }, { new: true })

      if (!review) return handleError(reply, 404, 'Отзыв не найден')
      reply.send({ success: true, data: review })
    } catch {
      handleError(reply, 500, 'Failed to respond to review')
    }
  })

  // Удаление отзыва
  app.delete('/api/admin/reviews/:reviewId', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { reviewId } = request.params as { reviewId: string }
      const review = await Review.findByIdAndDelete(reviewId)
      if (!review) return handleError(reply, 404, 'Отзыв не найден')
      await updateProductRating(review.productId.toString())
      reply.send({ success: true })
    } catch {
      handleError(reply, 500, 'Failed to delete review')
    }
  })
}

async function updateProductRating(productId: string) {
  try {
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ])
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      })
    } else {
      await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 })
    }
  } catch (error) {
    console.error('Ошибка обновления рейтинга:', error)
  }
}