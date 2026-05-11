# OpenCode Agent Instructions

## Dev commands
- `yarn dev` — Start dev server (runs `cd game && maki dev`)
- `yarn tilemap` — Open tilemap editor

## Project structure
- `game/` — Phaser game built with `@tialops/maki`
- `game/scenes/` — Scene files (one file per act + BeginScene, EndScene)
- `game/core/` — PlayerController, BattleController, Equipment, etc.
- `game/components/` — Dialog, HUD components (EquipmentHUD, HealthHUD, PotionHUD, RestartHUD)
- `game/data/` — dialogs.js (GameState), weapons.js
- `game/assets/maps/*.json` — Tiled tilemap exports

## Battle system
- `BattleController.setup()` MUST be called in `create()` of every scene where combat is possible — it registers WASD attack keys and resets `isAttacking` state.
- `BattleController.attack(scene, player, keys)` triggers player attack; called in scene `update()` loop (e.g. Act1Scene, Act2Scene, Act3Scene).
- BeginScene was missing `BattleController.setup()` — it must call it in `create()` alongside `EquipmentHUD.init()`.
- `maki.config.js` sprites list includes weapon/emote/impact sprites. Add new sprites here then run `maki new sprite` to regenerate config.

## Key patterns
- Movement blocked when `Dialog.isOpen()` — check both PlayerController.handleMovement and scene-level update.
- Scene transitions use `cameras.main.fadeOut` with `camerafadeoutcomplete` listener.
- Persistence saves player position per scene key via `Persistence.saveSceneState`.
- Enemies are `{ sprite, weapon }` entries — AI and death logic iterate over `this.enemies`.

## Testing
- No test framework detected. Verify game runs with `yarn dev` and check browser console for errors.
- `?newGame=1` URL param clears all persistence for fresh start.