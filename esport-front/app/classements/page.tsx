"use client"

import { useEffect, useState } from "react"
import { getLeaderboard, getStandings, type LeaderboardUser, type Standing } from "@/lib/api"

type Tab = "parieurs" | "equipes"

const RANK_COLOR = ["#f6e05e", "#C0C0C0", "#CD7F32"]
const RANK_LABEL = ["1", "2", "3"]

export default function ClassementsPage() {
  const [tab, setTab] = useState<Tab>("parieurs")
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTournament, setSelectedTournament] = useState("")

  useEffect(() => {
    setLoading(true)
    Promise.all([getLeaderboard(), getStandings()])
      .then(([lb, st]) => {
        setLeaderboard(lb)
        setStandings(st)
        const first = st.find((s) => s.tournamentId)
        if (first) setSelectedTournament(first.tournamentId._id)
      })
      .finally(() => setLoading(false))
  }, [])

  const tournaments = standings.reduce<{ id: string; name: string; game: string }[]>((acc, s) => {
    if (!s.tournamentId) return acc
    if (!acc.find((t) => t.id === s.tournamentId._id))
      acc.push({ id: s.tournamentId._id, name: s.tournamentId.name, game: s.tournamentId.game })
    return acc
  }, [])

  const filteredStandings = standings
    .filter((s) => s.tournamentId?._id === selectedTournament && s.teamId)
    .sort((a, b) => b.points - a.points || b.wins - a.wins)

  return (
    <div className="main-content">
      <div className="tournois-section">

        {/* En-tête */}
        <div className="cl-header">
          <div className="cl-header-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f6e05e" }}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <div>
            <h1 className="section-title" style={{ fontSize: "1.8rem", margin: 0 }}>Classements</h1>
            <p className="cl-header-sub">Meilleurs parieurs &amp; équipes en compétition</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="cl-tabs">
          <button onClick={() => setTab("parieurs")} className={`cl-tab${tab === "parieurs" ? " cl-tab--active" : ""}`}>
            Parieurs
          </button>
          <button onClick={() => setTab("equipes")} className={`cl-tab${tab === "equipes" ? " cl-tab--active" : ""}`}>
            Equipes
          </button>
        </div>

        {/* ═══ PARIEURS ═══ */}
        {tab === "parieurs" && (
          <>
            {loading ? (
              <div className="hist-empty">Chargement…</div>
            ) : leaderboard.length === 0 ? (
              <div className="hist-empty">
                <p style={{ fontWeight: 700 }}>Aucun parieur pour l&apos;instant</p>
              </div>
            ) : (
              <div className="cl-list">
                <div className="cl-list-head">
                  <span className="cl-row-rank">#</span>
                  <span style={{ flex: 1 }}>Joueur</span>
                  <span style={{ color: "#f6e05e" }}>Points</span>
                </div>
                {leaderboard.map((u, i) => {
                  const rank = i + 1
                  return (
                    <div key={u._id} className={`cl-row${rank <= 3 ? " cl-row--medal" : ""}`}>
                      <span className="cl-row-rank" style={{ color: RANK_COLOR[rank - 1] ?? "#64748b", fontWeight: 800 }}>
                        {RANK_LABEL[rank - 1] ?? rank}
                      </span>
                      <div className="cl-row-avatar">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="cl-row-name">{u.username}</span>
                      <span className="cl-row-pts">
                        {u.points.toLocaleString()}
                        <span className="cl-pts-unit"> pts</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ═══ ÉQUIPES ═══ */}
        {tab === "equipes" && (
          <>
            {loading ? (
              <div className="hist-empty">Chargement…</div>
            ) : standings.length === 0 ? (
              <div className="hist-empty">
                <p style={{ fontWeight: 700 }}>Aucun classement disponible</p>
              </div>
            ) : (
              <>
                {/* Sélecteur tournoi */}
                {tournaments.length > 1 && (
                  <div className="cl-tourn-select">
                    {tournaments.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTournament(t.id)}
                        className={`cl-tourn-btn${selectedTournament === t.id ? " cl-tourn-btn--active" : ""}`}
                      >
                        {t.name}
                        <span className="cl-tourn-game">{t.game}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredStandings.length === 0 ? (
                  <div className="hist-empty">Aucune équipe dans ce tournoi</div>
                ) : (
                  <div className="cl-table-wrap">
                    <table className="cl-table">
                      <thead>
                        <tr>
                          <th className="cl-th" style={{ width: 48 }}>#</th>
                          <th className="cl-th" style={{ textAlign: "left" }}>Equipe</th>
                          <th className="cl-th">Matchs joués</th>
                          <th className="cl-th" style={{ color: "#4ade80" }}>Victoires</th>
                          <th className="cl-th">Nuls</th>
                          <th className="cl-th" style={{ color: "#f87171" }}>Défaites</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStandings.map((s, i) => {
                          const rank = i + 1
                          const diff = s.goalDifference
                          const rowCls = rank === 1 ? " cl-tr--gold" : rank === 2 ? " cl-tr--silver" : rank === 3 ? " cl-tr--bronze" : ""
                          return (
                            <tr key={s._id} className={`cl-tr${rowCls}`}>
                              <td className="cl-td" style={{ textAlign: "center", color: RANK_COLOR[rank - 1] ?? "#64748b", fontWeight: 800 }}>
                                {RANK_LABEL[rank - 1] ?? rank}
                              </td>
                              <td className="cl-td">
                                <div className="cl-team-cell">
                                  <div className="cl-team-avatar">
                                    {s.teamId?.tag?.slice(0, 2).toUpperCase() ?? "?"}
                                  </div>
                                  <div>
                                    <div className="cl-team-tag">{s.teamId?.tag ?? "—"}</div>
                                    <div className="cl-team-name">{s.teamId?.name ?? "—"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="cl-td" style={{ textAlign: "center" }}>{s.matchesPlayed}</td>
                              <td className="cl-td" style={{ textAlign: "center", color: "#4ade80", fontWeight: 700 }}>{s.wins}</td>
                              <td className="cl-td" style={{ textAlign: "center" }}>{s.draws}</td>
                              <td className="cl-td" style={{ textAlign: "center", color: "#f87171", fontWeight: 700 }}>{s.losses}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}
