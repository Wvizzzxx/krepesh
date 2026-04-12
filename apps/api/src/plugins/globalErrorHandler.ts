import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

async function errorHandlerPlugin(app: FastifyInstance): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.setErrorHandler(async (error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    app.log.error(error)

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const validationError = error as any
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: Object.values(validationError.errors || {}).map((e: any) => e.message),
      })
    }

    // Mongoose cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      return reply.status(400).send({
        success: false,
        error: 'Invalid ID format',
      })
    }

    // Mongoose duplicate key error
    const mongooseError = error as any
    if (mongooseError.code === 11000) {
      const field = Object.keys(mongooseError.keyPattern || {})[0]
      return reply.status(409).send({
        success: false,
        error: `${field} already exists`,
      })
    }

    // Default
    const fastifyError = error as any
    const statusCode = fastifyError.statusCode || fastifyError.status || 500
    reply.status(statusCode).send({
      success: false,
      error: statusCode === 500 ? 'Internal server error' : error.message,
    })
  })
}

export default fp(errorHandlerPlugin, { name: 'error-handler-plugin' })
