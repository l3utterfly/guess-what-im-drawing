import { useEffect, useRef, useState } from 'react'
import type { Guesser, TopicOption } from './types'

interface Props {
  players: Guesser[]
  topics: TopicOption[]
  charactersLoading: boolean
  charactersError: string | null
  onStart: (players: Guesser[], topic: TopicOption) => void
}

const MAX_PLAYERS = 4

export function GameSetupModal({
  players,
  topics,
  charactersLoading,
  charactersError,
  onStart,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id ?? '')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', trapFocus)
    }
  }, [])

  const togglePlayer = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((selectedId) => selectedId !== id)
      if (current.length === MAX_PLAYERS) return current
      return [...current, id]
    })
  }

  const selectedPlayers = selectedIds
    .map((id) => players.find((player) => player.id === id))
    .filter((player): player is Guesser => Boolean(player))
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId)

  return (
    <div className="setup-backdrop">
      <div
        ref={dialogRef}
        className="setup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-title"
        tabIndex={-1}
      >
        <div className="setup-glow setup-glow--one" />
        <div className="setup-glow setup-glow--two" />

        <header className="setup-header">
          <div className="setup-brand" aria-label="Guess what I'm drawing">
            <span className="setup-brand-mark" aria-hidden="true">
              ✎
            </span>
            <span>Guess what I’m drawing</span>
          </div>
          <div className="setup-progress" aria-label={`Step ${step} of 2`}>
            <span className={step === 1 ? 'is-active' : 'is-complete'}>1</span>
            <i />
            <span className={step === 2 ? 'is-active' : ''}>2</span>
          </div>
        </header>

        <main className="setup-content">
          {step === 1 ? (
            <section className="setup-step" aria-labelledby="setup-title">
              <div className="setup-copy">
                <span className="setup-eyebrow">First, build your crew</span>
                <h1 id="setup-title">Who’s guessing with you?</h1>
                <p>
                  You draw the secret word while your four friends race to guess it. Send a
                  hint if they get stuck, and earn points when someone gets it right.
                </p>
              </div>

              <div className="player-picker-heading">
                <div>
                  <strong>Pick 4 characters</strong>
                  <span>Fill every spot before you can start.</span>
                </div>
                <span className="player-picker-count" aria-live="polite">
                  {selectedIds.length}<small> / {MAX_PLAYERS}</small>
                </span>
              </div>

              <div className="player-picker" aria-label="Choose exactly four characters">
                {charactersLoading && (
                  <div className="player-picker-state" role="status">
                    Loading your Layla characters…
                  </div>
                )}
                {!charactersLoading && charactersError && (
                  <div className="player-picker-state player-picker-state--error" role="alert">
                    {charactersError}
                  </div>
                )}
                {!charactersLoading && !charactersError && players.map((player) => {
                  const selectedIndex = selectedIds.indexOf(player.id)
                  const isSelected = selectedIndex !== -1
                  const isUnavailable = !isSelected && selectedIds.length === MAX_PLAYERS
                  return (
                    <button
                      key={player.id}
                      type="button"
                      className={`player-option${isSelected ? ' player-option--selected' : ''}`}
                      aria-pressed={isSelected}
                      disabled={isUnavailable}
                      onClick={() => togglePlayer(player.id)}
                    >
                      <span
                        className="player-option-avatar"
                        style={{ '--player-color': player.color } as React.CSSProperties}
                      >
                        <span className="player-avatar-fallback" aria-hidden="true">
                          {player.avatar}
                        </span>
                        {player.profileImage && (
                          <img
                            src={player.profileImage}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                      </span>
                      <span className="player-option-info">
                        <strong>{player.name}</strong>
                      </span>
                      <span className="player-option-check" aria-hidden="true">
                        {isSelected ? selectedIndex + 1 : '✓'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : (
            <section className="setup-step" aria-labelledby="setup-title">
              <div className="setup-copy">
                <span className="setup-eyebrow">Now, set the scene</span>
                <h1 id="setup-title">Pick a topic</h1>
                <p>
                  Your secret word will come from this topic. Choose whatever sounds the most
                  fun to sketch.
                </p>
              </div>

              <div className="topic-picker" aria-label="Choose a topic">
                {topics.map((topic) => {
                  const isSelected = topic.id === selectedTopicId
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      className={`topic-option${isSelected ? ' topic-option--selected' : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTopicId(topic.id)}
                      style={{ '--topic-color': topic.color } as React.CSSProperties}
                    >
                      <span className="topic-option-icon" aria-hidden="true">
                        {topic.topicEmoji}
                      </span>
                      <span className="topic-option-info">
                        <strong>{topic.topic}</strong>
                        <small>{topic.description}</small>
                      </span>
                      <span className="topic-option-radio" aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </main>

        <footer className="setup-footer">
          <div className="setup-selection" aria-live="polite">
            {step === 1 ? (
              <>
                <strong>{selectedIds.length} of {MAX_PLAYERS}</strong> players selected
              </>
            ) : (
              <div className="setup-mini-crew" aria-label="Your selected players">
                {selectedPlayers.map((player) => (
                  <span key={player.id} style={{ '--player-color': player.color } as React.CSSProperties}>
                    <span className="player-avatar-fallback" aria-hidden="true">
                      {player.avatar}
                    </span>
                    {player.profileImage && (
                      <img
                        src={player.profileImage}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </span>
                ))}
                <small>Your crew is ready</small>
              </div>
            )}
          </div>

          <div className="setup-actions">
            {step === 2 && (
              <button type="button" className="setup-back" onClick={() => setStep(1)}>
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                className="setup-primary"
                disabled={selectedIds.length !== MAX_PLAYERS}
                onClick={() => setStep(2)}
              >
                {selectedIds.length === MAX_PLAYERS
                  ? 'Pick a topic'
                  : `Pick ${MAX_PLAYERS - selectedIds.length} more`}{' '}
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="setup-primary"
                disabled={!selectedTopic}
                onClick={() => selectedTopic && onStart(selectedPlayers, selectedTopic)}
              >
                Start drawing <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
