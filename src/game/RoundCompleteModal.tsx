import { PLACEMENT_POINTS, WINNING_SCORE } from './gameLogic'
import type { Guesser } from './types'

interface Props {
  roundNumber: number
  prompt: string
  placements: Guesser[]
  guessers: Guesser[]
  timedOut: boolean
  gameWinner: Guesser | null
  onNextRound: () => void
  onPlayAgain: () => void
}

const PLACEMENT_LABELS = ['1st', '2nd', '3rd', '4th']
const PLACEMENT_MEDALS = ['🥇', '🥈', '🥉', '4']

export function RoundCompleteModal({
  roundNumber,
  prompt,
  placements,
  guessers,
  timedOut,
  gameWinner,
  onNextRound,
  onPlayAgain,
}: Props) {
  const roundWinner = placements[0]
  const results = [
    ...placements,
    ...guessers.filter((guesser) => !placements.some((placed) => placed.id === guesser.id)),
  ]
  const title = gameWinner
    ? `${gameWinner.name} wins the game!`
    : roundWinner
      ? `${roundWinner.name} wins the round!`
      : `Time's up!`

  return (
    <div className="round-complete-backdrop">
      <section
        className="round-complete-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-complete-title"
      >
        <div className="round-complete-header">
          <span className="round-complete-confetti" aria-hidden="true">
            {gameWinner ? '🏆' : '🎉'}
          </span>
          <span className="round-complete-eyebrow">
            {gameWinner
              ? 'Game complete'
              : timedOut
                ? `Time's up · Round ${roundNumber}`
                : `Round ${roundNumber} complete`}
          </span>
          <h1 id="round-complete-title">{title}</h1>
          <p>
            The drawing was <strong>{prompt}</strong>
            {gameWinner && <> · First to reach {WINNING_SCORE} points</>}
          </p>
        </div>

        <ol className="round-standings" aria-label={`Round ${roundNumber} standings`}>
          {results.map((guesser) => {
            const placementIndex = placements.findIndex((placed) => placed.id === guesser.id)
            const guessedCorrectly = placementIndex !== -1
            return (
              <li
                key={guesser.id}
                className={`round-standing${placementIndex === 0 ? ' round-standing--winner' : ''}${guessedCorrectly ? '' : ' round-standing--no-guess'}`}
              >
                <span
                  className={`placement${guessedCorrectly ? ` placement--${placementIndex + 1}` : ' placement--none'}`}
                  aria-label={guessedCorrectly ? PLACEMENT_LABELS[placementIndex] : 'No correct guess'}
                >
                  {guessedCorrectly ? PLACEMENT_MEDALS[placementIndex] : '—'}
                </span>
                <span
                  className="standing-avatar"
                  style={{ boxShadow: `0 0 0 3px ${guesser.color}` }}
                  aria-hidden="true"
                >
                  {guesser.avatar}
                </span>
                <span className="standing-player">
                  <strong>{guesser.name}</strong>
                  <small>
                    {guessedCorrectly
                      ? `${PLACEMENT_LABELS[placementIndex]} place`
                      : 'No correct guess'}
                  </small>
                </span>
                <span className="standing-points">
                  <strong>+{guessedCorrectly ? PLACEMENT_POINTS[placementIndex] : 0}</strong>
                  <small>{guesser.score} total</small>
                </span>
              </li>
            )
          })}
        </ol>

        <button
          type="button"
          className="round-complete-button"
          onClick={gameWinner ? onPlayAgain : onNextRound}
          autoFocus
        >
          {gameWinner ? 'Play again' : 'Start next round'}
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  )
}
