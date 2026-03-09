import Link from "next/link"
import { Tournament } from "@/lib/api"

function formatDate(raw: string) {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR")
}

function formatPrize(n: number) {
  if (!n || isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-FR").format(n) + " pts"
}

const STATUS_LABEL: Record<string, string> = {
  upcoming:  "À VENIR",
  ongoing:   "EN COURS",
  completed: "TERMINÉ",
  cancelled: "ANNULÉ",
}

const BoltCorner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => (
  <svg
    className={`card-bolt card-bolt-${pos}`}
    width="18" height="18" viewBox="0 0 24 24"
    fill="#f6e05e" stroke="#f6e05e" strokeWidth="1"
    strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <div className="tournoi-card storm-card">
      <BoltCorner pos="tl" />
      <BoltCorner pos="tr" />
      <BoltCorner pos="bl" />
      <BoltCorner pos="br" />
      <div className="tournoi-banner">
        <span className="tournoi-banner-name">{tournament.name}</span>
      </div>
      <div className="tournoi-body">

        <p className="tournoi-game">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><circle cx="17" cy="12" r="1"/><circle cx="19" cy="10" r="1"/><path d="M8 12h.01M6 10v4"/>
          </svg>
          {tournament.game}
        </p>

        <p className="tournoi-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {tournament.location || "—"}
        </p>

        <p className="tournoi-date">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
        </p>

        <p className="tournoi-prize">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f6e05e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          {formatPrize(tournament.prizePool)}
        </p>

        <div className="tournoi-footer">
          <span className={`tournoi-badge tournoi-badge-${tournament.status}`}>
            {tournament.status === "ongoing" && <span className="live-dot" style={{ marginRight: 5 }} />}
            {STATUS_LABEL[tournament.status] ?? tournament.status}
          </span>
          <Link href={`/tournois/${tournament._id}`} className="tournoi-btn">Voir →</Link>
        </div>
      </div>
    </div>
  )
}
