# AGENTS.md

## Commands

- `yarn dev` — Start dev server (runs `cd game && maki dev`)
- `yarn tilemap` — Open tilemap editor (runs `cd game && maki tilemap`)

## Architecture

- **Game entry**: `game/game.js`
- **Config**: `game/maki.config.js` (canvas size, maps, sprites)
- **Scenes**: `game/scenes/*.js` (extend `Scene` from `@tialops/maki`)

## Setup

- Run `yarn` to install dependencies
- Run `yarn dev` to start dev server at http://localhost:5173