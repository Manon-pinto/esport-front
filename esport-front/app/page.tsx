import TournamentCard from "@/components/tournois/TournamentCard"
import MatchCard from "@/components/matchs/MatchCard"
import DashboardStatsClient from "@/components/DashboardStatsClient"
import Link from "next/link"
import { getTournaments, getMatchs } from "@/lib/api"

export default async function HomePage() {
  const tournaments = await getTournaments()
  const matchs = await getMatchs()

  return (
    <div className="main-content">
      <div className="hero">
        <h1 className="hero-title">Bienvenue sur LA plateforme Esport Pro</h1>
        <p className="hero-subtitle">
          Suivez les tournois, placez vos paris et gagnez des points virtuels !
        </p>
        <Link href="/tournois" className="hero-btn">
          Voir les tournois en cours
        </Link>
      </div>

      <DashboardStatsClient />

      <section className="tournois-section">
        <div className="tournois-section-header">
          <h2 className="section-title">Tournois en vedette</h2>
          <Link href="/tournois" className="voir-plus-btn">Voir tout →</Link>
        </div>
        <div className="tournois-grid">
          {tournaments.map((t) => (
            <TournamentCard key={t._id} tournament={t} />
          ))}
        </div>
      </section>

      <section className="tournois-section">
        <div className="tournois-section-header">
          <h2 className="section-title">Prochains matchs</h2>
          <Link href="/matchs" className="voir-plus-btn">Voir tout →</Link>
        </div>
        <div className="matches-list">
          {matchs.slice(0, 2).map((m) => (
            <MatchCard key={m._id} match={m} />
          ))}
        </div>
      </section>
    </div>
  )
}
