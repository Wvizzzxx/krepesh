import { FastifyReply, FastifyRequest } from 'fastify'
import { User } from '../models/User'

export interface JwtPayload {
  userId: string
  role: string
}

/**
 * Helper to get typed JWT payload from request
 */
export function getJwtPayload(request: FastifyRequest): JwtPayload {
  return request.user as JwtPayload
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ success: false, error: 'Unauthorized' })
  }
}

export async function adminOnly(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const payload = getJwtPayload(request)
  const user = await User.findById(payload.userId).select('role')
  if (!user || user.role !== 'admin') {
    reply.status(403).send({ success: false, error: 'Admin access required' })
  }
}
