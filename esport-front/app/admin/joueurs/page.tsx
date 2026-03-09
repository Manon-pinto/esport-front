"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

interface Team { _id: string; name: string; tag: string }

interface Player {
  _id: string
  nickname: string
  realName: string
  nationality: string
  birthDate: string
  teamId?: Team | string | null
  photoUrl?: string | null
  isActive: boolean
}

interface FormState {
  nickname: string
  realName: string
  nationality: string
  birthDate: string
  teamId: string
  photoUrl: string
  isActive: boolean
}

const EMPTY: FormState = { nickname: "", realName: "", nationality: "", birthDate: "", teamId: "", photoUrl: "", isActive: true }

function teamTag(teamId: Team | string | null | undefined): string {
  if (!teamId) return "—"
  if (typeof teamId === "object") return teamId.tag
  return "—"
}

export default function AdminJoueurs() {
  const [items, setItems] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing: Player | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch(`${BASE}/api/players`).then(r => r.json()),
      fetch(`${BASE}/api/teams`).then(r => r.json()),
    ]).then(([p, t]) => {
      setItems(Array.isArray(p) ? p : (p.players ?? []))
      setTeams(Array.isArray(t) ? t : (t.teams ?? []))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }) }
  const openEdit = (item: Player) => {
    const tid = typeof item.teamId === "object" ? (item.teamId?._id ?? "") : (item.teamId ?? "")
    setForm({
      nickname: item.nickname,
      realName: item.realName,
      nationality: item.nationality,
      birthDate: item.birthDate ? item.birthDate.split("T")[0] : "",
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
      nickname: form.nickname,
      realName: form.realName,
      nationality: form.nationality.toUpperCase(),
      birthDate: form.birthDate,
      teamId: form.teamId || null,
      photoUrl: form.photoUrl || null,
      isActive: form.isActive,
    }
    try {
      const url = modal.editing ? `${BASE}/api/players/${modal.editing._id}` : `${BASE}/api/players`
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
    if (!confirm("Supprimer ce joueur ?")) return
    const token = localStorage.getItem("token") ?? ""
    await fetch(`${BASE}/api/players/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Joueurs</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{items.length} joueur(s)</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty">Aucun joueur</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Pseudo</th>
                <th className="adm-th">Nom réel</th>
                <th className="adm-th">Nat.</th>
                <th className="adm-th">Équipe</th>
                <th className="adm-th">Statut</th>
                <th className="adm-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td"><strong>{item.nickname}</strong></td>
                  <td className="adm-td">{item.realName}</td>
                  <td className="adm-td">{item.nationality}</td>
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
            <h2 className="adm-modal-title">{modal.editing ? "Modifier le joueur" : "Nouveau joueur"}</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-grid">
              <div className="adm-form-group">
                <label className="adm-label">Pseudo *</label>
                <input className="adm-input" value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Nom réel *</label>
                <input className="adm-input" value={form.realName} onChange={e => setForm(f => ({ ...f, realName: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Nationalité * (ISO 2)</label>
                <input className="adm-input" value={form.nationality} maxLength={2} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Date de naissance *</label>
                <input className="adm-input" type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Équipe</label>
                <select className="adm-select" value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}>
                  <option value="">— Sans équipe —</option>
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
