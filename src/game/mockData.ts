import type { Guesser, Round } from './types'

export const round: Round = {
  topic: 'Animals',
  topicEmoji: '🐾',
  prompt: 'Elephant',
}

export const guessers: Guesser[] = [
  { id: 'maya', name: 'Maya', avatar: '🦊', color: '#ff5d8f', score: 1200, guess: null },
  { id: 'leo', name: 'Leo', avatar: '🐼', color: '#38bdf8', score: 980, guess: null },
  { id: 'zoe', name: 'Zoe', avatar: '🐵', color: '#22c55e', score: 1540, guess: null },
  { id: 'kai', name: 'Kai', avatar: '🐰', color: '#a855f7', score: 760, guess: null },
]

/** Sample guesses used to animate the chat bubbles in this UI-only build. */
export const sampleGuesses = [
  'a big dog?',
  'is it a mouse',
  'GIRAFFE!!',
  'rhino??',
  'ELEPHANT',
  'a hippo',
  'wait i know this',
  'trunk = elephant!',
]
