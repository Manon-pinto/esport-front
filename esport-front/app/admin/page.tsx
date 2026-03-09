"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const BASE = "http://localhost:3000"

const CARDS = [
  {
    href: "/admin/equipes", label: "Équipes", key: "teams", color: "#667EEA",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#667EEA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  {
    href: "/admin/joueurs", label: "Joueurs", key: "players", color: "#4ade80",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: "/admin/coachs", label: "Coachs", key: "coaches", color: "#a78bfa",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>,
  },
  {
    href: "/admin/tournois", label: "Tournois", key: "tournaments", color: "#f6e05e",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f6e05e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  },
  {
    href: "/admin/matchs", label: "Matchs", key: "matches", color: "#f87171",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/></svg>,
  },
  {
    href: "/admin/paris", label: "Paris", key: "bets", color: "#60a5fa",
    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  },
]

function extractCount(data: unknown, key: string): number {
  if (!data || typeof data !== "object") return 0
  const d = data as Record<string, unknown>
  if (typeof d.count === "number") return d.count
  if (Array.isArray(d)) return d.length
  if (Array.isArray(d[key])) return (d[key] as unknown[]).length
  return 0
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token") ?? ""
    Promise.allSettled([
      fetch(`${BASE}/api/teams`).then(r => r.json()),
      fetch(`${BASE}/api/players`).then(r => r.json()),
      fetch(`${BASE}/api/coach`).then(r => r.json()),
      fetch(`${BASE}/api/tournois`).then(r => r.json()),
      fetch(`${BASE}/api/matches`).then(r => r.json()),
      fetch(`${BASE}/api/pari`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(results => {
      const keys = ["teams", "players", "coaches", "tournaments", "matches", "bets"]
      const c: Record<string, number> = {}
      results.forEach((r, i) => {
        c[keys[i]] = r.status === "fulfilled" ? extractCount(r.value, keys[i]) : 0
      })
      setCounts(c)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Vue d&apos;ensemble de la plateforme</p>
        </div>
      </div>

      <div className="adm-stat-grid">
        {CARDS.map(c => (
          <Link key={c.key} href={c.href} className="adm-stat-card" style={{ borderTop: `3px solid ${c.color}22` }}>
            <div className="adm-stat-icon" style={{ color: c.color }}>{c.icon}</div>
            <div className="adm-stat-count" style={{ color: c.color }}>{loading ? "…" : (counts[c.key] ?? 0)}</div>
            <div className="adm-stat-label">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
