"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

const STATUS_LABEL: Record<string, string> = { pending: "En attente", won: "Gagné", lost: "Perdu", cancelled: "Annulé" }
const STATUS_COLOR: Record<string, string> = { pending: "info", won: "active", lost: "danger", cancelled: "inactive" }

interface Team { _id: string; name: string; tag: string }
interface BetMatch {
  _id: string
  team1Id: Team
  team2Id: Team
  scheduledAt: string
  status: string
}
interface Bet {
  _id: string
  userId?: { _id: string; username: string } | null
  matchId: BetMatch
  predictedWinnerId: Team
  amount: number
  odds: number
  potentialWin: number
  status: string
  createdAt: string
}

export default function AdminParis() {
  const [items, setItems] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  const load = () => {
    setLoading(true)
    const token = localStorage.getItem("token") ?? ""
    fetch(`${BASE}/api/pari`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d.bets) ? d.bets : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

  const filtered = filter
    ? items.filter(b => b.status === filter)
    : items

  const totals = {
    total: items.length,
    pending: items.filter(b => b.status === "pending").length,
    won: items.filter(b => b.status === "won").length,
    lost: items.filter(b => b.status === "lost").length,
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Paris</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
            {totals.total} paris — {totals.pending} en attente · {totals.won} gagnés · {totals.lost} perdus
          </p>
        </div>
        <div className="adm-filter-row">
          {["", "pending", "won", "lost", "cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`adm-btn adm-btn--sm${filter === s ? " adm-btn--active" : ""}`}
            >
              {s === "" ? "Tous" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">Aucun pari</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Parieur</th>
                <th className="adm-th">Match</th>
                <th className="adm-th">Pronostic</th>
                <th className="adm-th">Mise</th>
                <th className="adm-th">Cote</th>
                <th className="adm-th">Gain pot.</th>
                <th className="adm-th">Date</th>
                <th className="adm-th">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td">
                    <strong>{item.userId?.username ?? "—"}</strong>
                  </td>
                  <td className="adm-td">
                    {item.matchId ? (
                      <>
                        <span className="adm-tag">{item.matchId.team1Id?.tag ?? "?"}</span>
                        {" vs "}
                        <span className="adm-tag">{item.matchId.team2Id?.tag ?? "?"}</span>
                      </>
                    ) : "—"}
                  </td>
                  <td className="adm-td">
                    <span className="adm-tag adm-tag--gold">{item.predictedWinnerId?.tag ?? "—"}</span>
                  </td>
                  <td className="adm-td" style={{ fontWeight: 700 }}>{item.amount} pts</td>
                  <td className="adm-td">{item.odds?.toFixed(2) ?? "—"}</td>
                  <td className="adm-td" style={{ color: "#4ade80", fontWeight: 700 }}>{item.potentialWin?.toFixed(0) ?? "—"} pts</td>
                  <td className="adm-td" style={{ fontSize: "0.8rem" }}>{fmt(item.createdAt)}</td>
                  <td className="adm-td">
                    <span className={`adm-badge adm-badge--${STATUS_COLOR[item.status] ?? "inactive"}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
