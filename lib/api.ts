// Centralized API client for all requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

interface ApiError {
  message: string
  status: number
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getAuthHeader(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("fh_auth_token") : null

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    // 👇 هنا التغيير: زودنا /admin قبل /login
    const response = await fetch(`${this.baseUrl}/api/v1/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })

    if (!response.ok) {
        // لو الرد كان 403 Forbidden يبقى ده يوزر عادي بيحاول يدخل
        if (response.status === 403) {
            throw { message: "Access Denied: Admins Only", status: 403 } as ApiError
        }
        throw { message: "Login failed", status: response.status } as ApiError
    }

    return response.json()
}

  async getProducts(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/store/products`, {
      method: "GET",
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      throw { message: "Failed to fetch products", status: response.status } as ApiError
    }

    return response.json()
  }

  async createProduct(data: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/products`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: data,
    })

    if (!response.ok) {
      throw { message: "Failed to create product", status: response.status } as ApiError
    }

    return response.json()
  }

  async updateProduct(productId: number, data: FormData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/products/${productId}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: data,
    })

    if (!response.ok) {
      throw { message: "Failed to update product", status: response.status } as ApiError
    }

    return response.json()
  }

  async deleteProduct(productId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/products/${productId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      throw { message: "Failed to delete product", status: response.status } as ApiError
    }

    return response.json()
  }

  async getAdminProfile(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/profile`, {
      method: "GET",
      headers: this.getAuthHeader(),
    })

    if (!response.ok) {
      throw { message: "Failed to fetch profile", status: response.status } as ApiError
    }

    return response.json()
  }

  async updateAdminSettings(data: {
    email?: string
    full_name?: string
    whatsapp_number?: string
    password?: string
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/settings`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw { message: "Failed to update settings", status: response.status } as ApiError
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
