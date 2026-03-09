import { Key } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface Tournament {
  _id: string
  name: string
  game: string
  prizePool: number
  startDate: string
  endDate: string
  location: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  bannerUrl: string | null
}

export interface Match {
  id: Key | null | undefined
  _id: string
  team1Id: { _id: string; name: string; tag: string; logoUrl: string | null }
  team2Id: { _id: string; name: string; tag: string; logoUrl: string | null }
  scheduledAt: string
  status: "scheduled" | "live" | "finished" | "completed" | "cancelled"
  tournamentId: { _id: string; name: string; game: string }
  bestOf: number
  scoreTeam1: number
  scoreTeam2: number
  winnerId: { _id: string; name: string; tag: string } | null
}

export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  points: number
}

export interface AuthResponse {
  message: string
  user: AuthUser
  token: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Erreur de connexion")
  return data
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription")
  return data
}

export async function getTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/tournois`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.tournaments ?? [])
  } catch {
    return []
  }
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/tournois/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return data.tournament ?? data
  } catch {
    return null
  }
}

export async function getMatchs(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.matches ?? data.matchs ?? [])
  } catch {
    return []
  }
}

export interface BetTeam {
  _id: string
  name: string
  tag: string
}

export interface BetMatch {
  _id: string
  team1Id: BetTeam
  team2Id: BetTeam
  scheduledAt: string
  status: "scheduled" | "live" | "finished"
}

export interface Bet {
  _id: string
  matchId: BetMatch
  predictedWinnerId: BetTeam
  amount: number
  odds: number
  potentialWin: number
  status: "pending" | "won" | "lost" | "cancelled"
  createdAt: string
}

export async function getMatchById(id: string): Promise<Match | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/matches/${id}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return data.match ?? null
  } catch {
    return null
  }
}

export interface LeaderboardUser {
  _id: string
  username: string
  points: number
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/leaderboard`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.leaderboard) ? data.leaderboard : []
  } catch {
    return []
  }
}

export interface Standing {
  _id: string
  tournamentId: { _id: string; name: string; game: string }
  teamId: { _id: string; name: string; tag: string; logoUrl: string | null }
  matchesPlayed: number
  wins: number
  losses: number
  draws: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  rank?: number
}

export async function getStandings(): Promise<Standing[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/classement`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.standings) ? data.standings : []
  } catch {
    return []
  }
}

export async function getBets(token: string): Promise<Bet[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/pari`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.bets) ? data.bets : []
  } catch {
    return []
  }
}


export async function placeBet(token: string, matchId: string, predictedWinnerId: string, amount: number, odds: number = 1.9): Promise<Bet> {
  const res = await fetch(`${BASE_URL}/api/pari`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ matchId, predictedWinnerId, amount, odds }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Erreur lors de la validation du pari")
  return data.bet
}

export interface DashboardStats {
  activeTournaments: number
  activeBets: number
  totalWinnings: number
}

export async function getDashboardStats(token?: string): Promise<DashboardStats> {
  try {
    const [tournaments, matches] = await Promise.all([getTournaments(), getMatchs()])

    const liveTournamentIds = new Set(
      matches
        .filter((m) => m.status === "live")
        .map((m) => m.tournamentId?._id)
        .filter(Boolean)
    )

    const activeTournaments = tournaments.filter(
      (t) => t.status === "ongoing" || liveTournamentIds.has(t._id)
    ).length

    // Si l'utilisateur est connecté, on récupère ses paris pour calculer les statistiques personnelles
    let activeBets = 0
    let totalWinnings = 0

    if (token) {
      const bets = await getBets(token)
      
      activeBets = bets.filter(
        (b) => b.status === "pending"
      ).length

      totalWinnings = bets
        .filter((b) => b.status === "won")
        .reduce((sum, b) => sum + (b.potentialWin || 0), 0)
    }

    return {
      activeTournaments,
      activeBets,
      totalWinnings,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error)
    return {
      activeTournaments: 0,
      activeBets: 0,
      totalWinnings: 0,
    }
  }
}