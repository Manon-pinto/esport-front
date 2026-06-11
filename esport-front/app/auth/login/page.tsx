"use client"
import { useState } from "react"
import Link from "next/link"
import { login } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await login(email, password)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify({ username: data.user.username, points: data.user.points }))
      window.location.href = "/"
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur serveur")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Bon retour sur ESPORT PRO</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulaire de connexion">
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-label">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Se connecter
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="auth-link">
            Inscription
          </Link>
        </p>
      </div>
    </div>
  )
}