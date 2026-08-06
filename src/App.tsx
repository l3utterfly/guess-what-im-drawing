import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import { DrawingCanvas, type CanvasHandle } from './game/DrawingCanvas'
import { GuesserBar } from './game/GuesserBar'
import { BrushBar } from './game/BrushBar'
import { GameSetupModal } from './game/GameSetupModal'
import {
  guessers as initialGuessers,
  playerOptions,
  round as initialRound,
  sampleIncorrectGuesses,
  topicOptions,
} from './game/mockData'
import {
  applyGuess,
  CORRECT_GUESS_PROBABILITY,
  isCorrectGuess,
  WINNING_SCORE,
} from './game/gameLogic'
import type { Guesser, TopicOption } from './game/types'

const COLORS = [
  '#1e1e2e', // ink
  '#ffffff', // eraser (canvas is white)
  '#ff5d8f', // pink
  '#ff8f3f', // orange
  '#ffd23f', // yellow
  '#22c55e', // green
  '#38bdf8', // sky
  '#6366f1', // indigo
  '#a855f7', // purple
  '#8b5e3c', // brown
]

const SIZES = [4, 10, 18, 30]

interface GameState {
  guessers: Guesser[]
  correctGuesserIds: string[]
  winnerId: string | null
}

type GameAction =
  | { type: 'start'; guessers: Guesser[] }
  | { type: 'speak'; guesserId: string; guess: string; prompt: string }
  | { type: 'nextRound' }
  | { type: 'reset' }

const freshGuessers = (guessers: Guesser[]) =>
  guessers.map((guesser) => ({ ...guesser, score: 0, guess: null }))

const initialGameState: GameState = {
  guessers: freshGuessers(initialGuessers),
  correctGuesserIds: [],
  winnerId: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return { guessers: freshGuessers(action.guessers), correctGuesserIds: [], winnerId: null }
    case 'speak': {
      if (state.winnerId) return state
      const outcome = applyGuess(
        state.guessers,
        state.correctGuesserIds,
        action.guesserId,
        action.guess,
        action.prompt,
      )
      return {
        guessers: outcome.guessers,
        correctGuesserIds: outcome.correctGuesserIds,
        winnerId: outcome.winnerId,
      }
    }
    case 'nextRound':
      return {
        ...state,
        guessers: state.guessers.map((guesser) => ({ ...guesser, guess: null })),
        correctGuesserIds: [],
      }
    case 'reset':
      return initialGameState
  }
}

function App() {
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [hint, setHint] = useState('')
  const [showPrompt, setShowPrompt] = useState(true)
  const [game, dispatchGame] = useReducer(gameReducer, initialGameState)
  const [round, setRound] = useState(initialRound)
  const [selectedTopic, setSelectedTopic] = useState<TopicOption>(topicOptions[0])
  const [roundNumber, setRoundNumber] = useState(1)
  const [showSetup, setShowSetup] = useState(true)
  const canvasRef = useRef<CanvasHandle>(null)
  const winner = game.guessers.find((guesser) => guesser.id === game.winnerId) ?? null
  const roundComplete =
    game.guessers.length > 0 && game.correctGuesserIds.length === game.guessers.length

  // Local test simulation: one eligible character speaks each tick, with an
  // independent 30% chance that their message contains the drawing prompt.
  useEffect(() => {
    if (showSetup || game.winnerId || roundComplete) return

    const timer = setInterval(() => {
      const eligibleGuessers = game.guessers.filter(
        (guesser) => !game.correctGuesserIds.includes(guesser.id),
      )
      const speaker = eligibleGuessers[Math.floor(Math.random() * eligibleGuessers.length)]
      if (!speaker) return

      const shouldBeCorrect = Math.random() < CORRECT_GUESS_PROBABILITY
      const incorrectGuesses = sampleIncorrectGuesses.filter(
        (guess) => !isCorrectGuess(guess, round.prompt),
      )
      const guess = shouldBeCorrect
        ? `Is it ${round.prompt}?`
        : incorrectGuesses[Math.floor(Math.random() * incorrectGuesses.length)] ?? 'I am not sure yet'

      dispatchGame({ type: 'speak', guesserId: speaker.id, guess, prompt: round.prompt })
    }, 1600)
    return () => clearInterval(timer)
  }, [game.correctGuesserIds, game.guessers, game.winnerId, round.prompt, roundComplete, showSetup])

  // Once all four placements are filled, preserve the scores and move to the
  // next drawing in the selected topic.
  useEffect(() => {
    if (showSetup || game.winnerId || !roundComplete) return

    const timer = setTimeout(() => {
      const currentPromptIndex = selectedTopic.prompts.indexOf(round.prompt)
      const nextPromptIndex = (currentPromptIndex + 1) % selectedTopic.prompts.length
      setRound({
        topic: selectedTopic.topic,
        topicEmoji: selectedTopic.topicEmoji,
        prompt: selectedTopic.prompts[nextPromptIndex],
      })
      setRoundNumber((current) => current + 1)
      dispatchGame({ type: 'nextRound' })
      canvasRef.current?.clear()
    }, 1800)

    return () => clearTimeout(timer)
  }, [game.winnerId, round.prompt, roundComplete, selectedTopic, showSetup])

  const sendHint = () => {
    if (!hint.trim()) return
    // UI only — no network yet.
    setHint('')
  }

  const startGame = (players: Guesser[], topic: TopicOption) => {
    const firstPrompt = topic.prompts[0] ?? topic.prompt
    dispatchGame({ type: 'start', guessers: players })
    setSelectedTopic(topic)
    setRound({ topic: topic.topic, topicEmoji: topic.topicEmoji, prompt: firstPrompt })
    setRoundNumber(1)
    setShowSetup(false)
  }

  const restartGame = () => {
    canvasRef.current?.clear()
    setColor(COLORS[0])
    setSize(SIZES[1])
    setHint('')
    setShowPrompt(true)
    dispatchGame({ type: 'reset' })
    setRound(initialRound)
    setSelectedTopic(topicOptions[0])
    setRoundNumber(1)
    setShowSetup(true)
  }

  return (
    <div className="app">
      <div className="phone" aria-hidden={showSetup || undefined}>
        {/* Topic — visible to everyone */}
        <header className="topic">
          <span className="topic-label">Topic</span>
          <span className="topic-value">
            <span className="topic-emoji">{round.topicEmoji}</span>
            {round.topic}
          </span>
          <button
            type="button"
            className="restart-btn"
            onClick={restartGame}
            aria-label="Restart game and return to setup"
          >
            <span className="restart-icon" aria-hidden="true">↻</span>
            Restart
          </button>
        </header>

        {/* Guessers with live chat bubbles */}
        <GuesserBar guessers={game.guessers} correctGuesserIds={game.correctGuesserIds} />

        <div className="round-status" aria-live="polite">
          <span>Round {roundNumber}</span>
          <span aria-hidden="true">•</span>
          <span>
            {roundComplete
              ? 'Next drawing coming up…'
              : `${game.correctGuesserIds.length} of ${game.guessers.length} guessed`}
          </span>
          <span aria-hidden="true">•</span>
          <span>First to {WINNING_SCORE} wins</span>
        </div>

        {/* The drawing surface */}
        <main className="canvas-wrap">
          <DrawingCanvas ref={canvasRef} color={color} size={size} />
        </main>

        {/* Secret prompt — only the drawer sees this */}
        <div className={'secret' + (showPrompt ? '' : ' secret--hidden')}>
          <div className="secret-left">
            <span className="secret-label">🤫 You're drawing</span>
            <span className="secret-word">{showPrompt ? round.prompt : '• • • • •'}</span>
          </div>
          <button
            type="button"
            className="secret-toggle"
            onClick={() => setShowPrompt((s) => !s)}
          >
            {showPrompt ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Brush colour + size */}
        <BrushBar
          colors={COLORS}
          sizes={SIZES}
          activeColor={color}
          activeSize={size}
          onColor={setColor}
          onSize={setSize}
          onClear={() => canvasRef.current?.clear()}
        />

        {/* Hint message box */}
        <div className="hintbox">
          <input
            className="hint-input"
            type="text"
            placeholder="Send a hint to the guessers…"
            value={hint}
            maxLength={80}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendHint()}
          />
          <button type="button" className="hint-send" onClick={sendHint} aria-label="Send hint">
            ➤
          </button>
        </div>
      </div>
      {showSetup && (
        <GameSetupModal players={playerOptions} topics={topicOptions} onStart={startGame} />
      )}
      {winner && (
        <div className="winner-backdrop">
          <div className="winner-card" role="dialog" aria-modal="true" aria-labelledby="winner-title">
            <span className="winner-confetti" aria-hidden="true">🎉</span>
            <div className="winner-avatar" style={{ boxShadow: `0 0 0 5px ${winner.color}` }}>
              {winner.avatar}
            </div>
            <span className="winner-eyebrow">We have a winner</span>
            <h1 id="winner-title">{winner.name} wins!</h1>
            <p>{winner.name} reached {winner.score} points first.</p>
            <button type="button" className="winner-button" onClick={restartGame}>
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
