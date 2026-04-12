import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { User } from '../models/User'
import { registerSchema, loginSchema } from '../validators'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, getJwtPayload } from '../middleware/auth'

export function authRoutes(app: FastifyInstance): void {
  app.post('/api/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body)
      const existing = await User.findOne({ email: body.email })
      if (existing) {
        return reply.status(400).send({ success: false, error: 'Email already registered' })
      }

      const user = await User.create({ email: body.email, password: body.password, name: body.name })
      const token = app.jwt.sign({ userId: user._id, role: user.role })

      reply.send({
        success: true,
        data: {
          user: { _id: user._id, email: user.email, name: user.name, role: user.role },
          token,
        },
      })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Register error:', error)
      handleError(reply, 500, 'Internal server error')
    }
  })

  app.post('/api/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)
      const user = await User.findOne({ email: body.email })
      if (!user || !(await user.comparePassword(body.password))) {
        return reply.status(401).send({ success: false, error: 'Invalid credentials' })
      }

      const token = app.jwt.sign({ userId: user._id, role: user.role })
      reply.send({
        success: true,
        data: {
          user: { _id: user._id, email: user.email, name: user.name, role: user.role },
          token,
        },
      })
    } catch (error) {
      if (error instanceof ZodError) return handleZodError(error, reply)
      console.error('Login error:', error)
      handleError(reply, 500, 'Internal server error')
    }
  })

  app.get('/api/auth/profile', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
    try {
      const user = await User.findById(getJwtPayload(request).userId).select('-password')
      if (!user) return handleError(reply, 404, 'User not found')
      reply.send({ success: true, data: user })
    } catch {
      handleError(reply, 500, 'Internal server error')
    }
  })
}
