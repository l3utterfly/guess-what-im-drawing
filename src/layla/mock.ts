import { installLaylaMock, makeMockCharacter, type LaylaCharacter } from '@layla-network/sdk'

interface MockCharacterSeed {
  id: string
  name: string
  avatar: string
  color: string
}

const CHARACTER_SEEDS: MockCharacterSeed[] = [
  { id: 'maya', name: 'Maya', avatar: '🦊', color: '#ff5d8f' },
  { id: 'leo', name: 'Leo', avatar: '🐼', color: '#38bdf8' },
  { id: 'zoe', name: 'Zoe', avatar: '🐵', color: '#22c55e' },
  { id: 'kai', name: 'Kai', avatar: '🐰', color: '#a855f7' },
  { id: 'nova', name: 'Nova', avatar: '🐱', color: '#f59e0b' },
  { id: 'milo', name: 'Milo', avatar: '🐸', color: '#10b981' },
  { id: 'luna', name: 'Luna', avatar: '🦉', color: '#8b5cf6' },
  { id: 'ollie', name: 'Ollie', avatar: '🐨', color: '#f97316' },
]

const characters: LaylaCharacter[] = CHARACTER_SEEDS.map(({ id, name, avatar, color }) => ({
  ...makeMockCharacter(name, {
    description: `${name} is playing Guess What I'm Drawing with you.`,
    personality: 'playful, curious, competitive',
    tags: ['mock', 'guess-what-im-drawing'],
    creator: 'Guess What I\'m Drawing',
    extensions: {
      guessWhatImDrawing: { avatar, color },
    },
  }),
  id,
}))

export function installLocalLaylaMock() {
  return installLaylaMock({ characters })
}
