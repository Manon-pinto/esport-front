"use client"

import { useEffect, useState } from "react"

const BASE = "http://localhost:3000"

interface Team {
  _id: string
  name: string
  tag: string
  country: string
  foundedYear?: number
  logoUrl?: string | null
  isActive: boolean
}

interface FormState {
  name: string
  tag: string
  country: string
  foundedYear: string
  logoUrl: string
  isActive: boolean
}

const EMPTY: FormState = { name: "", tag: "", country: "", foundedYear: "", logoUrl: "", isActive: true }

export default function AdminEquipes() {
  const [items, setItems] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; editing: Team | null }>({ open: false, editing: null })
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    fetch(`${BASE}/api/teams`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : (d.teams ?? [])))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(""); setModal({ open: true, editing: null }) }
  const openEdit = (item: Team) => {
    setForm({ name: item.name, tag: item.tag, country: item.country, foundedYear: item.foundedYear?.toString() ?? "", logoUrl: item.logoUrl ?? "", isActive: item.isActive })
    setError("")
    setModal({ open: true, editing: item })
  }
  const closeModal = () => setModal({ open: false, editing: null })

  const save = async () => {
    setSaving(true); setError("")
    const token = localStorage.getItem("token") ?? ""
    const body: Record<string, unknown> = {
      name: form.name,
      tag: form.tag.toUpperCase(),
      country: form.country.toUpperCase(),
      logoUrl: form.logoUrl || null,
      isActive: form.isActive,
    }
    if (form.foundedYear) body.foundedYear = parseInt(form.foundedYear)
    try {
      const url = modal.editing ? `${BASE}/api/teams/${modal.editing._id}` : `${BASE}/api/teams`
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
    if (!confirm("Supprimer cette équipe ?")) return
    const token = localStorage.getItem("token") ?? ""
    await fetch(`${BASE}/api/teams/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Équipes</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{items.length} équipe(s)</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {loading ? (
        <div className="adm-loading">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty">Aucune équipe</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th">Tag</th>
                <th className="adm-th">Nom</th>
                <th className="adm-th">Pays</th>
                <th className="adm-th">Fondée</th>
                <th className="adm-th">Statut</th>
                <th className="adm-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className="adm-tr">
                  <td className="adm-td"><span className="adm-tag">{item.tag}</span></td>
                  <td className="adm-td">{item.name}</td>
                  <td className="adm-td">{item.country}</td>
                  <td className="adm-td">{item.foundedYear ?? "—"}</td>
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
            <h2 className="adm-modal-title">{modal.editing ? "Modifier l'équipe" : "Nouvelle équipe"}</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-grid">
              <div className="adm-form-group">
                <label className="adm-label">Nom *</label>
                <input className="adm-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Tag * (2–5 car.)</label>
                <input className="adm-input" value={form.tag} maxLength={5} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Pays * (ISO 2 car.)</label>
                <input className="adm-input" value={form.country} maxLength={2} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Année de fondation</label>
                <input className="adm-input" type="number" value={form.foundedYear} onChange={e => setForm(f => ({ ...f, foundedYear: e.target.value }))} />
              </div>
              <div className="adm-form-group adm-form-group--full">
                <label className="adm-label">Logo URL</label>
                <input className="adm-input" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Statut</label>
                <select className="adm-select" value={form.isActive ? "1" : "0"} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === "1" }))}>
                  <option value="1">Actif</option>
                  <option value="0">Inactif</option>
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
