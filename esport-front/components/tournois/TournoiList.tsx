import TournamentCard from "./TournamentCard"
import type { Tournament } from "@/lib/api"

export default function TournoiList({ tournaments }: { tournaments: Tournament[] }) {
  return (
    <div className="tournois-grid" style={{ maxWidth: 1280, margin: "0 auto" }}>
      {tournaments.map((t) => (
        <TournamentCard key={t._id} tournament={t} />
      ))}
    </div>
  )
}
