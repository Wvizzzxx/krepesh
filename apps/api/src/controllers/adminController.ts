import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { updateOrderStatusSchema, updateUserRoleSchema } from '../validators'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, adminOnly } from '../middleware/auth'

export function adminRoutes(app: FastifyInstance): void {
  // Admin: all orders
  app.get('/api/admin/orders', { preHandler: [authenticate, adminOnly] }, async (_request, reply) => {
    try {
      const orders = await Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
      reply.send({ success: true, data: orders })
    } catch {
      handleError(reply, 500, 'Failed to fetch orders')
    }
  })

  // Admin: update order status
  app.put('/api/admin/orders/:id/status', { preHandler: [authenticate, adminOnly] }, async (request: FastifyRequest, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = updateOrderStatusSchema.parse(request.body)
      const order = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true })
      if (!order) return handleError(reply, 404, 'Order not found')
      reply.send({ success: true, data: order })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Update order status error:', error)
      handleError(reply, 500, 'Failed to update order status')
    }
  })

  // Admin: list users
  app.get('/api/admin/users', { preHandler: [authenticate, adminOnly] }, async (_request, reply) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 })
      reply.send({ success: true, data: users })
    } catch {
      handleError(reply, 500, 'Failed to fetch users')
    }
  })

  // Admin: update user role
  app.put('/api/admin/users/:id/role', { preHandler: [authenticate, adminOnly] }, async (request: FastifyRequest, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = updateUserRoleSchema.parse(request.body)
      const user = await User.findByIdAndUpdate(id, { role: body.role }, { new: true }).select('-password')
      if (!user) return handleError(reply, 404, 'User not found')
      reply.send({ success: true, data: user })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Update user role error:', error)
      handleError(reply, 500, 'Failed to update user role')
    }
  })
}
