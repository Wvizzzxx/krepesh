import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export interface IUser {
  _id: string
  email: string
  password: string
  name: string
  phone?: string
  avatar?: string
  address?: string
  role: 'admin' | 'user'
  emailVerified: boolean
  verificationCode?: string
  codeExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String },
  avatar: { type: String },
  address: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  codeExpiresAt: { type: Date },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
  }
  next()
})

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
