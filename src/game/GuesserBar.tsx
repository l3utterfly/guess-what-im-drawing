import type { Guesser } from './types'

interface Props {
  guessers: Guesser[]
  correctGuesserIds: string[]
  activeGuesserId: string | null
}

export function GuesserBar({ guessers, correctGuesserIds, activeGuesserId }: Props) {
  return (
    <div className="guessers">
      {guessers.map((g) => {
        const isThinking = activeGuesserId === g.id
        // While the next character is thinking, hide the previous response so
        // two expanded bubbles cannot overlap on the compact game board.
        const bubbleText = isThinking ? 'Thinking…' : activeGuesserId ? null : g.guess

        return (
          <div className="guesser" key={g.id}>
            <div className="guesser-bubble-slot">
              {bubbleText && (
                <div
                  className={`chat-bubble${isThinking ? ' chat-bubble--thinking' : ''}`}
                  style={{ borderColor: g.color }}
                >
                  {bubbleText}
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
        )
      })}
    </div>
  )
}
