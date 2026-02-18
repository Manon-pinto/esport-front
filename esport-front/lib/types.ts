export type TournoisStatus = "à venir" | "live" | "fini" | "annulé"
export type MatchStatus = "à venir" | "live" | "fini" | "annulé"

export interface Team {
  id: string
  name: string
  tag: string
  country?: string
}

export interface Tournoi {
  id: string
  name: string
  game: string
  location: string
  prizePool: number
  status: TournoisStatus
  startDate: string
  endDate: string
}

export interface Match {
  id: string
  team1: Team
  team2: Team
  date: string
  status: MatchStatus
  tournoi: string
  game: string
  scoreTeam1: number
  scoreTeam2: number
  bestOf: number
}

export interface Stats {
  tournoísActifs: number
  parisEnCours: number
  gainsTotaux: number
}