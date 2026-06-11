import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MatchCard from '../MatchCard'
import type { Match } from '@/lib/api'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const baseMatch: Match = {
  _id: 'match-1',
  id: null,
  status: 'scheduled',
  scheduledAt: '2025-06-15T18:00:00.000Z',
  bestOf: 3,
  scoreTeam1: 0,
  scoreTeam2: 0,
  winnerId: null,
  team1Id: { _id: 'team-a', name: 'Team Alpha', tag: 'ALPH', logoUrl: null },
  team2Id: { _id: 'team-b', name: 'Team Beta', tag: 'BETA', logoUrl: null },
  tournamentId: { _id: 'tour-1', name: 'LEC Spring 2025', game: 'League of Legends' },
}

describe('MatchCard', () => {
  it("affiche les noms et tags des deux équipes", () => {
    render(<MatchCard match={baseMatch} />)
    expect(screen.getByText('ALPH')).toBeInTheDocument()
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    expect(screen.getByText('BETA')).toBeInTheDocument()
    expect(screen.getByText('Team Beta')).toBeInTheDocument()
  })

  it('affiche le format BO du match', () => {
    render(<MatchCard match={baseMatch} />)
    expect(screen.getByText('BO3')).toBeInTheDocument()
  })

  it('affiche le nom du tournoi', () => {
    render(<MatchCard match={baseMatch} />)
    expect(screen.getByText('LEC Spring 2025')).toBeInTheDocument()
  })

  it('affiche le séparateur VS', () => {
    render(<MatchCard match={baseMatch} />)
    expect(screen.getByText('VS')).toBeInTheDocument()
  })

  it("n'affiche pas le badge LIVE pour un match non live", () => {
    render(<MatchCard match={baseMatch} />)
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
  })

  it('affiche le badge LIVE et les scores pour un match en cours', () => {
    render(<MatchCard match={{ ...baseMatch, status: 'live', scoreTeam1: 1, scoreTeam2: 2 }} />)
    expect(screen.getByText('LIVE')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('le lien "Parier" pointe vers /paris', () => {
    render(<MatchCard match={baseMatch} />)
    const link = screen.getByRole('link', { name: /parier/i })
    expect(link).toHaveAttribute('href', '/paris')
  })
})
