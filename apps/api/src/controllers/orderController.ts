import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Order } from '../models/Order'
import { Product } from '../models/Product'
import { createOrderSchema } from '../validators'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, getJwtPayload } from '../middleware/auth'

export function orderRoutes(app: FastifyInstance): void {
  app.get('/api/orders', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const orders = await Order.find({ userId: getJwtPayload(request).userId }).sort({ createdAt: -1 })
      reply.send({ success: true, data: orders })
    } catch {
      handleError(reply, 500, 'Failed to fetch orders')
    }
  })

  app.get('/api/orders/:id', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const { id } = request.params as { id: string }
      const order = await Order.findById(id)
      if (!order) return handleError(reply, 404, 'Order not found')
      reply.send({ success: true, data: order })
    } catch {
      handleError(reply, 500, 'Failed to fetch order')
    }
  })

  app.post('/api/orders', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const body = createOrderSchema.parse(request.body)
      let totalPrice = 0
      const orderItems: Array<{ productId: unknown; productName: string; price: number; quantity: number }> = []

      for (const item of body.items) {
        const product = await Product.findById(item.productId)
        if (!product) {
          return handleError(reply, 400, `Product ${item.productId} not found`)
        }
        if (product.stock < item.quantity) {
          return handleError(reply, 400, `Not enough stock for ${product.name}`)
        }

        orderItems.push({
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
        })
        totalPrice += product.price * item.quantity

        product.stock -= item.quantity
        await product.save()
      }

      const order = await Order.create({
        userId: getJwtPayload(request).userId,
        items: orderItems,
        totalPrice,
        shippingAddress: body.shippingAddress,
      })

      reply.status(201).send({ success: true, data: order })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Create order error:', error)
      handleError(reply, 500, 'Failed to create order')
    }
  })
}
