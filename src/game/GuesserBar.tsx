import type { Guesser } from './types'

interface Props {
  guessers: Guesser[]
}

export function GuesserBar({ guessers }: Props) {
  return (
    <div className="guessers">
      {guessers.map((g) => (
        <div className="guesser" key={g.id}>
          <div className="guesser-bubble-slot">
            {g.guess && (
              <div className="chat-bubble" style={{ borderColor: g.color }}>
                {g.guess}
              </div>
            )}
          </div>
          <div className="avatar" style={{ boxShadow: `0 0 0 3px ${g.color}` }}>
            <span className="avatar-emoji">{g.avatar}</span>
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
