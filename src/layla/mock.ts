import {
  installLaylaMock,
  makeMockCharacter,
  type LaylaCharacter,
  type LaylaChatMessage,
} from '@layla-network/sdk'

const LM_STUDIO_CHAT_ENDPOINT = 'http://localhost:1234/v1/chat/completions'

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

interface LMStudioChatChunk {
  choices?: Array<{
    delta?: {
      content?: unknown
    }
  }>
}

function readContentDelta(line: string): string | null {
  const trimmedLine = line.trim()
  if (!trimmedLine.startsWith('data:')) return null

  const data = trimmedLine.slice('data:'.length).trim()
  if (!data || data === '[DONE]') return null

  const chunk = JSON.parse(data) as LMStudioChatChunk
  const content = chunk.choices?.[0]?.delta?.content
  return typeof content === 'string' ? content : null
}

async function* respondWithLMStudio(messages: LaylaChatMessage[]): AsyncGenerator<string> {
  const response = await fetch(LM_STUDIO_CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, stream: true }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      `LM Studio chat request failed (${response.status} ${response.statusText})${details ? `: ${details}` : ''}`,
    )
  }

  if (!response.body) {
    throw new Error('LM Studio returned a chat response without a readable body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false

  try {
    while (!finished) {
      const result = await reader.read()
      finished = result.done
      buffer += decoder.decode(result.value, { stream: !finished })

      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const content = readContentDelta(line)
        if (content) yield content
      }
    }

    const trailingContent = readContentDelta(buffer)
    if (trailingContent) yield trailingContent
  } finally {
    if (!finished) await reader.cancel()
    reader.releaseLock()
  }
}

export function installLocalLaylaMock() {
  return installLaylaMock({ characters, respond: respondWithLMStudio })
}
