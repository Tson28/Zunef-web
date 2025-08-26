"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, type User } from "./api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  forgetPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(email, password)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("token", token)
      } else {
        throw new Error(response.message || "Đăng nhập thất bại")
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(name, email, password)
      
      if (response.success) {
        // Registration successful, user needs to verify email
        // Don't set user state yet, wait for email verification
        throw new Error(response.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.")
      } else {
        throw new Error(response.message || "Đăng ký thất bại")
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng ký thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  const forgetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.forgetPassword(email)
      
      if (!response.success) {
        throw new Error(response.message || "Gửi email đặt lại mật khẩu thất bại")
      }
    } catch (error: any) {
      throw new Error(error.message || "Gửi email đặt lại mật khẩu thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.resetPassword(token, newPassword)
      
      if (!response.success) {
        throw new Error(response.message || "Đặt lại mật khẩu thất bại")
      }
    } catch (error: any) {
      throw new Error(error.message || "Đặt lại mật khẩu thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ user, login, register, logout, isLoading, forgetPassword, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
