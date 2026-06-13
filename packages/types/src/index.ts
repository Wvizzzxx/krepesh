// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: 'admin' | 'user';
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  image?: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  category?: Category;
  images: string[];
  stock: number;
  specifications: Record<string, string>;
  discountPrice?: number | null;
  averageRating: number;
  reviewCount: number;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  stock: number;
  specifications: Record<string, string>;
}

// Cart types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface CreateOrderDTO {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryParams extends PaginationParams {
  categoryId?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}