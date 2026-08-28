# Guess What I'm Drawing

A Layla mini-app that turns your Layla characters into a party of quick-draw
guessers. Pick four characters and a topic, draw the secret prompt on the
canvas, and watch each character study your drawing through the Layla SDK and
race to shout out the answer.

**Play it now:** https://apps.layla-cloud.com/app/guess-what-im-drawing

## Gameplay

https://github.com/user-attachments/assets/a4b32d19-ac12-4ed3-9112-0fe2dcb45563

If the video does not play inline, watch it here: [assets/gwid.mp4](./assets/gwid.mp4).

## How To Play

1. **Set up the game.** Choose four Layla characters as your guessers and pick a
   topic. Available topics are Animals, Movies, Books, English idioms, and
   Places/Landmarks. Every character starts with **0 points**.
2. **See your secret prompt.** The first prompt is chosen at random from the
   topic. Only you, the drawer, can see it — tap **Hide** if you want to keep it
   off screen.
3. **Draw it.** Use the brush colours, sizes, eraser, and clear button to sketch
   the prompt. The round clock only starts on your first brush stroke.
4. **Watch the characters guess.** After you start drawing, each character takes
   turns studying a live snapshot of the canvas and calling out a guess in their
   own voice. The same character never guesses twice in a row while another
   character is still waiting.
5. **Send hints.** Type a hint into the message box to nudge the guessers. Hints
   and earlier incorrect guesses are shared with every character on their next
   turn.
6. **Finish the round.** A round ends when all four characters guess correctly or
   when the timer runs out. The round-complete screen shows placement order,
   points earned, and running totals.
7. **Play on.** Select **Start next round** to keep scores and draw a new prompt.
   The first character to reach **30 points** wins the game. **Restart** or
   **Play again** returns to setup and resets all scores.

## Game Rules

- A guess counts as correct when the character's message contains the drawing
  word or phrase. Matching is case-insensitive, so both `ELEPHANT!` and
  `Is it an elephant?` match the prompt `Elephant`.
- Each character can score once per drawing. Correct guesses earn points in
  placement order:

  | Placement | Points |
  | --- | ---: |
  | First | 10 |
  | Second | 5 |
  | Third | 3 |
  | Fourth | 2 |

- Each round lasts **5 minutes**. The countdown begins with the first brush
  stroke. When it reaches `0:00`, guessing stops immediately and characters
  without a correct guess receive 0 points.
- Later rounds choose a prompt at random from prompts not yet used in that game,
  resetting the pool only after every prompt has appeared.
- The first character to reach **30 points** wins.

## Technical Notes

- Built with **React 19**, **TypeScript**, and **Vite 8**, bundled to a single
  WebView-friendly file with `vite-plugin-singlefile` for the Layla host.
- **Game state** is a single `useReducer` in [`src/App.tsx`](./src/App.tsx). All
  scoring and matching lives in [`src/game/gameLogic.ts`](./src/game/gameLogic.ts)
  (`isCorrectGuess`, `applyGuess`, placement points, and the 30-point win
  condition), so the rules are pure and easy to test.
- **Turn selection** picks the next eligible character at random and never gives
  the same character two consecutive turns while another guesser is available. A
  turn does not advance until the current character's completion has finished.
- **The timer** is wall-clock based: `roundEndsAt` is a timestamp, and a 250 ms
  interval ticks the countdown down to `0:00`, at which point the round ends.
- **The canvas** exposes an imperative `getScreenshot()` handle that returns the
  latest drawing as a base64 PNG data URL. That image is what each character
  actually "sees".
- **The guess prompt** is provider-independent. [`src/prompting/guessPrompt.ts`](./src/prompting/guessPrompt.ts)
  builds a two-message, OpenAI-shaped request — a system message with the
  character card, topic, prior incorrect guesses, and user hints, plus a user
  message carrying the canvas screenshot as an `image_url`. Each request is
  logged to the browser console for prompt tuning before it is sent. A random
  personality instruction (frustration, teasing, over-confidence, art-critic
  drama, and so on) is appended to about half of replies so characters stay
  lively.

## Layla SDK Integration

The app talks to Layla entirely through `@layla-network/sdk`. The integration
points are small and isolated under [`src/layla/`](./src/layla):

- **Client** — [`src/layla/client.ts`](./src/layla/client.ts) creates a single
  `LaylaSDK` instance. `listGuessers()` calls `layla.characters.list()` and maps
  each `LaylaCharacter` into the game's `Guesser` shape, reading an optional
  `guessWhatImDrawing` extension on the character card for a custom avatar and
  colour. `loadGuesserProfileImages()` fetches portraits with
  `layla.characters.getImage()`, using an `AbortSignal` so pending image loads
  are cancelled cleanly.
- **Guessing** — [`src/layla/guessing.ts`](./src/layla/guessing.ts) sends the
  built prompt through `layla.chat.completions.create()` and returns the
  character's message. The provider-independent `messages` array is assigned to
  the SDK's `ChatCompletionMessageParam[]` type to verify the prompt builder
  still matches the SDK's OpenAI-shaped contract. Errors are classified with the
  SDK's typed errors — `LaylaAbortError` for cancelled turns and
  `LaylaBridgeUnavailableError` when the app runs outside a Layla host.
- **Development mock** — [`src/layla/mock.ts`](./src/layla/mock.ts) installs the
  SDK's browser mock via `installLaylaMock()` before the app renders in dev.
  It seeds eight demo characters and forwards each multimodal completion — image
  included — to a local **LM Studio** server at `http://localhost:1234/v1`, so
  you can develop and tune prompts without a device. Production builds skip the
  mock entirely (see [`src/main.tsx`](./src/main.tsx)) and read everything from
  the Layla WebView host. No model endpoint or API key ships in the production
  bundle.

Listing metadata for the Layla store lives in
[`public/app.json`](./public/app.json).

## Development

```bash
npm install
npm run dev
```

To exercise real character guesses locally, start LM Studio's local server on
`http://localhost:1234` with a vision-capable chat model loaded, then run
`npm run dev`.

Type-check, build, and lint with:

```bash
npm run build
npm run lint
```

`npm run build` writes a single-file bundle to `dist/`. A GitHub Actions
workflow ([`.github/workflows/build.yml`](./.github/workflows/build.yml)) builds
that bundle on push and publishes it as a zipped GitHub release artifact.

## Download

Play **Guess What I'm Drawing** from the Layla mini-app store:

**https://apps.layla-cloud.com/app/guess-what-im-drawing**

You will need the Layla app to run it:

<p>
  <a href="https://play.google.com/store/apps/details?id=com.layla">
    <img src="./assets/google_badge.png" alt="Get it on Google Play" height="60">
  </a>
  &nbsp;&nbsp;
  <a href="https://apps.apple.com/us/app/layla/id6456886656">
    <img src="./assets/apple_badge.png" alt="Download on the App Store" height="60">
  </a>
</p>

Visit the official Layla website: https://www.layla-network.ai/
