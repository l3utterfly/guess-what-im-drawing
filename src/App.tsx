import { useEffect, useRef, useState } from 'react'
import './App.css'
import { DrawingCanvas, type CanvasHandle } from './game/DrawingCanvas'
import { GuesserBar } from './game/GuesserBar'
import { BrushBar } from './game/BrushBar'
import { GameSetupModal } from './game/GameSetupModal'
import {
  guessers as initialGuessers,
  playerOptions,
  round as initialRound,
  sampleGuesses,
  topicOptions,
} from './game/mockData'
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

function App() {
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [hint, setHint] = useState('')
  const [showPrompt, setShowPrompt] = useState(true)
  const [guessers, setGuessers] = useState<Guesser[]>(initialGuessers)
  const [round, setRound] = useState(initialRound)
  const [showSetup, setShowSetup] = useState(true)
  const canvasRef = useRef<CanvasHandle>(null)

  // UI-only flourish: randomly pop guess bubbles above the guessers so the
  // chat-bubble feature is visible without a backend.
  useEffect(() => {
    const timer = setInterval(() => {
      setGuessers((prev) =>
        prev.map((g) =>
          Math.random() < 0.4
            ? { ...g, guess: sampleGuesses[Math.floor(Math.random() * sampleGuesses.length)] }
            : Math.random() < 0.5
              ? { ...g, guess: null }
              : g,
        ),
      )
    }, 1600)
    return () => clearInterval(timer)
  }, [])

  const sendHint = () => {
    if (!hint.trim()) return
    // UI only — no network yet.
    setHint('')
  }

  const startGame = (players: Guesser[], topic: TopicOption) => {
    setGuessers(players)
    setRound({ topic: topic.topic, topicEmoji: topic.topicEmoji, prompt: topic.prompt })
    setShowSetup(false)
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
        </header>

        {/* Guessers with live chat bubbles */}
        <GuesserBar guessers={guessers} />

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
    </div>
  )
}

export default App
