import Link from "next/link"
import { getMatchs } from "@/lib/api"

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
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function MatchsPage() {
  const matchs = await getMatchs()

  const live      = matchs.filter((m) => m.status === "live")
  const scheduled = matchs.filter((m) => m.status === "scheduled")
  const finished  = matchs.filter((m) => m.status === "finished" || m.status === "completed")

  return (
    <div className="main-content">

      {/* En-tête */}
      <div className="tournois-page-header">
        <div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>
            Matchs
          </h1>
          <p className="tournois-page-sub">
            {matchs.length} match{matchs.length > 1 ? "s" : ""} au total
            {live.length > 0 && (
              <span className="tournois-live-indicator">
                <span className="live-dot" />
                {live.length} en direct
              </span>
            )}
          </p>
        </div>
      </div>

      {matchs.length === 0 ? (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "4rem 0" }}>
          Aucun match disponible.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

          {/* EN DIRECT */}
          {live.length > 0 && (
            <section>
              <p className="matchs-section-title">
                <span className="live-dot" style={{ display: "inline-block", marginRight: 8 }} />
                En direct
              </p>
              <div className="matches-list">
                {live.map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
              </div>
            </section>
          )}

          {/* À VENIR */}
          {scheduled.length > 0 && (
            <section>
              <p className="matchs-section-title">À venir</p>
              <div className="matches-list">
                {scheduled.map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
              </div>
            </section>
          )}

          {/* TERMINÉS */}
          {finished.length > 0 && (
            <section>
              <p className="matchs-section-title matchs-section-title--muted">Terminés</p>
              <div className="matches-list">
                {finished.map((m) => (
                  <MatchRow key={m._id} match={m} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}

function MatchRow({ match }: { match: Awaited<ReturnType<typeof getMatchs>>[number] }) {
  const isLive     = match.status === "live"
  const isFinished = match.status === "finished" || match.status === "completed"
  const canBet     = match.status === "scheduled" || match.status === "live"
  const gameIcon   = GAME_ICON[match.tournamentId.game] ?? "🎮"

  return (
    <div className={`match-card ${isLive ? "match-card-live" : ""}`}>
      {isLive && (
        <div className="match-live-pill">
          <span className="live-dot" />
          LIVE
        </div>
      )}

      <div className="match-teams">
        {/* Équipe 1 */}
        <div className="match-team">
          <div className="team-avatar">{match.team1Id.tag[0]}</div>
          <div className="team-info">
            <span className="team-tag">{match.team1Id.tag}</span>
            <span className="team-name">{match.team1Id.name}</span>
          </div>
          {(isLive || isFinished) && (
            <span className={`match-score${match.winnerId?._id === match.team1Id._id ? " match-score--win" : isFinished ? " match-score--lose" : ""}`}>
              {match.scoreTeam1}
            </span>
          )}
        </div>

        {/* Centre */}
        <div className="match-center">
          <span className="match-vs">VS</span>
          <span className="match-bo">BO{match.bestOf}</span>
        </div>

        {/* Équipe 2 */}
        <div className="match-team match-team-right">
          {(isLive || isFinished) && (
            <span className={`match-score${match.winnerId?._id === match.team2Id._id ? " match-score--win" : isFinished ? " match-score--lose" : ""}`}>
              {match.scoreTeam2}
            </span>
          )}
          <div className="team-info team-info-right">
            <span className="team-tag">{match.team2Id.tag}</span>
            <span className="team-name">{match.team2Id.name}</span>
          </div>
          <div className="team-avatar">{match.team2Id.tag[0]}</div>
        </div>
      </div>

      <div className="match-footer">
        <div className="match-meta">
          <span>📅 {formatDate(match.scheduledAt)}</span>
          <span>{gameIcon} {match.tournamentId.name}</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {canBet && (
            <Link href="/paris" className="match-btn">Parier</Link>
          )}
          <Link href={`/matchs/${match._id}`} className="match-btn" style={{ background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)" }}>
            Détails →
          </Link>
        </div>
      </div>
    </div>
  )
}
