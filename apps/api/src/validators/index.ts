import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  image: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().length(24, 'Invalid category ID'),
  images: z.array(z.string()).default([]),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  specifications: z.record(z.string()).optional().default({}),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().length(24).optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  specifications: z.record(z.string()).optional(),
})

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().length(24, 'Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    city: z.string().min(1),
    address: z.string().min(1),
    postalCode: z.string().min(1),
  }),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(12),
  categoryId: z.string().max(50).optional().or(z.literal('')),
  search: z.string().max(200).optional().or(z.literal('')),
  sortBy: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).passthrough()
