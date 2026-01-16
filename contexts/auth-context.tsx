"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth"

interface AuthContextType {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = getAuthToken()
    setTokenState(savedToken)
    setIsLoading(false)
  }, [])

  const setToken = (newToken: string) => {
    setAuthToken(newToken)
    setTokenState(newToken)
  }

  const logout = () => {
    clearAuthToken()
    setTokenState(null)
  }

  return <AuthContext.Provider value={{ token, setToken, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
