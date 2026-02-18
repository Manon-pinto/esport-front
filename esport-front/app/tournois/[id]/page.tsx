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
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function formatPrize(n: number) {
  if (!n || isNaN(n)) return "—"
  return new Intl.NumberFormat("fr-FR").format(n) + " €"
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
  const gameIcon  = GAME_ICON[tournament.game] ?? "🎮"

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
          <p className="td-detail-game">{gameIcon} {tournament.game}</p>
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

      {/* Matchs */}
      <div className="td-wrapper">
        <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>
          Matchs
          {matchs.length > 0 && (
            <span style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-muted)", marginLeft: 10 }}>
              {matchs.length} match{matchs.length > 1 ? "s" : ""}
            </span>
          )}
        </h2>

        {matchs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem 0" }}>
            Aucun match pour ce tournoi.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {live.length > 0 && (
              <div>
                <p className="matchs-section-title">
                  <span className="live-dot" style={{ display: "inline-block", marginRight: 8 }} />
                  En direct
                </p>
                <div className="matches-list">
                  {live.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              </div>
            )}
            {scheduled.length > 0 && (
              <div>
                <p className="matchs-section-title">À venir</p>
                <div className="matches-list">
                  {scheduled.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              </div>
            )}
            {finished.length > 0 && (
              <div>
                <p className="matchs-section-title matchs-section-title--muted">Terminés</p>
                <div className="matches-list">
                  {finished.map((m) => <MatchCard key={m._id} match={m} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
