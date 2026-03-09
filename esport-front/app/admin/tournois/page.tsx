"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

const GAMES = ["League of Legends", "CS:GO", "Valorant", "Dota 2", "Overwatch", "Rocket League", "Rainbow Six Siege"]
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"]

interface Tournament {
  _id: string
  name: string
  game: string
  prizePool: number
  startDate: string
  endDate: string
  location: string
  status: string
  bannerUrl?: string | null
}

interface FormState {
  name: string
  game: string
  prizePool: string
  startDate: string
  endDate: string
  location: string
  status: string
  bannerUrl: string
}

const EMPTY: FormState = { name: "", game: GAMES[0], prizePool: "0", startDate: "", endDate: "", location: "", status: "upcoming", bannerUrl: "" }

const STATUS_LABEL: Record<string, string> = { upcoming: "À venir", ongoing: "En cours", completed: "Terminé", cancelled: "Annulé" }
const STATUS_COLOR: Record<string, string> = { upcoming: "info", ongoing: "active", completed: "inactive", cancelled: "danger" }

export default function AdminTournois() {
  const [items, setItems] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing: Tournament | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    fetch(`${BASE}/api/tournois`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : (d.tournaments ?? [])))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR") : "—"

  const openCreate = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }) }
  const openEdit = (item: Tournament) => {
    setForm({
      name: item.name,
      game: item.game,
      prizePool: item.prizePool.toString(),
      startDate: item.startDate ? item.startDate.split("T")[0] : "",
      endDate: item.endDate ? item.endDate.split("T")[0] : "",
      location: item.location,
      status: item.status,
      bannerUrl: item.bannerUrl ?? "",
    })
    setError("")
    setModal({ open: true, editing: item })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const save = async () => {
    setSaving(true); setError("")
    const token = localStorage.getItem("token") ?? ""
    const body = {
      name: form.name,
      game: form.game,
      prizePool: parseFloat(form.prizePool) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      location: form.location,
      status: form.status,
      bannerUrl: form.bannerUrl || null,
    }
    try {
      const url = modal.editing ? `${BASE}/api/tournois/${modal.editing._id}` : `${BASE}/api/tournois`
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
    if (!confirm("Supprimer ce tournoi ?")) return
    const token = localStorage.getItem("token") ?? ""
    await fetch(`${BASE}/api/tournois/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Tournois</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{items.length} tournoi(s)</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty">Aucun tournoi</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Nom</th>
                <th className="adm-th">Jeu</th>
                <th className="adm-th">Prize Pool</th>
                <th className="adm-th">Début</th>
                <th className="adm-th">Fin</th>
                <th className="adm-th">Statut</th>
                <th className="adm-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td"><strong>{item.name}</strong></td>
                  <td className="adm-td">{item.game}</td>
                  <td className="adm-td">{item.prizePool.toLocaleString()} €</td>
                  <td className="adm-td">{fmt(item.startDate)}</td>
                  <td className="adm-td">{fmt(item.endDate)}</td>
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
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h2 className="adm-modal-title">{modal.editing ? "Modifier le tournoi" : "Nouveau tournoi"}</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-grid">
              <div className="adm-form-group adm-form-group--full">
                <label className="adm-label">Nom *</label>
                <input className="adm-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Jeu *</label>
                <select className="adm-select" value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))}>
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Prize Pool (€) *</label>
                <input className="adm-input" type="number" min="0" value={form.prizePool} onChange={e => setForm(f => ({ ...f, prizePool: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Date de début *</label>
                <input className="adm-input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Date de fin *</label>
                <input className="adm-input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Lieu *</label>
                <input className="adm-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Statut</label>
                <select className="adm-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="adm-form-group adm-form-group--full">
                <label className="adm-label">Banner URL</label>
                <input className="adm-input" value={form.bannerUrl} onChange={e => setForm(f => ({ ...f, bannerUrl: e.target.value }))} />
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
