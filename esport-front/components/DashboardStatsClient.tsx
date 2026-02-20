"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getDashboardStats, DashboardStats } from "@/lib/api"
import StatsCards from "@/components/StatsCards"

export default function DashboardStatsClient() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    activeTournaments: 0,
    activeBets: 0,
    totalWinnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        // Récupérer le token depuis localStorage
        const token = localStorage.getItem("token")
        const data = await getDashboardStats(token || undefined)
        setStats(data)
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user]) // Se recharge quand l'utilisateur change

  if (loading) {
    return (
      <StatsCards
        stats={[
          { label: "TOURNOIS ACTIFS", value: "..." },
          { label: "PARIS EN COURS", value: "..." },
          { label: "GAINS TOTAUX", value: "..." },
        ]}
      />
    )
  }

  return (
    <StatsCards
      stats={[
        { 
          label: "TOURNOIS ACTIFS", 
          value: stats.activeTournaments 
        },
        { 
          label: "PARIS EN COURS", 
          value: stats.activeBets 
        },
        { 
          label: "GAINS TOTAUX", 
          value: `${new Intl.NumberFormat("fr-FR").format(stats.totalWinnings)} pts`
        },
      ]}
    />
  )
}