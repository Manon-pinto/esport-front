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
  const { isAuthenticated, user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const [fullUser, setFullUser] = useState<FullUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return }
    const token = localStorage.getItem("token")
    if (!token) return
    refreshUser()
    fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setFullUser(data.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated, router, refreshUser])

  if (!isAuthenticated) return null

  const initiales = user?.username?.slice(0, 2).toUpperCase() ?? "??"
  const isAdmin = fullUser?.role === "admin"
  const points = (fullUser?.points ?? user?.points ?? 0).toLocaleString()

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* En-tête profil */}
        <div className="profil-header">
          <div className="profil-avatar-initiales">{initiales}</div>
          <div className="profil-header-info">
            <h1 className="section-title" style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>
              {user?.username}
            </h1>
            <div className="profil-header-meta">
              {fullUser?.role && (
                <span className={`tournoi-badge ${isAdmin ? "tournoi-badge-live" : "tournoi-badge-upcoming"}`}>
                  {isAdmin ? "Admin" : "Parieur"}
                </span>
              )}
              {fullUser?.email && (
                <span className="profil-header-email">{fullUser.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: "grid", marginTop: "2rem" }}>
          <div className="stat-card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f6e05e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <p className="stat-label">POINTS</p>
            <p className="stat-value" style={{ color: "#f6e05e" }}>
              {loading ? "…" : points}
            </p>
          </div>
          <div className="stat-card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}>
              <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
            </svg>
            <p className="stat-label">CLASSEMENT</p>
            <p className="stat-value">—</p>
          </div>
          <div className="stat-card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem" }}>
              <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
            <p className="stat-label">PARIS PLACÉS</p>
            <p className="stat-value">—</p>
          </div>
        </div>

        {/* Informations */}
        <section style={{ marginTop: "3rem", marginBottom: "2rem" }}>
          <div className="tournois-section-header">
            <h2 className="section-title">Informations du compte</h2>
          </div>
          <div className="profil-info-list">
            <div className="profil-info-row">
              <span className="profil-info-key">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Nom d&apos;utilisateur
              </span>
              <span className="profil-info-val">
                {loading ? "…" : fullUser?.username ?? user?.username ?? "—"}
              </span>
            </div>
            <div className="profil-info-row">
              <span className="profil-info-key">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Email
              </span>
              <span className="profil-info-val">
                {loading ? "…" : fullUser?.email ?? "—"}
              </span>
            </div>
            <div className="profil-info-row no-border">
              <span className="profil-info-key">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f6e05e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8.5 10h7M8.5 14h7"/>
                </svg>
                Solde de points
              </span>
              <span className="profil-info-val" style={{ color: "#f6e05e" }}>
                {loading ? "…" : `${points} pts`}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="profil-actions-row">
          <Link href="/historique" className="voir-plus-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/>
            </svg>
            Historique des paris
          </Link>
          <button className="profil-logout-btn" onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  )
}
