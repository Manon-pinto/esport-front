"use client"
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

interface UserInfo {
  username: string
  points: number
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserInfo | null
  login: (token: string) => void
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
})

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore : pas de setState dans un effet, pas de hydration mismatch
  const token = useSyncExternalStore(
    subscribeToStorage,
    () => localStorage.getItem("token"),
    () => null, // snapshot serveur (SSR) : pas de token
  )
  const isAuthenticated = !!token

  const [user, setUser] = useState<UserInfo | null>(null)
  const [fetchTick, setFetchTick] = useState(0)
  const router = useRouter()

  const refreshUser = () => setFetchTick((n) => n + 1)

  // Fetch user data (setState dans .then() = callback, autorisé par le lint)
  useEffect(() => {
    if (!isAuthenticated || !token) return

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
  }, [isAuthenticated, token, fetchTick])

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    refreshUser()
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
