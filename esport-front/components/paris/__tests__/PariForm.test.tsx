import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PariForm from '../PariForm'
import type { Match } from '@/lib/api'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock l'appel API
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return { ...actual, placeBet: vi.fn().mockResolvedValue({}) }
})

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

describe('PariForm', () => {
  const onClose = vi.fn()
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('affiche le titre et les deux équipes', () => {
    render(<PariForm match={baseMatch} userPoints={500} onClose={onClose} onSuccess={onSuccess} />)
    expect(screen.getByText('Placer un pari')).toBeInTheDocument()
    expect(screen.getByText('Team Alpha')).toBeInTheDocument()
    expect(screen.getByText('Team Beta')).toBeInTheDocument()
  })

  it('affiche une erreur si mise inférieure à 10', async () => {
    render(<PariForm match={baseMatch} userPoints={500} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.click(screen.getByText('ALPH'))

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '5' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Valider le pari' }).closest('form')!)

    expect(await screen.findByText('La mise minimum est de 10 points.')).toBeInTheDocument()
  })

  it('affiche une erreur si mise supérieure au solde', async () => {
    render(<PariForm match={baseMatch} userPoints={50} onClose={onClose} onSuccess={onSuccess} />)

    fireEvent.click(screen.getByText('ALPH'))

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '200' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Valider le pari' }).closest('form')!)

    expect(await screen.findByText('Mise supérieure à votre solde de points.')).toBeInTheDocument()
  })

  it('affiche le gain potentiel quand la mise est saisie', () => {
    render(<PariForm match={baseMatch} userPoints={500} onClose={onClose} onSuccess={onSuccess} />)

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '100' } })

    // 100 * 1.9 = 190
    expect(screen.getByText(/190/)).toBeInTheDocument()
  })

  it("le bouton Annuler appelle onClose", () => {
    render(<PariForm match={baseMatch} userPoints={500} onClose={onClose} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByText('Annuler'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('le bouton Valider est désactivé si aucune équipe sélectionnée', () => {
    render(<PariForm match={baseMatch} userPoints={500} onClose={onClose} onSuccess={onSuccess} />)
    const submitBtn = screen.getByText('Valider le pari')
    expect(submitBtn).toBeDisabled()
  })
})
