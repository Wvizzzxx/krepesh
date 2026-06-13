import { FastifyInstance, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import nodemailer from 'nodemailer'
import { User } from '../models/User'
import { registerSchema, loginSchema } from '../validators'
import { handleZodError, handleError } from '../plugins/errorHandler'
import { authenticate, getJwtPayload } from '../middleware/auth'

// SMTP settings for Yandex Mail
let smtpSettings = { email: '', appPassword: '' }
let transporter: nodemailer.Transporter | null = null

function buildTransporter() {
  if (!smtpSettings.email || !smtpSettings.appPassword) {
    transporter = null
    return
  }
  transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: smtpSettings.email,
      pass: smtpSettings.appPassword,
    },
  })
}

async function sendVerificationEmail(to: string, code: string, name: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[Email] SMTP не настроен. Код для ${to}: ${code}`)
    return false
  }
  try {
    await transporter.sendMail({
      from: `"КРЕПЁЖ" <${smtpSettings.email}>`,
      to,
      subject: 'Подтверждение email - КРЕПЁЖ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">🔩 Подтверждение email</h2>
          <p>Здравствуйте, ${name}!</p>
          <p>Ваш код подтверждения:</p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">Код действителен в течение 15 минут.</p>
          <p style="color: #64748b; font-size: 14px;">Если вы не запрашивали подтверждение, просто проигнорируйте это письмо.</p>
        </div>
      `,
    })
    console.log(`[Email] Письмо отправлено на ${to}`)
    return true
  } catch (error) {
    console.error(`[Email] Ошибка отправки на ${to}:`, error)
    return false
  }
}

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
        user: { _id: user._id, email: user.email, name: user.name, phone: user.phone, avatar: user.avatar, address: user.address, role: user.role, emailVerified: user.emailVerified },
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
        user: { _id: user._id, email: user.email, name: user.name, phone: user.phone, avatar: user.avatar, address: user.address, role: user.role, emailVerified: user.emailVerified },
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

// Update profile route
app.put('/api/auth/profile', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const updates = request.body as Partial<{
      name: string
      phone: string
      address: string
    }>

    const allowedUpdates = ['name', 'phone', 'address']
    const requestedUpdates = Object.keys(updates)

    const isValidOperation = requestedUpdates.every(update =>
      allowedUpdates.includes(update)
    )

    if (!isValidOperation) {
      return reply.status(400).send({ success: false, error: 'Invalid updates' })
    }

    const user = await User.findByIdAndUpdate(
      getJwtPayload(request).userId,
      { ...updates },
      { new: true, select: '-password' }
    )

    if (!user) return handleError(reply, 404, 'User not found')

    reply.send({ success: true, data: user })
  } catch (error) {
    console.error('Update profile error:', error)
    handleError(reply, 500, 'Failed to update profile')
  }
})

// Upload avatar route
app.post('/api/auth/avatar', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const files = await request.files()
    const file = await files.next()

    if (!file.done) {
      const imageUrl = await app.saveUpload(file.value)

      const user = await User.findByIdAndUpdate(
        getJwtPayload(request).userId,
        { avatar: imageUrl },
        { new: true, select: '-password' }
      )

      if (!user) return handleError(reply, 404, 'User not found')

      reply.send({ success: true, data: user })
    } else {
      return handleError(reply, 400, 'No file uploaded')
    }
  } catch (error) {
    console.error('Upload avatar error:', error)
    const message = error instanceof Error ? error.message : 'Unknown upload error'
    handleError(reply, 500, `Failed to upload avatar: ${message}`)
  }
})

// === Email Verification Routes ===

app.post('/api/auth/send-verification', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const userId = getJwtPayload(request).userId
    const user = await User.findById(userId)
    if (!user) return handleError(reply, 404, 'User not found')
    if (user.emailVerified) return reply.send({ success: true, message: 'Email already verified' })

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    user.verificationCode = code
    user.codeExpiresAt = expiresAt
    await user.save()

    // Send email via Yandex SMTP
    const emailSent = await sendVerificationEmail(user.email, code, user.name)

    reply.send({
      success: true,
      data: {
        email: user.email,
        emailSent,
        message: emailSent ? 'Код отправлен на email' : 'Email не настроен. Код отображается в консоли сервера.',
      }
    })
  } catch (error) {
    console.error('Send verification error:', error)
    handleError(reply, 500, 'Failed to generate verification code')
  }
})

app.post('/api/auth/verify-email', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const userId = getJwtPayload(request).userId
    const { code } = request.body as { code: string }

    if (!code || code.length !== 6) {
      return reply.status(400).send({ success: false, error: 'Invalid code format' })
    }

    const user = await User.findById(userId)
    if (!user) return handleError(reply, 404, 'User not found')
    if (user.emailVerified) return reply.send({ success: true, message: 'Email already verified' })

    if (!user.verificationCode || !user.codeExpiresAt) {
      return reply.status(400).send({ success: false, error: 'No verification code. Please request a new one.' })
    }

    if (new Date() > user.codeExpiresAt) {
      return reply.status(400).send({ success: false, error: 'Code expired. Please request a new one.' })
    }

    if (user.verificationCode !== code) {
      return reply.status(400).send({ success: false, error: 'Invalid code' })
    }

    user.emailVerified = true
    user.verificationCode = undefined
    user.codeExpiresAt = undefined
    await user.save()

    reply.send({ success: true, data: { _id: user._id, email: user.email, name: user.name, phone: user.phone, avatar: user.avatar, address: user.address, role: user.role, emailVerified: user.emailVerified } })
  } catch (error) {
    console.error('Verify email error:', error)
    handleError(reply, 500, 'Failed to verify email')
  }
})

// === SMTP Settings Routes (admin only) ===

app.get('/api/settings/smtp', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const user = await User.findById(getJwtPayload(request).userId)
    if (!user || user.role !== 'admin') return handleError(reply, 403, 'Admin only')
    reply.send({
      success: true,
      data: {
        email: smtpSettings.email,
        configured: !!(smtpSettings.email && smtpSettings.appPassword),
      }
    })
  } catch {
    handleError(reply, 500, 'Failed to get settings')
  }
})

app.put('/api/settings/smtp', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const user = await User.findById(getJwtPayload(request).userId)
    if (!user || user.role !== 'admin') return handleError(reply, 403, 'Admin only')

    const body = request.body as { email?: string; appPassword?: string }
    if (body.email !== undefined) smtpSettings.email = body.email
    if (body.appPassword !== undefined) smtpSettings.appPassword = body.appPassword

    buildTransporter()

    reply.send({
      success: true,
      data: {
        email: smtpSettings.email,
        configured: !!(smtpSettings.email && smtpSettings.appPassword),
      }
    })
  } catch {
    handleError(reply, 500, 'Failed to save settings')
  }
})

app.post('/api/settings/smtp/test', { preHandler: [authenticate] }, async (request: FastifyRequest, reply) => {
  try {
    const user = await User.findById(getJwtPayload(request).userId)
    if (!user || user.role !== 'admin') return handleError(reply, 403, 'Admin only')

    if (!transporter) {
      return reply.status(400).send({ success: false, error: 'SMTP не настроен. Заполните email и пароль приложения.' })
    }

    try {
      await transporter.sendMail({
        from: `"КРЕПЁЖ" <${smtpSettings.email}>`,
        to: smtpSettings.email,
        subject: 'Тестовое письмо - КРЕПЁЖ',
        html: '<h2>✅ SMTP настроен правильно!</h2><p>Письма подтверждения email будут приходить пользователям.</p>',
      })
      reply.send({ success: true, message: 'Тестовое письмо отправлено!' })
    } catch (sendError: any) {
      reply.status(400).send({ success: false, error: `Ошибка отправки: ${sendError.message}` })
    }
  } catch {
    handleError(reply, 500, 'Failed to test SMTP')
  }
})

}