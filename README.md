# Guess What I'm Drawing

A local React and TypeScript drawing game. Choose four characters and a topic, draw the secret prompt, and watch the characters race to identify it.

## Game rules

- Every character starts each game with **0 points**.
- A guess is correct when the character's complete message contains the drawing word or phrase. Matching is case-insensitive, so both `ELEPHANT!` and `Is it an elephant?` match the prompt `Elephant`.
- Each character can score once per drawing. Correct guesses earn points in placement order:

  | Placement | Points |
  | --- | ---: |
  | First | 10 |
  | Second | 5 |
  | Third | 3 |
  | Fourth | 2 |

- Each round lasts **5 minutes**. The countdown begins with the first brush stroke and appears at the top of the game. When it reaches `0:00`, guessing stops immediately and characters without a correct guess receive 0 points.
- A round ends when all four characters guess correctly or the timer expires. The round-complete screen shows placement order, points earned, running totals, and any characters who did not guess correctly. The next drawing starts when **Start next round** is selected, and scores carry forward.
- The first character to reach **30 points** wins the game.
- Restarting or choosing **Play again** returns to setup and resets all scores.

## Local guess simulation

The current build simulates character speech so the game loop can be tested without connecting a model. Once the first brush stroke starts the round, one character who has not yet solved the current drawing speaks every 1.6 seconds. Each time a character speaks, there is an independent **30% probability** that their message contains the exact prompt; all other simulated messages are checked to ensure they do not accidentally contain it.

The scoring and matching rules live in `src/game/gameLogic.ts`. The simulation uses those same rules rather than awarding points directly.

## Layla characters

The character picker loads its roster through `@layla-network/sdk`. During local Vite development, the app installs the SDK's browser mock before rendering and seeds it with the eight demo characters. Production builds skip the mock and read characters from the Layla WebView host.

## Development

```bash
npm install
npm run dev
```

Run the production build and linter with:

```bash
npm run build
npm run lint
```
