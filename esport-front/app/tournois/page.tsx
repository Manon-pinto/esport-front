import { getTournaments } from "@/lib/api"
import TournoiList from "@/components/tournois/TournoiList"

export default async function TournoisPage() {
  const tournaments = await getTournaments()

  const liveCount = tournaments.filter((t) => t.status === "ongoing").length

  return (
    <div className="main-content">
      <div className="tournois-page-header">
        <div>
          <h1 className="section-title" style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>
            Tournois
          </h1>
          <p className="tournois-page-sub">
            {tournaments.length} tournoi{tournaments.length > 1 ? "s" : ""} au total
            {liveCount > 0 && (
              <span className="tournois-live-indicator">
                <span className="live-dot" />
                {liveCount} en direct
              </span>
            )}
          </p>
        </div>
      </div>

      <TournoiList tournaments={tournaments} />
    </div>
  )
}
