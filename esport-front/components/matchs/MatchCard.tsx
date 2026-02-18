import Link from "next/link"

interface Match {
  _id: string
  team1Id: { _id: string; name: string; tag: string }
  team2Id: { _id: string; name: string; tag: string }
  scheduledAt: string
  status: "scheduled" | "live" | "finished"
  tournamentId: { _id: string; name: string; game: string }
  bestOf: number
  scoreTeam1: number
  scoreTeam2: number
}

export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live"
  const date = new Date(match.scheduledAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  })

  return (
    <div className={`match-card ${isLive ? "match-card-live" : ""}`}>
      {isLive && (
        <div className="match-live-pill">
          <span className="live-dot" />
          LIVE
        </div>
      )}

      <div className="match-teams">
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

      <div className="match-footer">
        <div className="match-meta">
          <span>📅 {date}</span>
          <span>🏆 {match.tournamentId.name}</span>
        </div>
        <Link href="/paris" className="match-btn">Parier</Link>
      </div>
    </div>
  )
}