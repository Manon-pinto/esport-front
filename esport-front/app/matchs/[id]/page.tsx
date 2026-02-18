import { notFound } from "next/navigation"
import Link from "next/link"
import { getMatchById } from "@/lib/api"

const STATUS_LABEL: Record<string, string> = {
  scheduled:  "À VENIR",
  live:       "EN DIRECT",
  finished:   "TERMINÉ",
  completed:  "TERMINÉ",
  cancelled:  "ANNULÉ",
}

const GAME_ICON: Record<string, string> = {
  "League of Legends": "🏆",
  "Valorant":          "🎯",
  "CS:GO":             "💥",
  "CS2":               "💥",
  "Dota 2":            "🗡️",
  "Overwatch":         "🛡️",
  "Rocket League":     "🚀",
  "Rainbow Six Siege": "🔵",
}

function formatDate(raw: string) {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const match = await getMatchById(id)

  if (!match) notFound()

  const isLive      = match.status === "live"
  const isFinished  = match.status === "finished" || match.status === "completed"
  const isCancelled = match.status === "cancelled"
  const canBet      = match.status === "scheduled" || match.status === "live"

  const gameIcon = GAME_ICON[match.tournamentId.game] ?? "🎮"

  const team1Won = isFinished && match.winnerId?._id === match.team1Id._id
  const team2Won = isFinished && match.winnerId?._id === match.team2Id._id

  return (
    <div className="main-content">

      {/* Retour */}
      <div className="md-wrapper">
        <Link href="/matchs" className="voir-plus-btn">← Tous les matchs</Link>
      </div>

      {/* Hero */}
      <div className={`md-hero${isLive ? " md-hero--live" : ""}${isCancelled ? " md-hero--cancelled" : ""}`}>
        <div className="md-hero-glow" />

        {/* Badge statut */}
        <div className="md-status-row">
          <span className={`md-status-badge md-status-badge--${match.status}`}>
            {isLive && <span className="live-dot" style={{ marginRight: 6 }} />}
            {STATUS_LABEL[match.status]}
          </span>
          <span className="md-tournament-label">
            {gameIcon} {match.tournamentId.name}
          </span>
        </div>

        {/* Équipes + score */}
        <div className="md-versus">
          {/* Équipe 1 */}
          <div className={`md-team${team1Won ? " md-team--winner" : ""}${isFinished && !team1Won ? " md-team--loser" : ""}`}>
            <div className="md-team-avatar">{match.team1Id.tag[0]}</div>
            <div className="md-team-info">
              <span className="md-team-tag">{match.team1Id.tag}</span>
              <span className="md-team-name">{match.team1Id.name}</span>
            </div>
            {team1Won && <span className="md-winner-crown">👑</span>}
          </div>

          {/* Score / VS */}
          <div className="md-score-block">
            {(isLive || isFinished) ? (
              <div className="md-scores">
                <span className={`md-score${team1Won ? " md-score--win" : ""}${team2Won && !team1Won ? " md-score--lose" : ""}`}>
                  {match.scoreTeam1}
                </span>
                <span className="md-score-sep">:</span>
                <span className={`md-score${team2Won ? " md-score--win" : ""}${team1Won && !team2Won ? " md-score--lose" : ""}`}>
                  {match.scoreTeam2}
                </span>
              </div>
            ) : (
              <span className="md-vs-text">VS</span>
            )}
            <span className="md-bo-tag">BO{match.bestOf}</span>
          </div>

          {/* Équipe 2 */}
          <div className={`md-team md-team--right${team2Won ? " md-team--winner" : ""}${isFinished && !team2Won ? " md-team--loser" : ""}`}>
            {team2Won && <span className="md-winner-crown">👑</span>}
            <div className="md-team-info md-team-info--right">
              <span className="md-team-tag">{match.team2Id.tag}</span>
              <span className="md-team-name">{match.team2Id.name}</span>
            </div>
            <div className="md-team-avatar">{match.team2Id.tag[0]}</div>
          </div>
        </div>

        {/* Bouton parier */}
        {canBet && (
          <div className="md-bet-row">
            <Link href="/paris" className="md-bet-btn">
              💰 Parier sur ce match
            </Link>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="md-info-grid">
        <div className="md-info-card">
          <span className="md-info-label">Tournoi</span>
          <span className="md-info-value">
            <Link href={`/tournois/${match.tournamentId._id}`} className="md-info-link">
              {match.tournamentId.name}
            </Link>
          </span>
        </div>
        <div className="md-info-card">
          <span className="md-info-label">Jeu</span>
          <span className="md-info-value">{gameIcon} {match.tournamentId.game}</span>
        </div>
        <div className="md-info-card">
          <span className="md-info-label">Date</span>
          <span className="md-info-value">{formatDate(match.scheduledAt)}</span>
        </div>
        <div className="md-info-card">
          <span className="md-info-label">Format</span>
          <span className="md-info-value">BO{match.bestOf} — {match.bestOf === 1 ? "1 manche" : `Meilleur sur ${match.bestOf}`}</span>
        </div>
      </div>

      {/* Résultat final */}
      {isFinished && match.winnerId && (
        <div className="md-wrapper">
          <div className="md-result-card">
            <span className="md-result-label">Vainqueur</span>
            <div className="md-result-winner">
              <span className="md-result-crown">👑</span>
              <span className="md-result-tag">{match.winnerId.tag}</span>
              <span className="md-result-name">{match.winnerId.name}</span>
            </div>
            <div className="md-result-score">
              {match.scoreTeam1} – {match.scoreTeam2}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
