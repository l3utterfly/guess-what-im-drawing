import type { Guesser } from './types'

interface Props {
  guessers: Guesser[]
  correctGuesserIds: string[]
  activeGuesserId: string | null
  lastGuesserId: string | null
}

export function GuesserBar({
  guessers,
  correctGuesserIds,
  activeGuesserId,
  lastGuesserId,
}: Props) {
  const speakerId = activeGuesserId ?? lastGuesserId
  const speakerIndex = guessers.findIndex((guesser) => guesser.id === speakerId)
  const speaker = speakerIndex === -1 ? null : guessers[speakerIndex]
  const bubbleText = activeGuesserId ? 'Thinking…' : speaker?.guess
  const tailPosition = `${((speakerIndex + 0.5) / Math.max(guessers.length, 1)) * 100}%`

  return (
    <div className="guessers">
      <div
        className={`guesser-bubble-slot${bubbleText ? '' : ' guesser-bubble-slot--empty'}`}
        aria-live="polite"
      >
        {speaker && bubbleText && (
          <div
            className={`chat-bubble${activeGuesserId ? ' chat-bubble--thinking' : ''}`}
            style={{
              borderColor: speaker.color,
              '--bubble-tail-position': tailPosition,
            } as React.CSSProperties}
            aria-label={
              activeGuesserId
                ? `${speaker.name} is thinking`
                : `${speaker.name} says: ${bubbleText}`
            }
          >
            <div className="chat-bubble-content">{bubbleText}</div>
          </div>
        )}
      </div>

      <div className="guesser-roster">
        {guessers.map((g) => (
          <div className="guesser" key={g.id}>
            <div
              className={`avatar${correctGuesserIds.includes(g.id) ? ' avatar--correct' : ''}`}
              style={{ boxShadow: `0 0 0 3px ${g.color}` }}
            >
              <span className="avatar-emoji">{g.avatar}</span>
              {g.profileImage && (
                <img
                  className="avatar-image"
                  src={g.profileImage}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              )}
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
    </div>
  )
}
