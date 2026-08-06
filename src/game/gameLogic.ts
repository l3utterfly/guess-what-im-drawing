import type { Guesser } from './types'

export const WINNING_SCORE = 30
export const ROUND_DURATION_SECONDS = 5 * 60
export const CORRECT_GUESS_PROBABILITY = 0.3
export const PLACEMENT_POINTS = [10, 5, 3, 2] as const

export interface GuessOutcome {
  guessers: Guesser[]
  correctGuesserIds: string[]
  pointsAwarded: number
  winnerId: string | null
}

/** Selects one prompt uniformly from a non-empty prompt pool. */
export function pickRandomPrompt(prompts: readonly string[]): string {
  if (prompts.length === 0) throw new Error('Cannot choose a prompt from an empty topic.')
  return prompts[Math.floor(Math.random() * prompts.length)] ?? prompts[0]
}

/** A guess is correct when it contains the complete prompt, ignoring case. */
export function isCorrectGuess(guess: string, prompt: string): boolean {
  const normalizedPrompt = prompt.trim().toLocaleLowerCase()
  return normalizedPrompt.length > 0 && guess.toLocaleLowerCase().includes(normalizedPrompt)
}

/**
 * Records one character's spoken guess and applies this round's placement score.
 * A character can only place once per drawing.
 */
export function applyGuess(
  guessers: Guesser[],
  correctGuesserIds: string[],
  guesserId: string,
  guess: string,
  prompt: string,
): GuessOutcome {
  const hasAlreadyGuessed = correctGuesserIds.includes(guesserId)
  const isCorrect = !hasAlreadyGuessed && isCorrectGuess(guess, prompt)
  const pointsAwarded = isCorrect ? (PLACEMENT_POINTS[correctGuesserIds.length] ?? 0) : 0
  const nextCorrectGuesserIds = isCorrect
    ? [...correctGuesserIds, guesserId]
    : correctGuesserIds
  let winnerId: string | null = null

  const nextGuessers = guessers.map((guesser) => {
    const nextScore = guesser.score + (guesser.id === guesserId ? pointsAwarded : 0)
    if (guesser.id === guesserId && pointsAwarded > 0 && nextScore >= WINNING_SCORE) {
      winnerId = guesser.id
    }

    return {
      ...guesser,
      guess: guesser.id === guesserId ? guess : null,
      score: nextScore,
    }
  })

  return {
    guessers: nextGuessers,
    correctGuesserIds: nextCorrectGuesserIds,
    pointsAwarded,
    winnerId,
  }
}
