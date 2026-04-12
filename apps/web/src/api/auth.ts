import api from './client'
import type { AuthResponse, LoginDTO, CreateUserDTO, User } from '@krepesh/types'

interface AuthApiData {
  user: Omit<User, 'createdAt' | 'updatedAt'>
  token: string
}

export async function login(data: LoginDTO): Promise<AuthApiData> {
  const { data: response } = await api.post<{ success: boolean; data: AuthApiData }>('/auth/login', data)
  return response.data
}

export async function register(data: CreateUserDTO): Promise<AuthApiData> {
  const { data: response } = await api.post<{ success: boolean; data: AuthApiData }>('/auth/register', data)
  return response.data
}

export async function getProfile(): Promise<User> {
  const { data: response } = await api.get<{ success: boolean; data: User }>('/auth/profile')
  return response.data
}
