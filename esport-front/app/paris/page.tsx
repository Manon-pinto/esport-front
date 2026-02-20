"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getMatchs, placeBet, type Match } from "@/lib/api"

const STATUS_LABEL: Record<string, string> = {
  scheduled: "À VENIR",
  live: "EN DIRECT",
}

export default function ParisPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const [matchs, setMatchs] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  function openBetForm(match: Match) {
    setSelectedMatch(match)
    setSelectedTeamId(null)
    setAmount("")
    setSuccessMsg(null)
    setErrorMsg(null)
  }

  function closeBetForm() {
    setSelectedMatch(null)
    setSelectedTeamId(null)
    setAmount("")
    setSuccessMsg(null)
    setErrorMsg(null)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!selectedMatch || !selectedTeamId) return

    const mise = parseInt(amount, 10)
    if (isNaN(mise) || mise <= 0) {
      setErrorMsg("Veuillez entrer une mise valide.")
      return
    }
    if (mise > points) {
      setErrorMsg("Mise supérieure à votre solde de points.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) { router.push("/auth/login"); return }

    setSubmitting(true)
    setErrorMsg(null)
    try {
      await placeBet(token, selectedMatch._id, selectedTeamId, mise)
      setSuccessMsg("Pari placé avec succès !")
      setSelectedMatch(null)
      setSelectedTeamId(null)
      setAmount("")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors du pari.")
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(raw: string) {
    return new Date(raw).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    })
  }

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

        {/* Message global succès */}
        {successMsg && !selectedMatch && (
          <div className="paris-alert paris-alert-success">
            ✓ {successMsg}
            <Link href="/historique" className="paris-alert-link">Voir mes paris →</Link>
          </div>
        )}

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
            {matchs.map((match) => {
              const isLive = match.status === "live"
              const isOpen = selectedMatch?._id === match._id

              return (
                <div key={match._id} className={`paris-match-card${isLive ? " paris-match-card--live" : ""}`}>

                  {/* Badge statut */}
                  <div className="paris-match-top">
                    <span className={`md-status-badge md-status-badge--${match.status}`}>
                      {isLive && <span className="live-dot" style={{ marginRight: 5 }} />}
                      {STATUS_LABEL[match.status]}
                    </span>
                    <span className="paris-match-meta">
                      🏆 {match.tournamentId.name} &nbsp;·&nbsp; 📅 {formatDate(match.scheduledAt)}
                    </span>
                  </div>

                  {/* Équipes */}
                  <div className="match-teams" style={{ marginTop: "0.75rem" }}>
                    <div className="match-team">
                      <div className="team-avatar">{match.team1Id.tag[0]}</div>
                      <div className="team-info">
                        <span className="team-tag">{match.team1Id.tag}</span>
                        <span className="team-name">{match.team1Id.name}</span>
                      </div>
                      {isLive && <span className="match-score">{match.scoreTeam1}</span>}
                    </div>
                    <div className="match-center">
                      <span className="match-vs">VS</span>
                      <span className="match-bo">BO{match.bestOf}</span>
                    </div>
                    <div className="match-team match-team-right">
                      {isLive && <span className="match-score">{match.scoreTeam2}</span>}
                      <div className="team-info team-info-right">
                        <span className="team-tag">{match.team2Id.tag}</span>
                        <span className="team-name">{match.team2Id.name}</span>
                      </div>
                      <div className="team-avatar">{match.team2Id.tag[0]}</div>
                    </div>
                  </div>

                  {/* Bouton parier */}
                  {!isOpen && (
                    <div className="paris-match-footer">
                      <button
                        className="match-btn"
                        onClick={() => openBetForm(match)}
                      >
                        💰 Parier sur ce match
                      </button>
                    </div>
                  )}

                  {/* Formulaire de pari inline */}
                  {isOpen && (
                    <div className="paris-form-panel">
                      <h3 className="paris-form-title">Placer un pari</h3>

                      {errorMsg && (
                        <div className="paris-alert paris-alert-error">{errorMsg}</div>
                      )}

                      <form onSubmit={handleSubmit}>
                        {/* Choix de l'équipe */}
                        <p className="paris-form-label">Choisir le vainqueur :</p>
                        <div className="paris-team-choice">
                          <button
                            type="button"
                            className={`paris-team-btn${selectedTeamId === match.team1Id._id ? " paris-team-btn--selected" : ""}`}
                            onClick={() => setSelectedTeamId(match.team1Id._id)}
                          >
                            <div className="paris-team-avatar">{match.team1Id.tag[0]}</div>
                            <div>
                              <div className="paris-team-tag">{match.team1Id.tag}</div>
                              <div className="paris-team-name">{match.team1Id.name}</div>
                            </div>
                          </button>

                          <span className="paris-team-sep">VS</span>

                          <button
                            type="button"
                            className={`paris-team-btn${selectedTeamId === match.team2Id._id ? " paris-team-btn--selected" : ""}`}
                            onClick={() => setSelectedTeamId(match.team2Id._id)}
                          >
                            <div className="paris-team-avatar">{match.team2Id.tag[0]}</div>
                            <div>
                              <div className="paris-team-tag">{match.team2Id.tag}</div>
                              <div className="paris-team-name">{match.team2Id.name}</div>
                            </div>
                          </button>
                        </div>

                        {/* Mise */}
                        <div className="paris-form-field">
                          <label className="paris-form-label" htmlFor={`amount-${match._id}`}>
                            Mise (max {points.toLocaleString()} pts)
                          </label>
                          <div className="paris-amount-row">
                            <input
                              id={`amount-${match._id}`}
                              type="number"
                              min={1}
                              max={points}
                              className="auth-input paris-amount-input"
                              placeholder="ex : 100"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                            <div className="paris-quick-bets">
                              {[50, 100, 500].map((q) => (
                                <button
                                  key={q}
                                  type="button"
                                  className="paris-quick-btn"
                                  onClick={() => setAmount(String(Math.min(q, points)))}
                                >
                                  {q}
                                </button>
                              ))}
                              <button
                                type="button"
                                className="paris-quick-btn"
                                onClick={() => setAmount(String(points))}
                              >
                                MAX
                              </button>
                            </div>
                          </div>
                          {amount && !isNaN(parseInt(amount)) && parseInt(amount) > 0 && (
                            <p className="paris-gain-preview">
                              Gain potentiel estimé :{" "}
                              <strong style={{ color: "#f6e05e" }}>
                                {Math.round(parseInt(amount) * 1.9).toLocaleString()} pts
                              </strong>
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="paris-form-actions">
                          <button
                            type="submit"
                            className="auth-btn paris-submit-btn"
                            disabled={submitting || !selectedTeamId || !amount}
                          >
                            {submitting ? "Validation…" : "Valider le pari"}
                          </button>
                          <button
                            type="button"
                            className="paris-cancel-btn"
                            onClick={closeBetForm}
                            disabled={submitting}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Lien historique */}
        <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
          <Link href="/historique" className="voir-plus-btn">
            📋 Voir mes paris passés
          </Link>
        </div>

      </div>
    </div>
  )
}
