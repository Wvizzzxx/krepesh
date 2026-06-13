import mongoose from 'mongoose'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  productName: string
  price: number
  quantity: number
}

export interface IShippingAddress {
  fullName: string
  phone: string
  city: string
  address: string
  postalCode: string
}

export interface IOrder {
  _id: string
  userId: mongoose.Types.ObjectId
  items: IOrderItem[]
  totalPrice: number
  deliveryCost: number
  status: OrderStatus
  shippingAddress: IShippingAddress
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new mongoose.Schema<IOrderItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false })

const orderSchema = new mongoose.Schema<IOrder>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  deliveryCost: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
}, { timestamps: true })

orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

export const Order = mongoose.model<IOrder>('Order', orderSchema)
