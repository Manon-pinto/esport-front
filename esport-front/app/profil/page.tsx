"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

interface FullUser {
  id: string
  username: string
  email: string
  role: string
  points: number
}

export default function ProfilPage() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [fullUser, setFullUser] = useState<FullUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return }
    const token = localStorage.getItem("token")
    if (!token) return
    fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setFullUser(data.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const initiales = user?.username?.slice(0, 2).toUpperCase() ?? "??"
  const isAdmin = fullUser?.role === "admin"
  const points = (fullUser?.points ?? user?.points ?? 0).toLocaleString()

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* ── En-tête profil ── */}
        <div className="profil-header">
          <div className="profil-avatar-initiales">{initiales}</div>
          <div className="profil-header-info">
            <h1 className="section-title" style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>
              {user?.username}
            </h1>
            <div className="profil-header-meta">
              {fullUser?.role && (
                <span className={`tournoi-badge ${isAdmin ? "tournoi-badge-live" : "tournoi-badge-upcoming"}`}>
                  {isAdmin ? "⚙️ Admin" : "🎮 Parieur"}
                </span>
              )}
              {fullUser?.email && (
                <span className="profil-header-email">{fullUser.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ display: "grid", marginTop: "2rem" }}>
          <div className="stat-card">
            <p className="stat-label">POINTS</p>
            <p className="stat-value" style={{ color: "#f6e05e" }}>
              {loading ? "…" : points}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">CLASSEMENT</p>
            <p className="stat-value">—</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">PARIS PLACÉS</p>
            <p className="stat-value">—</p>
          </div>
        </div>

        {/* ── Informations ── */}
        <section style={{ marginTop: "3rem", marginBottom: "2rem" }}>
          <div className="tournois-section-header">
            <h2 className="section-title">Informations du compte</h2>
          </div>
          <div className="profil-info-list">
            <div className="profil-info-row">
              <span className="profil-info-key">👤 Nom Òutilisateur</span>
              <span className="profil-info-val">
                {loading ? "…" : fullUser?.username ?? user?.username ?? "—"}
              </span>
            </div>
            <div className="profil-info-row">
              <span className="profil-info-key">✉️ Email</span>
              <span className="profil-info-val">
                {loading ? "…" : fullUser?.email ?? "—"}
              </span>
            </div>
            <div className="profil-info-row">
              <span className="profil-info-key">🛡️ Rôle</span>
              <span className="profil-info-val">
                {loading ? "…" : isAdmin ? "Administrateur" : "Joueur"}
              </span>
            </div>
            <div className="profil-info-row no-border">
              <span className="profil-info-key">💰 Solde de points</span>
              <span className="profil-info-val" style={{ color: "#f6e05e" }}>
                {loading ? "…" : `${points} pts`}
              </span>
            </div>
          </div>
        </section>

        {/* ── Actions ── */}
        <div className="profil-actions-row">
          <Link href="/historique" className="voir-plus-btn">
            📋 Historique des paris
          </Link>
          <button className="profil-logout-btn" onClick={logout}>
            🚪 Se déconnecter
          </button>
        </div>

      </div>
    </div>
  )
}
