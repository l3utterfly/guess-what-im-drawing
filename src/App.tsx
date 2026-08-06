import { useEffect, useReducer, useRef, useState } from 'react'
import './App.css'
import { DrawingCanvas, type CanvasHandle } from './game/DrawingCanvas'
import { GuesserBar } from './game/GuesserBar'
import { BrushBar } from './game/BrushBar'
import { GameSetupModal } from './game/GameSetupModal'
import { RoundCompleteModal } from './game/RoundCompleteModal'
import { sampleIncorrectGuesses } from './game/mockData'
import { defaultTopic, initialRound, topicOptions } from './game/topics'
import {
  applyGuess,
  CORRECT_GUESS_PROBABILITY,
  isCorrectGuess,
  ROUND_DURATION_SECONDS,
  WINNING_SCORE,
} from './game/gameLogic'
import type { Guesser, TopicOption } from './game/types'
import { listGuessers } from './layla/client'

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
  remainingSeconds: number
  roundEndsAt: number
  roundEnded: boolean
}

type GameAction =
  | { type: 'start'; guessers: Guesser[]; now: number }
  | { type: 'speak'; guesserId: string; guess: string; prompt: string; now: number }
  | { type: 'tick'; now: number }
  | { type: 'nextRound'; now: number }
  | { type: 'reset' }

const freshGuessers = (guessers: Guesser[]) =>
  guessers.map((guesser) => ({ ...guesser, score: 0, guess: null }))

const initialGameState: GameState = {
  guessers: [],
  correctGuesserIds: [],
  winnerId: null,
  remainingSeconds: ROUND_DURATION_SECONDS,
  roundEndsAt: 0,
  roundEnded: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start':
      return {
        guessers: freshGuessers(action.guessers),
        correctGuesserIds: [],
        winnerId: null,
        remainingSeconds: ROUND_DURATION_SECONDS,
        roundEndsAt: action.now + ROUND_DURATION_SECONDS * 1000,
        roundEnded: false,
      }
    case 'speak': {
      if (state.roundEnded) return state
      if (action.now >= state.roundEndsAt) {
        return { ...state, remainingSeconds: 0, roundEnded: true }
      }

      const outcome = applyGuess(
        state.guessers,
        state.correctGuesserIds,
        action.guesserId,
        action.guess,
        action.prompt,
      )
      return {
        ...state,
        guessers: outcome.guessers,
        correctGuesserIds: outcome.correctGuesserIds,
        winnerId: state.winnerId ?? outcome.winnerId,
        roundEnded: outcome.correctGuesserIds.length === outcome.guessers.length,
      }
    }
    case 'tick': {
      if (state.roundEnded) return state
      const remainingSeconds = Math.max(0, Math.ceil((state.roundEndsAt - action.now) / 1000))
      return {
        ...state,
        remainingSeconds,
        roundEnded: remainingSeconds === 0,
      }
    }
    case 'nextRound':
      return {
        ...state,
        guessers: state.guessers.map((guesser) => ({ ...guesser, guess: null })),
        correctGuesserIds: [],
        remainingSeconds: ROUND_DURATION_SECONDS,
        roundEndsAt: action.now + ROUND_DURATION_SECONDS * 1000,
        roundEnded: false,
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
  const [selectedTopic, setSelectedTopic] = useState<TopicOption>(defaultTopic)
  const [roundNumber, setRoundNumber] = useState(1)
  const [showSetup, setShowSetup] = useState(true)
  const [playerOptions, setPlayerOptions] = useState<Guesser[]>([])
  const [charactersLoading, setCharactersLoading] = useState(true)
  const [charactersError, setCharactersError] = useState<string | null>(null)
  const canvasRef = useRef<CanvasHandle>(null)
  const winner = game.guessers.find((guesser) => guesser.id === game.winnerId) ?? null
  const roundComplete = game.roundEnded
  const roundPlacements = game.correctGuesserIds
    .map((id) => game.guessers.find((guesser) => guesser.id === id))
    .filter((guesser): guesser is Guesser => Boolean(guesser))
  const timerMinutes = Math.floor(game.remainingSeconds / 60)
  const timerSeconds = game.remainingSeconds % 60
  const formattedTime = `${timerMinutes}:${timerSeconds.toString().padStart(2, '0')}`

  useEffect(() => {
    let active = true

    void listGuessers()
      .then((characters) => {
        if (!active) return
        setPlayerOptions(characters)
        setCharactersError(
          characters.length < 4 ? 'Layla needs at least four characters to start a game.' : null,
        )
      })
      .catch((error: unknown) => {
        if (!active) return
        setCharactersError(
          error instanceof Error ? error.message : 'Could not load characters from Layla.',
        )
      })
      .finally(() => {
        if (active) setCharactersLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (showSetup || roundComplete) return

    const updateTimer = () => dispatchGame({ type: 'tick', now: Date.now() })
    updateTimer()
    const timer = setInterval(updateTimer, 250)
    return () => clearInterval(timer)
  }, [roundComplete, showSetup])

  // Local test simulation: one eligible character speaks each tick, with an
  // independent 30% chance that their message contains the drawing prompt.
  useEffect(() => {
    if (showSetup || roundComplete) return

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

      dispatchGame({
        type: 'speak',
        guesserId: speaker.id,
        guess,
        prompt: round.prompt,
        now: Date.now(),
      })
    }, 1600)
    return () => clearInterval(timer)
  }, [game.correctGuesserIds, game.guessers, round.prompt, roundComplete, showSetup])

  const sendHint = () => {
    if (!hint.trim()) return
    // UI only — no network yet.
    setHint('')
  }

  const startGame = (players: Guesser[], topic: TopicOption) => {
    const firstPrompt = topic.prompts[0]
    dispatchGame({ type: 'start', guessers: players, now: Date.now() })
    setSelectedTopic(topic)
    setRound({ topic: topic.topic, topicEmoji: topic.topicEmoji, prompt: firstPrompt })
    setRoundNumber(1)
    setShowSetup(false)
  }

  const startNextRound = () => {
    const currentPromptIndex = selectedTopic.prompts.indexOf(round.prompt)
    const nextPromptIndex = (currentPromptIndex + 1) % selectedTopic.prompts.length
    setRound({
      topic: selectedTopic.topic,
      topicEmoji: selectedTopic.topicEmoji,
      prompt: selectedTopic.prompts[nextPromptIndex],
    })
    setRoundNumber((current) => current + 1)
    setShowPrompt(true)
    dispatchGame({ type: 'nextRound', now: Date.now() })
    canvasRef.current?.clear()
  }

  const restartGame = () => {
    canvasRef.current?.clear()
    setColor(COLORS[0])
    setSize(SIZES[1])
    setHint('')
    setShowPrompt(true)
    dispatchGame({ type: 'reset' })
    setRound(initialRound)
    setSelectedTopic(defaultTopic)
    setRoundNumber(1)
    setShowSetup(true)
  }

  return (
    <div className="app">
      <div className="phone" aria-hidden={showSetup || roundComplete || undefined}>
        {/* Topic — visible to everyone */}
        <header className="topic">
          <div
            className={`round-timer${game.remainingSeconds <= 60 ? ' round-timer--urgent' : ''}`}
            role="timer"
            aria-label={`${formattedTime} remaining in round ${roundNumber}`}
          >
            <span>Round {roundNumber}</span>
            <time>{formattedTime}</time>
          </div>
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
              ? 'Round complete'
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
        <GameSetupModal
          players={playerOptions}
          topics={topicOptions}
          charactersLoading={charactersLoading}
          charactersError={charactersError}
          onStart={startGame}
        />
      )}
      {roundComplete && (
        <RoundCompleteModal
          roundNumber={roundNumber}
          prompt={round.prompt}
          placements={roundPlacements}
          guessers={game.guessers}
          timedOut={game.remainingSeconds === 0}
          gameWinner={winner}
          onNextRound={startNextRound}
          onPlayAgain={restartGame}
        />
      )}
    </div>
  )
}

export default App
