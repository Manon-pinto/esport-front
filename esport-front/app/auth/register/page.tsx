"use client"
import { useState } from "react"
import Link from "next/link"
import { register } from "@/lib/api"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }

    try {
      const data = await register(username, email, password)
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
          <h1 className="auth-title">Inscription</h1>
          <p className="auth-subtitle">Rejoins ESPORT PRO dès maintenant</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Nom utilisateur</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Ton pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn">
            Inscription
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="auth-link">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
