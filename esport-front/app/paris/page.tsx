"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getMatchs, type Match } from "@/lib/api"
import MatchCard from "@/components/matchs/MatchCard"

export default function ParisPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [matchs, setMatchs] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

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

  if (!isAuthenticated) return null

  const points = user?.points ?? 0

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* En-tête */}
        <div className="paris-header">
          <div>
            <h1 className="section-title" style={{ fontSize: "1.8rem" }}>
              💰 Paris sportifs
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
              Choisissez un match et pariez vos points virtuels
            </p>
          </div>
          <div className="paris-solde">
            <span className="paris-solde-label">Votre solde</span>
            <span className="paris-solde-value">{points.toLocaleString()} pts</span>
          </div>
        </div>

        {/* Liste des matchs */}
        {loading ? (
          <div className="hist-empty">Chargement des matchs…</div>
        ) : matchs.length === 0 ? (
          <div className="hist-empty">
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎮</p>
            <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Aucun match disponible</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Il n&apos;y a actuellement aucun match ouvert aux paris.
            </p>
            <Link href="/matchs" className="voir-plus-btn" style={{ marginTop: "1.25rem", display: "inline-block" }}>
              Voir tous les matchs
            </Link>
          </div>
        ) : (
          <div className="matches-list">
            {matchs.map((m) => (
              <div key={m.id}>
                <MatchCard match={m} />
              </div>
            ))}
          </div>
              )}
            </div>
          </div>
        )
      }