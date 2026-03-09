"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

const STATUSES = ["scheduled", "live", "completed", "cancelled"]
const STATUS_LABEL: Record<string, string> = { scheduled: "Planifié", live: "En direct", completed: "Terminé", cancelled: "Annulé", finished: "Terminé (legacy)" }
const STATUS_COLOR: Record<string, string> = { scheduled: "info", live: "active", completed: "inactive", cancelled: "danger", finished: "inactive" }

interface Team { _id: string; name: string; tag: string }
interface Tournament { _id: string; name: string; game: string }

interface Match {
  _id: string
  tournamentId: Tournament | string
  team1Id: Team | string
  team2Id: Team | string
  scheduledAt: string
  status: string
  scoreTeam1: number
  scoreTeam2: number
  winnerId?: Team | string | null
  bestOf: number
}

interface FormState {
  tournamentId: string
  team1Id: string
  team2Id: string
  scheduledAt: string
  status: string
  scoreTeam1: string
  scoreTeam2: string
  winnerId: string
  bestOf: string
}

const EMPTY: FormState = {
  tournamentId: "", team1Id: "", team2Id: "",
  scheduledAt: "", status: "scheduled",
  scoreTeam1: "0", scoreTeam2: "0", winnerId: "", bestOf: "1"
}

function getName(v: Team | Tournament | string | null | undefined, field: "tag" | "name"): string {
  if (!v) return "—"
  if (typeof v === "object") return field === "tag" ? (v as Team).tag ?? (v as Tournament).name : v.name
  return "—"
}

function getId(v: Team | Tournament | string | null | undefined): string {
  if (!v) return ""
  if (typeof v === "object") return v._id
  return v
}

export default function AdminMatchs() {
  const [items, setItems] = useState<Match[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing: Match | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`${BASE}/api/matches`).then(r => r.json()),
      fetch(`${BASE}/api/teams`).then(r => r.json()),
      fetch(`${BASE}/api/tournois`).then(r => r.json()),
    ]).then(([m, t, to]) => {
      setItems(Array.isArray(m) ? m : (m.matches ?? m.matchs ?? []))
      setTeams(Array.isArray(t) ? t : (t.teams ?? []))
      setTournaments(Array.isArray(to) ? to : (to.tournaments ?? []))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmt = (d: string) => d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"

  const openCreate = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }) }
  const openEdit = (item: Match) => {
    setForm({
      tournamentId: getId(item.tournamentId),
      team1Id: getId(item.team1Id),
      team2Id: getId(item.team2Id),
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : "",
      status: item.status === "finished" ? "completed" : item.status,
      scoreTeam1: item.scoreTeam1?.toString() ?? "0",
      scoreTeam2: item.scoreTeam2?.toString() ?? "0",
      winnerId: getId(item.winnerId),
      bestOf: item.bestOf?.toString() ?? "1",
    })
    setError("")
    setModal({ open: true, editing: item })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const save = async () => {
    setSaving(true); setError("")
    const token = localStorage.getItem("token") ?? ""
    const body = {
      tournamentId: form.tournamentId,
      team1Id: form.team1Id,
      team2Id: form.team2Id,
      scheduledAt: form.scheduledAt,
      status: form.status,
      scoreTeam1: parseInt(form.scoreTeam1) || 0,
      scoreTeam2: parseInt(form.scoreTeam2) || 0,
      winnerId: form.winnerId || null,
      bestOf: parseInt(form.bestOf) || 1,
    }
    try {
      const url = modal.editing ? `${BASE}/api/matches/${modal.editing._id}` : `${BASE}/api/matches`
      const res = await fetch(url, {
        method: modal.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error || "Erreur"); return }
      closeModal(); load()
    } catch { setError("Erreur réseau") } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Supprimer ce match ?")) return
    const token = localStorage.getItem("token") ?? ""
    await fetch(`${BASE}/api/matches/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  const matchTeams = form.team1Id && form.team2Id
    ? [
        teams.find(t => t._id === form.team1Id),
        teams.find(t => t._id === form.team2Id),
      ].filter(Boolean) as Team[]
    : []

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Matchs</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{items.length} match(s)</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty">Aucun match</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Match</th>
                <th className="adm-th">Tournoi</th>
                <th className="adm-th">Date</th>
                <th className="adm-th">Score</th>
                <th className="adm-th">Format</th>
                <th className="adm-th">Statut</th>
                <th className="adm-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td">
                    <span className="adm-tag">{getName(item.team1Id, "tag")}</span>
                    {" vs "}
                    <span className="adm-tag">{getName(item.team2Id, "tag")}</span>
                  </td>
                  <td className="adm-td">{getName(item.tournamentId, "name")}</td>
                  <td className="adm-td" style={{ fontSize: "0.8rem" }}>{fmt(item.scheduledAt)}</td>
                  <td className="adm-td" style={{ fontWeight: 700 }}>{item.scoreTeam1} – {item.scoreTeam2}</td>
                  <td className="adm-td">BO{item.bestOf}</td>
                  <td className="adm-td">
                    <span className={`adm-badge adm-badge--${STATUS_COLOR[item.status] ?? "inactive"}`}>
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="adm-td adm-actions">
                    <button className="adm-btn adm-btn--sm" onClick={() => openEdit(item)}>Modifier</button>
                    <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => del(item._id)}>Suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="adm-modal-bg" onClick={closeModal}>
          <div className="adm-modal adm-modal--lg" onClick={e => e.stopPropagation()}>
            <h2 className="adm-modal-title">{modal.editing ? "Modifier le match" : "Nouveau match"}</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-grid">
              <div className="adm-form-group adm-form-group--full">
                <label className="adm-label">Tournoi *</label>
                <select className="adm-select" value={form.tournamentId} onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))}>
                  <option value="">— Choisir un tournoi —</option>
                  {tournaments.map(t => <option key={t._id} value={t._id}>{t.name} ({t.game})</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Équipe 1 *</label>
                <select className="adm-select" value={form.team1Id} onChange={e => setForm(f => ({ ...f, team1Id: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.tag} — {t.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Équipe 2 *</label>
                <select className="adm-select" value={form.team2Id} onChange={e => setForm(f => ({ ...f, team2Id: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.tag} — {t.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Date & Heure *</label>
                <input className="adm-input" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Format</label>
                <select className="adm-select" value={form.bestOf} onChange={e => setForm(f => ({ ...f, bestOf: e.target.value }))}>
                  <option value="1">BO1</option>
                  <option value="3">BO3</option>
                  <option value="5">BO5</option>
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Score Éq. 1</label>
                <input className="adm-input" type="number" min="0" value={form.scoreTeam1} onChange={e => setForm(f => ({ ...f, scoreTeam1: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Score Éq. 2</label>
                <input className="adm-input" type="number" min="0" value={form.scoreTeam2} onChange={e => setForm(f => ({ ...f, scoreTeam2: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Statut</label>
                <select className="adm-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Vainqueur</label>
                <select className="adm-select" value={form.winnerId} onChange={e => setForm(f => ({ ...f, winnerId: e.target.value }))}>
                  <option value="">— Pas encore —</option>
                  {matchTeams.map(t => <option key={t._id} value={t._id}>{t.tag} — {t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn" onClick={closeModal}>Annuler</button>
              <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
