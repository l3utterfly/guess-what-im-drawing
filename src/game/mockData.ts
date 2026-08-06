import type { Guesser, Round, TopicOption } from './types'

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

export const playerOptions: Guesser[] = [
  ...guessers,
  { id: 'nova', name: 'Nova', avatar: '🐱', color: '#f59e0b', score: 1320, guess: null },
  { id: 'milo', name: 'Milo', avatar: '🐸', color: '#10b981', score: 870, guess: null },
  { id: 'luna', name: 'Luna', avatar: '🦉', color: '#8b5cf6', score: 1110, guess: null },
  { id: 'ollie', name: 'Ollie', avatar: '🐨', color: '#f97316', score: 640, guess: null },
]

export const topicOptions: TopicOption[] = [
  {
    id: 'animals',
    topic: 'Animals',
    topicEmoji: '🐾',
    prompt: 'Elephant',
    description: 'Furry, feathered, and wildly fun.',
    color: '#ff8f3f',
  },
  {
    id: 'food',
    topic: 'Food',
    topicEmoji: '🍕',
    prompt: 'Pizza',
    description: 'Tasty treats and kitchen favourites.',
    color: '#ff5d8f',
  },
  {
    id: 'places',
    topic: 'Places',
    topicEmoji: '🏖️',
    prompt: 'Lighthouse',
    description: 'From city streets to faraway shores.',
    color: '#38bdf8',
  },
  {
    id: 'things',
    topic: 'Everyday things',
    topicEmoji: '💡',
    prompt: 'Umbrella',
    description: 'Familiar objects with surprising shapes.',
    color: '#a78bfa',
  },
  {
    id: 'fantasy',
    topic: 'Fantasy',
    topicEmoji: '🐉',
    prompt: 'Dragon',
    description: 'Magic, monsters, and make-believe.',
    color: '#22c55e',
  },
  {
    id: 'space',
    topic: 'Outer space',
    topicEmoji: '🚀',
    prompt: 'Rocket',
    description: 'Planets, astronauts, and cosmic wonders.',
    color: '#6366f1',
  },
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
