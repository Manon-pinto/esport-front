"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface UserInfo {
  username: string
  points: number
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  logout: () => {},
  refreshUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token")
  })

  const [user, setUser] = useState<UserInfo | null>(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [fetchTick, setFetchTick] = useState(0)

  const refreshUser = () => setFetchTick((n) => n + 1)

  useEffect(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem("token")
    if (!token) return

    fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        const updated = { username: data.user.username, points: data.user.points }
        localStorage.setItem("user", JSON.stringify(updated))
        setUser(updated)
      })
      .catch(() => {})
  }, [isAuthenticated, fetchTick])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
