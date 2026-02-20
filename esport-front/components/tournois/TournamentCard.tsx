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

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const gameIcon = GAME_ICON[tournament.game] ?? "🎮"

  return (
    <div className="tournoi-card">
      <div className="tournoi-banner">
        <span className="tournoi-banner-name">{tournament.name}</span>
      </div>
      <div className="tournoi-body">
        <p className="tournoi-game">{gameIcon} {tournament.game}</p>
        <p className="tournoi-location">📍 {tournament.location || "—"}</p>
        <p className="tournoi-date">📅 {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</p>
        <p className="tournoi-prize">{formatPrize(tournament.prizePool)}</p>
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
