import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { User } from '../models/User'
import type { JwtPayload } from '../middleware/auth'

async function authPlugin(app: FastifyInstance): Promise<void> {
  // Authenticate middleware — used as preHandler
  async function authenticate(request: any, reply: any): Promise<void> {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ success: false, error: 'Unauthorized' })
    }
  }

  // Admin-only middleware
  async function adminOnly(request: any, reply: any): Promise<void> {
    const user = await User.findById((request.user as JwtPayload).userId).select('role')
    if (!user || user.role !== 'admin') {
      reply.status(403).send({ success: false, error: 'Admin access required' })
    }
  }

  app.decorate('authenticate', authenticate)
  app.decorate('adminOnly', adminOnly)
}

export default fp(authPlugin, { name: 'auth-plugin' })
