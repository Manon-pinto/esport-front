const BASE_URL = "http://localhost:3000"

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
  const res = await fetch(`${BASE_URL}/api/tournois`, { cache: "no-store" })
  if (!res.ok) throw new Error("Erreur API tournois")
  const data = await res.json()
  return Array.isArray(data) ? data : data.tournaments
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

export async function getBets(token: string): Promise<Bet[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/bets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.bets) ? data.bets : []
  } catch {
    return []
  }
}