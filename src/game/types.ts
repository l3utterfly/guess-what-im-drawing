export interface Guesser {
  id: string
  name: string
  avatar: string // emoji
  color: string // accent color for avatar ring / bubble
  score: number
  /** The guess currently being "shouted" — null when quiet. */
  guess: string | null
}

export interface Round {
  /** Broad category shown to everyone at the very top. */
  topic: string
  topicEmoji: string
  /** Exact word to draw — only the drawer (this screen) sees it. */
  prompt: string
}

export interface TopicOption {
  id: string
  topic: string
  topicEmoji: string
  description: string
  color: string
  /** Drawing prompts used for consecutive rounds in this topic. */
  prompts: [string, ...string[]]
}
