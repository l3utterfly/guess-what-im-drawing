/**
 * Provider-independent prompt types for one character's drawing guess.
 *
 * Keeping this module free of the Layla SDK makes the prompt easy to test,
 * tune, and eventually pass to any OpenAI-shaped chat client.
 */
export interface CharacterPromptProfile {
  name: string
  description?: string
  personality?: string
  scenario?: string
}

export interface IncorrectGuess {
  characterName: string
  guess: string
}

export interface BuildGuessPromptInput {
  character: CharacterPromptProfile
  topic: string
  incorrectGuesses: IncorrectGuess[]
  hints: string[]
  canvasImageDataUrl: string
}

export interface GuessSystemMessage {
  role: 'system'
  content: string
}

export interface GuessImageMessage {
  role: 'user'
  content: [
    {
      type: 'image_url'
      image_url: {
        url: string
      }
    },
  ]
}

export interface GuessPromptRequest {
  messages: [GuessSystemMessage, GuessImageMessage]
}

const clean = (value: string | undefined) => value?.trim() || ''

function formatCharacter(profile: CharacterPromptProfile): string {
  const details = [
    clean(profile.description) && `Description: ${clean(profile.description)}`,
    clean(profile.personality) && `Personality: ${clean(profile.personality)}`,
    clean(profile.scenario) && `Scenario: ${clean(profile.scenario)}`,
  ].filter(Boolean)

  return details.length > 0 ? details.join('\n') : 'No additional character details were provided.'
}

function formatIncorrectGuesses(guesses: IncorrectGuess[]): string {
  if (guesses.length === 0) return '- None yet.'
  return guesses.map(({ characterName, guess }) => `- ${characterName}: ${guess}`).join('\n')
}

function formatHints(hints: string[]): string {
  if (hints.length === 0) return '- None yet.'
  return hints.map((hint) => `- ${hint}`).join('\n')
}

export function buildGuessSystemPrompt(input: Omit<BuildGuessPromptInput, 'canvasImageDataUrl'>): string {
  const characterName = clean(input.character.name) || 'the current character'
  const topic = clean(input.topic) || 'an unspecified topic'

  return `You are ${characterName}. You are playing a fast, friendly game of Guess What I'm Drawing with the user and several other characters. Stay in character throughout the game.

Your character card:
${formatCharacter(input.character)}

The user will send you the latest screenshot of their drawing canvas. The drawing belongs to this topic: ${topic}.

Your goal is to identify the drawing before the other characters. Study the whole image, use the topic and hints, and make your single best guess based only on the drawing as it currently appears.

Incorrect guesses made so far by other players:
${formatIncorrectGuesses(input.incorrectGuesses)}

Hints from the user:
${formatHints(input.hints)}

Rules for your response:
- Make exactly one concrete guess.
- Do not repeat any guess listed as incorrect.
- Keep the response brief and natural, as if saying it aloud during the game.
- Express the guess in your character's voice, but do not add analysis, a list of possibilities, or commentary about the prompt.
- If the drawing is rough or incomplete, still make the best guess you can from the visible evidence.
- Never claim you can see details that are not present in the image.`
}

/** Builds the complete two-message request expected by the guessing flow. */
export function buildGuessPrompt(input: BuildGuessPromptInput): GuessPromptRequest {
  return {
    messages: [
      {
        role: 'system',
        content: buildGuessSystemPrompt(input),
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: input.canvasImageDataUrl },
          },
        ],
      },
    ],
  }
}

/** Logs the full request for prompt tuning before it is sent to Layla. */
export function logGuessPrompt(characterName: string, request: GuessPromptRequest): void {
  console.groupCollapsed(`[Guess What I'm Drawing] LLM prompt for ${characterName}`)
  console.log('System prompt:\n' + request.messages[0].content)
  console.log('User image message:', request.messages[1])
  console.log('Complete request:', request)
  console.groupEnd()
}

/** Logs the final visible completion returned for a character's turn. */
export function logGuessResponse(characterName: string, response: string): void {
  console.groupCollapsed(`[Guess What I'm Drawing] LLM response from ${characterName}`)
  console.log(response)
  console.groupEnd()
}
