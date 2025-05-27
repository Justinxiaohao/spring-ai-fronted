export interface LoginData {
  email: string
  code?: string
  password?: string
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
}

export interface ApiResponse {
  success: boolean
  message?: string
  data?: any
}

export interface UserCheckResponse {
  exists: boolean
}
