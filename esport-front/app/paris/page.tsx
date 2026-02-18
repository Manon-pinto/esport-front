import { getTournaments, getMatchs } from "@/lib/api"

export default async function HomePage() {
  const tournaments = await getTournaments()
  const matchs = await getMatchs()

  return (
    <div className="main-content">
      {/* HERO */}
      <div className="hero">
      </div>
    </div> )
}