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

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulaire d'inscription">
          <div className="auth-field">
            <label htmlFor="register-username" className="auth-label">Nom utilisateur</label>
            <input
              id="register-username"
              type="text"
              className="auth-input"
              placeholder="Ton pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email" className="auth-label">Email</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="auth-label">Mot de passe</label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm" className="auth-label">Confirmer le mot de passe</label>
            <input
              id="register-confirm"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
