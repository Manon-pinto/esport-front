import Link from "next/link"
import type { Match } from "@/lib/api"

const BoltCorner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => (
  <svg
    className={`card-bolt card-bolt-${pos}`}
    width="16" height="16" viewBox="0 0 24 24"
    fill="#f6e05e" stroke="#f6e05e" strokeWidth="1"
    strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "live"
  const date = new Date(match.scheduledAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  })

  return (
    <div className={`match-card storm-card ${isLive ? "match-card-live" : ""}`}>
      <BoltCorner pos="tl" />
      <BoltCorner pos="tr" />
      <BoltCorner pos="bl" />
      <BoltCorner pos="br" />
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
          <span className="match-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {date}
          </span>
          <span className="match-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            {match.tournamentId.name}
          </span>
        </div>
        <Link href="/paris" className="match-btn">Parier</Link>
      </div>
    </div>
  )
}