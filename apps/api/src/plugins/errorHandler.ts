import { FastifyReply } from 'fastify'
import { ZodError } from 'zod'

export function handleZodError(error: ZodError, reply: FastifyReply): void {
  const details = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
  reply.status(400).send({
    success: false,
    error: `Validation failed: ${details}`,
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  })
}

export function handleError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
): void {
  reply.status(statusCode).send({ success: false, error: message })
}
