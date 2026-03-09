"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getMatchs, type Match } from "@/lib/api"
import PariForm from "@/components/paris/PariForm"

function formatDate(raw: string) {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  })
}

export default function ParisPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [matchs, setMatchs] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0)

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return }
    getMatchs()
      .then((data) => {
        const bettable = data.filter(
          (m) => m.status === "scheduled" || m.status === "live"
        )
        setMatchs(bettable)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  // Sync points depuis le user (rafraîchis depuis /api/auth/me après chaque pari)
  useEffect(() => {
    setUserPoints(user?.points ?? 0)
  }, [user?.points])

  // Rafraîchir les points après un pari réussi
  async function refreshPoints() {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.user?.points !== undefined) setUserPoints(data.user.points)
      }
    } catch {}
  }

  if (!isAuthenticated) return null

  const points = userPoints.toLocaleString()

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* En-tête */}
        <div className="paris-header">
          <div>
            <h1 className="section-title" style={{ fontSize: "1.8rem" }}>
              Paris sportifs
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
              Choisissez un match et pariez vos points virtuels
            </p>
          </div>
          <div className="paris-solde">
            <span className="paris-solde-label">Votre solde</span>
            <span className="paris-solde-value">{points} pts</span>
          </div>
        </div>

        {/* Message de succès */}
        {successMsg && (
          <div className="paris-alert paris-alert-success" style={{ marginTop: "1rem" }}>
            {successMsg}
          </div>
        )}

        {/* Liste des matchs */}
        {loading ? (
          <div className="hist-empty">Chargement des matchs…</div>
        ) : matchs.length === 0 ? (
          <div className="hist-empty">
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Aucun match disponible</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Il n&apos;y a actuellement aucun match ouvert aux paris.
            </p>
            <Link href="/matchs" className="voir-plus-btn" style={{ marginTop: "1.25rem", display: "inline-block" }}>
              Voir tous les matchs
            </Link>
          </div>
        ) : (
          <div className="matches-list" style={{ marginTop: "2rem" }}>
            {matchs.map((m) => {
              const isLive = m.status === "live"
              const isSelected = selectedMatch?._id === m._id

              return (
                <div
                  key={m._id}
                  className={`match-card ${isLive ? "match-card-live" : ""}${isSelected ? " match-card-selected" : ""}`}
                >
                  {isLive && (
                    <div className="match-live-pill">
                      <span className="live-dot" />
                      LIVE
                    </div>
                  )}

                  {/* Équipes */}
                  <div className="match-teams">
                    <div className="match-team">
                      <div className="team-avatar">{m.team1Id.tag[0]}</div>
                      <div className="team-info">
                        <span className="team-tag">{m.team1Id.tag}</span>
                        <span className="team-name">{m.team1Id.name}</span>
                      </div>
                      {isLive && <span className="match-score">{m.scoreTeam1}</span>}
                    </div>

                    <div className="match-center">
                      <span className="match-vs">VS</span>
                      <span className="match-bo">BO{m.bestOf}</span>
                    </div>

                    <div className="match-team match-team-right">
                      {isLive && <span className="match-score">{m.scoreTeam2}</span>}
                      <div className="team-info team-info-right">
                        <span className="team-tag">{m.team2Id.tag}</span>
                        <span className="team-name">{m.team2Id.name}</span>
                      </div>
                      <div className="team-avatar">{m.team2Id.tag[0]}</div>
                    </div>
                  </div>

                  {/* Pied de carte */}
                  <div className="match-footer">
                    <div className="match-meta">
                      <span>{formatDate(m.scheduledAt)}</span>
                      <span>{m.tournamentId.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="match-btn"
                        onClick={() => setSelectedMatch(isSelected ? null : m)}
                        style={isSelected ? { background: "rgba(246,224,94,0.15)", border: "1px solid #f6e05e", color: "#f6e05e" } : {}}
                      >
                        {isSelected ? "Fermer" : "Parier"}
                      </button>
                      <Link
                        href={`/matchs/${m._id}`}
                        className="match-btn"
                        style={{ background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)" }}
                      >
                        Détails →
                      </Link>
                    </div>
                  </div>

                  {/* Formulaire inline si ce match est sélectionné */}
                  {isSelected && (
                    <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                      <PariForm
                        match={m}
                        userPoints={userPoints}
                        onClose={() => setSelectedMatch(null)}
                        onSuccess={(msg) => {
                          setSuccessMsg(msg)
                          setSelectedMatch(null)
                          refreshPoints()
                          setTimeout(() => setSuccessMsg(null), 4000)
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
