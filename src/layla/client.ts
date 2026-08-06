import { LaylaSDK, type LaylaCharacter } from '@layla-network/sdk'
import type { Guesser } from '../game/types'

const FALLBACK_COLORS = [
  '#ff5d8f',
  '#38bdf8',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#f97316',
]

const layla = new LaylaSDK()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function toGuesser(character: LaylaCharacter, index: number): Guesser {
  const extension = character.data.data.extensions.guessWhatImDrawing
  const gameMetadata = isRecord(extension) ? extension : {}
  const name = character.data.data.name

  return {
    id: character.id,
    name,
    avatar:
      typeof gameMetadata.avatar === 'string'
        ? gameMetadata.avatar
        : name.trim().charAt(0).toUpperCase() || '?',
    color:
      typeof gameMetadata.color === 'string'
        ? gameMetadata.color
        : FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    promptProfile: {
      name,
      description: character.data.data.description,
      personality: character.data.data.personality,
      scenario: character.data.data.scenario,
    },
    score: 0,
    guess: null,
  }
}

export async function listGuessers(): Promise<Guesser[]> {
  const characters = await layla.characters.list(0, 100)
  return characters.map(toGuesser)
}

export { layla }
