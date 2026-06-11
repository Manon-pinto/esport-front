import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TournamentCard from '../TournamentCard'
import type { Tournament } from '@/lib/api'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const baseTournament: Tournament = {
  _id: 'tour-1',
  name: 'LEC Spring 2025',
  game: 'League of Legends',
  location: 'Paris',
  startDate: '2025-03-01T00:00:00.000Z',
  endDate: '2025-06-30T00:00:00.000Z',
  prizePool: 50000,
  status: 'ongoing',
  bannerUrl: null,
}

describe('TournamentCard', () => {
  it('affiche le nom du tournoi', () => {
    render(<TournamentCard tournament={baseTournament} />)
    expect(screen.getByText('LEC Spring 2025')).toBeInTheDocument()
  })

  it('affiche le jeu et la localisation', () => {
    render(<TournamentCard tournament={baseTournament} />)
    expect(screen.getByText('League of Legends')).toBeInTheDocument()
    expect(screen.getByText('Paris')).toBeInTheDocument()
  })

  it('affiche le prize pool formaté', () => {
    render(<TournamentCard tournament={baseTournament} />)
    expect(screen.getByText(/50.*000.*pts/i)).toBeInTheDocument()
  })

  it('affiche le badge EN COURS pour un tournoi ongoing', () => {
    render(<TournamentCard tournament={baseTournament} />)
    expect(screen.getByText('EN COURS')).toBeInTheDocument()
  })

  it('affiche le badge À VENIR pour un tournoi upcoming', () => {
    render(<TournamentCard tournament={{ ...baseTournament, status: 'upcoming' }} />)
    expect(screen.getByText('À VENIR')).toBeInTheDocument()
  })

  it('affiche le badge TERMINÉ pour un tournoi completed', () => {
    render(<TournamentCard tournament={{ ...baseTournament, status: 'completed' }} />)
    expect(screen.getByText('TERMINÉ')).toBeInTheDocument()
  })

  it('affiche "—" si prize pool manquant', () => {
    render(<TournamentCard tournament={{ ...baseTournament, prizePool: 0 }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('le lien "Voir" pointe vers la page du tournoi', () => {
    render(<TournamentCard tournament={baseTournament} />)
    const link = screen.getByRole('link', { name: /voir/i })
    expect(link).toHaveAttribute('href', '/tournois/tour-1')
  })
})
