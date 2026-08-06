import { PLACEMENT_POINTS, WINNING_SCORE } from './gameLogic'
import type { Guesser } from './types'

interface Props {
  roundNumber: number
  prompt: string
  placements: Guesser[]
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
  gameWinner,
  onNextRound,
  onPlayAgain,
}: Props) {
  const roundWinner = placements[0]
  const title = gameWinner
    ? `${gameWinner.name} wins the game!`
    : `${roundWinner?.name ?? 'Someone'} wins the round!`

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
            {gameWinner ? 'Game complete' : `Round ${roundNumber} complete`}
          </span>
          <h1 id="round-complete-title">{title}</h1>
          <p>
            The drawing was <strong>{prompt}</strong>
            {gameWinner && <> · First to reach {WINNING_SCORE} points</>}
          </p>
        </div>

        <ol className="round-standings" aria-label={`Round ${roundNumber} standings`}>
          {placements.map((guesser, index) => (
            <li
              key={guesser.id}
              className={`round-standing${index === 0 ? ' round-standing--winner' : ''}`}
            >
              <span className={`placement placement--${index + 1}`} aria-label={PLACEMENT_LABELS[index]}>
                {PLACEMENT_MEDALS[index]}
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
                <small>{PLACEMENT_LABELS[index]} place</small>
              </span>
              <span className="standing-points">
                <strong>+{PLACEMENT_POINTS[index]}</strong>
                <small>{guesser.score} total</small>
              </span>
            </li>
          ))}
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
