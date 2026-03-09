import { notFound } from "next/navigation"
import Link from "next/link"
import { getTournamentById, getMatchs } from "@/lib/api"
import MatchCard from "@/components/matchs/MatchCard"

const STATUS_LABEL: Record<string, string> = {
  upcoming:  "À VENIR",
  ongoing:   "EN COURS",
  completed: "TERMINÉ",
  cancelled: "ANNULÉ",
}

function formatDate(raw: string) {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function formatPrize(n: number) {
  if (!n || isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-FR").format(n) + " pts"
}

export default async function TournoiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tournament, allMatchs] = await Promise.all([
    getTournamentById(id),
    getMatchs(),
  ])

  if (!tournament) notFound()

  const matchs    = allMatchs.filter((m) => m.tournamentId._id === id)
  const live      = matchs.filter((m) => m.status === "live")
  const scheduled = matchs.filter((m) => m.status === "scheduled")
  const finished  = matchs.filter((m) => m.status === "finished")
  const isLive    = tournament.status === "ongoing"

  return (
    <div className="main-content">

      {/* Retour */}
      <div className="td-wrapper">
        <Link href="/tournois" className="voir-plus-btn">← Tous les tournois</Link>
      </div>

      {/* Bannière */}
      <div className={`td-hero${isLive ? " td-hero--live" : ""}`}>
        <div className="td-hero-glow" />
        <div className="td-hero-banner-inner">
          <span className={`tournoi-badge tournoi-badge-${tournament.status}`} style={{ marginBottom: "0.75rem" }}>
            {isLive && <span className="live-dot" style={{ marginRight: 6 }} />}BO1
            {STATUS_LABEL[tournament.status]}
          </span>
          <h1 className="td-title">{tournament.name}</h1>
          <p className="td-detail-game">{tournament.game}</p>
        </div>
      </div>

      <div className="td-info-grid">
        <div className="td-info-card">
          <span className="td-info-card-label">Prize Pool</span>
          <span className="td-info-card-value td-info-card-value--prize">{formatPrize(tournament.prizePool)}</span>
        </div>
        <div className="td-info-card">
          <span className="td-info-card-label">Lieu</span>
          <span className="td-info-card-value">{tournament.location || "—"}</span>
        </div>
        <div className="td-info-card">
          <span className="td-info-card-label">Début</span>
          <span className="td-info-card-value">{formatDate(tournament.startDate)}</span>
        </div>
        <div className="td-info-card">
          <span className="td-info-card-label">Fin</span>
          <span className="td-info-card-value">{formatDate(tournament.endDate)}</span>
        </div>
      </div>
      </div>
  )
}
