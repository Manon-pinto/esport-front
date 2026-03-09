"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { placeBet, type Match } from "@/lib/api"

interface ParisFormProps {
  match: Match
  userPoints: number
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function ParisForm({ match, userPoints, onClose, onSuccess }: ParisFormProps) {
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!selectedTeamId) return

    const mise = parseInt(amount, 10)
    if (isNaN(mise) || mise < 10) {
      setErrorMsg("La mise minimum est de 10 points.")
      return
    }
    if (mise > Math.min(userPoints, 1000)) {
      setErrorMsg(mise > 1000 ? "La mise maximum est de 1000 points." : "Mise supérieure à votre solde de points.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) { 
      router.push("/auth/login")
      return 
    }

    setSubmitting(true)
    setErrorMsg(null)
    try {
      await placeBet(token, match._id, selectedTeamId, mise, 1.9)
      onSuccess("Pari placé avec succès !")
      onClose()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur lors du pari.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
            Mise (min 10 — max {Math.min(userPoints, 1000).toLocaleString()} pts)
          </label>
          <div className="paris-amount-row">
            <input
              id={`amount-${match._id}`}
              type="number"
              min={10}
              max={Math.min(userPoints, 1000)}
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
                  onClick={() => setAmount(String(Math.min(q, userPoints)))}
                >
                  {q}
                </button>
              ))}
              <button
                type="button"
                className="paris-quick-btn"
                onClick={() => setAmount(String(userPoints))}
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
            onClick={onClose}
            disabled={submitting}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}