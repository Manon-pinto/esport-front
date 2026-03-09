"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

interface Team { _id: string; name: string; tag: string }

interface Coach {
  _id: string
  name: string
  nationality: string
  experience: number
  teamId?: Team | string | null
  photoUrl?: string | null
  isActive: boolean
}

interface FormState {
  name: string
  nationality: string
  experience: string
  teamId: string
  photoUrl: string
  isActive: boolean
}

const EMPTY: FormState = { name: "", nationality: "", experience: "0", teamId: "", photoUrl: "", isActive: true }

function teamTag(teamId: Team | string | null | undefined): string {
  if (!teamId) return "—"
  if (typeof teamId === "object") return teamId.tag
  return "—"
}

export default function AdminCoachs() {
  const [items, setItems] = useState<Coach[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing: Coach | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`${BASE}/api/coach`).then(r => r.json()),
      fetch(`${BASE}/api/teams`).then(r => r.json()),
    ]).then(([c, t]) => {
      setItems(Array.isArray(c) ? c : (c.coaches ?? c.coach ?? []))
      setTeams(Array.isArray(t) ? t : (t.teams ?? []))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }) }
  const openEdit = (item: Coach) => {
    const tid = typeof item.teamId === "object" ? (item.teamId?._id ?? "") : (item.teamId ?? "")
    setForm({
      name: item.name,
      nationality: item.nationality,
      experience: item.experience?.toString() ?? "0",
      teamId: tid,
      photoUrl: item.photoUrl ?? "",
      isActive: item.isActive,
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
      nationality: form.nationality.toUpperCase(),
      experience: parseInt(form.experience) || 0,
      teamId: form.teamId || undefined,
      photoUrl: form.photoUrl || null,
      isActive: form.isActive,
    }
    try {
      const url = modal.editing ? `${BASE}/api/coach/${modal.editing._id}` : `${BASE}/api/coach`
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
    if (!confirm("Supprimer ce coach ?")) return
    const token = localStorage.getItem("token") ?? ""
    await fetch(`${BASE}/api/coach/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Coachs</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{items.length} coach(s)</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty">Aucun coach</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Nom</th>
                <th className="adm-th">Nat.</th>
                <th className="adm-th">Expérience</th>
                <th className="adm-th">Équipe</th>
                <th className="adm-th">Statut</th>
                <th className="adm-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td"><strong>{item.name}</strong></td>
                  <td className="adm-td">{item.nationality}</td>
                  <td className="adm-td">{item.experience} an(s)</td>
                  <td className="adm-td">{teamTag(item.teamId)}</td>
                  <td className="adm-td">
                    <span className={`adm-badge adm-badge--${item.isActive ? "active" : "inactive"}`}>
                      {item.isActive ? "Actif" : "Inactif"}
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
            <h2 className="adm-modal-title">{modal.editing ? "Modifier le coach" : "Nouveau coach"}</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-grid">
              <div className="adm-form-group">
                <label className="adm-label">Nom *</label>
                <input className="adm-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Nationalité * (ISO 2)</label>
                <input className="adm-input" value={form.nationality} maxLength={2} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Expérience (années)</label>
                <input className="adm-input" type="number" min="0" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Équipe *</label>
                <select className="adm-select" value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}>
                  <option value="">— Choisir une équipe —</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.tag} — {t.name}</option>)}
                </select>
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Statut</label>
                <select className="adm-select" value={form.isActive ? "1" : "0"} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "1" }))}>
                  <option value="1">Actif</option>
                  <option value="0">Inactif</option>
                </select>
              </div>
              <div className="adm-form-group adm-form-group--full">
                <label className="adm-label">Photo URL</label>
                <input className="adm-input" value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} />
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
