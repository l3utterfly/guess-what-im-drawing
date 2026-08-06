import {
  LaylaAbortError,
  LaylaBridgeUnavailableError,
  LaylaError,
  type ChatCompletionMessageParam,
} from '@layla-network/sdk'
import type { GuessPromptRequest } from '../prompting'
import { layla } from './client'

/** Sends one completed prompt through Layla and returns the character's guess. */
export async function requestCharacterGuess(
  request: GuessPromptRequest,
  signal?: AbortSignal,
): Promise<string> {
  // This assignment deliberately verifies that the provider-independent
  // prompt builder still matches the SDK's OpenAI-shaped message contract.
  const messages: ChatCompletionMessageParam[] = request.messages
  console.log('[Guess What I\'m Drawing] System prompt:', request.messages[0].content)
  const completion = await layla.chat.completions.create({ messages, signal })
  const guess = completion.choices[0]?.message.content?.trim() ?? ''

  if (!guess) throw new Error('Layla returned an empty guess.')
  return guess
}

export function isGuessRequestAborted(error: unknown): boolean {
  return error instanceof LaylaAbortError
}

export function describeGuessRequestError(error: unknown): string {
  if (error instanceof LaylaBridgeUnavailableError) {
    return 'Character guessing is only available inside Layla.'
  }
  if (error instanceof LaylaError || error instanceof Error) return error.message
  return 'Could not get a character guess.'
}
