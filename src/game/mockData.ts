import type { Round, TopicOption } from './types'

export const round: Round = {
  topic: 'Animals',
  topicEmoji: '🐾',
  prompt: 'Elephant',
}

export const topicOptions: TopicOption[] = [
  {
    id: 'animals',
    topic: 'Animals',
    topicEmoji: '🐾',
    prompt: 'Elephant',
    prompts: ['Elephant', 'Giraffe', 'Penguin', 'Butterfly', 'Octopus'],
    description: 'Furry, feathered, and wildly fun.',
    color: '#ff8f3f',
  },
  {
    id: 'food',
    topic: 'Food',
    topicEmoji: '🍕',
    prompt: 'Pizza',
    prompts: ['Pizza', 'Ice cream', 'Hamburger', 'Birthday cake', 'Watermelon'],
    description: 'Tasty treats and kitchen favourites.',
    color: '#ff5d8f',
  },
  {
    id: 'places',
    topic: 'Places',
    topicEmoji: '🏖️',
    prompt: 'Lighthouse',
    prompts: ['Lighthouse', 'Beach', 'Castle', 'Playground', 'Train station'],
    description: 'From city streets to faraway shores.',
    color: '#38bdf8',
  },
  {
    id: 'things',
    topic: 'Everyday things',
    topicEmoji: '💡',
    prompt: 'Umbrella',
    prompts: ['Umbrella', 'Bicycle', 'Alarm clock', 'Toothbrush', 'Backpack'],
    description: 'Familiar objects with surprising shapes.',
    color: '#a78bfa',
  },
  {
    id: 'fantasy',
    topic: 'Fantasy',
    topicEmoji: '🐉',
    prompt: 'Dragon',
    prompts: ['Dragon', 'Magic wand', 'Mermaid', 'Treasure chest', 'Unicorn'],
    description: 'Magic, monsters, and make-believe.',
    color: '#22c55e',
  },
  {
    id: 'space',
    topic: 'Outer space',
    topicEmoji: '🚀',
    prompt: 'Rocket',
    prompts: ['Rocket', 'Saturn', 'Astronaut', 'Flying saucer', 'Telescope'],
    description: 'Planets, astronauts, and cosmic wonders.',
    color: '#6366f1',
  },
]

/** Incorrect guesses used by the local game simulation. */
export const sampleIncorrectGuesses = [
  'a big dog?',
  'is it a mouse',
  'GIRAFFE!!',
  'rhino??',
  'a hippo',
  'wait i know this',
  'give me another second',
]
