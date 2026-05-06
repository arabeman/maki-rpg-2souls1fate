# AGENTS.md

## Commands

- `yarn dev` — Start dev server (runs `cd game && maki dev`)
- `yarn tilemap` — Open tilemap editor (runs `cd game && maki tilemap`)

## Architecture

- **Game entry**: `game/game.js`
- **Config**: `game/maki.config.js` (canvas size, maps, sprites)
- **Scenes**: `game/scenes/*.js` (extend `Scene` from `@tialops/maki`)
- **Components**: `game/components/*.js` (Dialog, HUD, etc.)
- **Core**: `game/core/*.js` (PlayerController, NPCController, SpriteLoader)
- **Data**: `game/data/*.js` (dialogs, events, quests)

## Dialog System

- **Dialog data**: `game/data/dialogs.js` — Array of `{ text, portrait?, isEndOfDialog? }`
- **Dialog component**: `game/components/Dialog.js` — HTML overlay with typewriter effect
- Press `E` to skip typing or advance to next line

## Controllers

- **PlayerController**: Player creation, input handling, movement, animation
- **NPCController**: NPC creation, dialog triggering, pathfinding movement

## Conventions

Follow the [commit convention](../COMMIT_CONVENTION.md) when committing changes:

```
<type>(optional-scope): <short description>
```

Example: `feat(auth): add Google login`

## Setup

- Run `yarn` to install dependencies
- Run `yarn dev` to start dev server at http://localhost:5173