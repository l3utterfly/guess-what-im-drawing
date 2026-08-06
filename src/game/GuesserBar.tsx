import type { Guesser } from './types'

interface Props {
  guessers: Guesser[]
  correctGuesserIds: string[]
  activeGuesserId: string | null
}

export function GuesserBar({ guessers, correctGuesserIds, activeGuesserId }: Props) {
  return (
    <div className="guessers">
      {guessers.map((g) => (
        <div className="guesser" key={g.id}>
          <div className="guesser-bubble-slot">
            {(g.guess || activeGuesserId === g.id) && (
              <div
                className={`chat-bubble${activeGuesserId === g.id ? ' chat-bubble--thinking' : ''}`}
                style={{ borderColor: g.color }}
              >
                {activeGuesserId === g.id ? 'Thinking…' : g.guess}
              </div>
            )}
          </div>
          <div
            className={`avatar${correctGuesserIds.includes(g.id) ? ' avatar--correct' : ''}`}
            style={{ boxShadow: `0 0 0 3px ${g.color}` }}
          >
            <span className="avatar-emoji">{g.avatar}</span>
            {correctGuesserIds.includes(g.id) && (
              <span className="correct-badge" aria-label="Guessed correctly">✓</span>
            )}
          </div>
          <div className="guesser-name">{g.name}</div>
          <div className="guesser-score">
            <span className="star">★</span>
            {g.score.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
