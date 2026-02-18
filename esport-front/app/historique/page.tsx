"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getBets, type Bet } from "@/lib/api"

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  won: "Gagné",
  lost: "Perdu",
  cancelled: "Annulé",
}

const STATUS_CLASS: Record<string, string> = {
  pending: "hist-badge-pending",
  won: "hist-badge-won",
  lost: "hist-badge-lost",
  cancelled: "hist-badge-cancelled",
}

export default function HistoriquePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return }
    const token = localStorage.getItem("token")
    if (!token) return

    getBets(token)
      .then((data) => setBets(data))
      .finally(() => setLoading(false))
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const totalGains = bets.filter((b) => b.status === "won").reduce((s, b) => s + b.potentialWin, 0)
  const nbGagnes = bets.filter((b) => b.status === "won").length
  const nbPerdus = bets.filter((b) => b.status === "lost").length

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* En-tête */}
        <div className="tournois-section-header" style={{ marginBottom: "2rem" }}>
          <div>
            <Link href="/profil" className="voir-plus-btn">← Retour au profil</Link>
            <h1 className="section-title" style={{ fontSize: "1.8rem", marginTop: "0.5rem" }}>
              Historique des paris
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: "2.5rem" }}>
          <div className="stat-card">
            <p className="stat-label">PARIS PLACÉS</p>
            <p className="stat-value">{loading ? "…" : bets.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">GAGNÉS / PERDUS</p>
            <p className="stat-value">
              <span style={{ color: "#4ade80" }}>{loading ? "…" : nbGagnes}</span>
              <span style={{ color: "#64748b", fontSize: "1rem", margin: "0 6px" }}>/</span>
              <span style={{ color: "#f87171" }}>{loading ? "…" : nbPerdus}</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">GAINS TOTAUX</p>
            <p className="stat-value" style={{ color: "#f6e05e" }}>
              {loading ? "…" : `${totalGains.toLocaleString()} pts`}
            </p>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="hist-empty">Chargement…</div>
        ) : bets.length === 0 ? (
          <div className="hist-empty">
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</p>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Aucun pari trouvé</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Vous n&apos;avez pas encore placé de paris.
            </p>
            <Link href="/matchs" className="voir-plus-btn" style={{ marginTop: "1.25rem", display: "inline-block" }}>
              Voir les matchs
            </Link>
          </div>
        ) : (
          <div className="matches-list">
            {bets.map((bet) => {
              const match = bet.matchId
              const isWon = bet.status === "won"
              const isLost = bet.status === "lost"
              const date = new Date(bet.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit", month: "short", year: "numeric",
              })
              const matchDate = match?.scheduledAt
                ? new Date(match.scheduledAt).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", year: "numeric",
                  })
                : "—"

              return (
                <div
                  key={bet._id}
                  className={`match-card hist-card${isWon ? " hist-card-won" : isLost ? " hist-card-lost" : ""}`}
                >
                  <div className="hist-card-top">
                    <div className="hist-match-teams">
                      <span className="hist-team">{match?.team1Id?.tag ?? "???"}</span>
                      <span className="hist-vs">VS</span>
                      <span className="hist-team">{match?.team2Id?.tag ?? "???"}</span>
                    </div>

                    <span className={`tournoi-badge ${STATUS_CLASS[bet.status]}`}>
                      {bet.status === "won" && "✓ "}
                      {bet.status === "lost" && "✗ "}
                      {STATUS_LABEL[bet.status]}
                    </span>
                  </div>

                  <div className="hist-prediction">
                    Prédit :{" "}
                    <strong style={{ color: "#a78bfa" }}>
                      {bet.predictedWinnerId?.tag ?? "—"} ({bet.predictedWinnerId?.name ?? "—"})
                    </strong>
                  </div>

                  <div className="hist-card-footer">
                    <div className="hist-finance">
                      <div className="hist-finance-item">
                        <span className="hist-finance-label">Mise</span>
                        <span className="hist-finance-val">{bet.amount.toLocaleString()} pts</span>
                      </div>
                      <div className="hist-finance-sep" />
                      <div className="hist-finance-item">
                        <span className="hist-finance-label">Cote</span>
                        <span className="hist-finance-val">×{bet.odds.toFixed(2)}</span>
                      </div>
                      <div className="hist-finance-sep" />
                      <div className="hist-finance-item">
                        <span className="hist-finance-label">Gain potentiel</span>
                        <span
                          className="hist-finance-val"
                          style={{ color: isWon ? "#4ade80" : isLost ? "#f87171" : "#f6e05e" }}
                        >
                          {isWon ? "+" : ""}{bet.potentialWin.toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    <div className="hist-dates">
                      <span>🎮 Match : {matchDate}</span>
                      <span>📅 Paris : {date}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
