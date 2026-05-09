# Scene Development Guide

This document covers all systems that need to be handled when creating a new scene.

## Scene Structure

### Class Definition & Constructor

Every scene **must** define a unique `key` via the constructor:

```javascript
import { Scene, manager } from "@tialops/maki";

class MyScene extends Scene {
  constructor() {
    super({ key: "MyScene" });
  }
}
```

**Important:** Phaser uses `"default"` as the scene key if no key is provided. This causes a "duplicate key" error when multiple scenes are registered. Always use `super({ key: "SceneName" })`.

### preload()

Load all assets required for the scene.

```javascript
preload() {
  super.preload();
  SpriteLoader.load(this, "player", "player");
  SpriteLoader.load(this, "npc_name", "npc");
  manager.map(this, "map_name");
  manager.preload(this);
}
```

**Required:**
- `SpriteLoader.load()` for each sprite (player, NPCs, etc.)
- `manager.map()` for the tilemap
- `manager.preload()` to load map assets

### create()

Initialize all game objects and systems.

```javascript
create() {
  super.create();
  manager.create(this);

  // Player setup
  this.player = PlayerController.create(this, x, y, "player");
  this.keys = PlayerController.setupInput(this);

  // NPC setup
  this.npc = NPCController.create(this, x, y, "npc");

  // Animation setup
  SpriteLoader.createAnims(this, "player", "player");
  SpriteLoader.createAnims(this, "npc_name", "npc");

  // Physics setup
  this.physics.add.collider(this.player.hitbox, manager.getWallGroup(this, "map_name"));
  this.physics.add.collider(this.player.hitbox, this.npc.hitbox);
  this.npc.hitbox.body.setImmovable(true);

  // HUD setup (if using equipment)
  EquipmentHUD.init();
}
```

**Required:**
- Call `manager.create(this)` to create tilemap objects
- Create player with `PlayerController.create()`
- Setup input with `PlayerController.setupInput(this)`
- Add wall collisions with the appropriate map name
- Call `SpriteLoader.createAnims()` for each sprite

### update(time)

Main game loop - runs every frame.

```javascript
update(time) {
  // Movement - only when dialog is not open
  if (!Dialog.isOpen()) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
  }

  // Equipment update
  Equipment.update(this, this.player);

  // NPC animation
  NPCController.handleAnimation(this.npc, time);

  // Dialog system
  Dialog.update(time);

  // Scene transition (when player exits map)
  if (!this.sceneTransitioning && playerOutOfBounds()) {
    this.sceneTransitioning = true;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(NextScene);
    });
  }

  // Handle post-dialog callbacks
  if (this.shouldUnlockOnClose && !Dialog.isOpen()) {
    this.shouldUnlockOnClose = false;
    this.unlockExit();
  }

  // HUD update
  EquipmentHUD.update();

  // Interact prompts
  const nearInteractable = this.getNearInteractable();
  if (nearInteractable && !Dialog.isOpen()) {
    const prompt = nearInteractable.type === "pickable"
      ? "Space to pick up"
      : "Space to interact";
    Dialog.showInteractPrompt(this, prompt);
  } else {
    Dialog.hideInteractPrompt();
  }

  // Handle interaction (Space key)
  if (!this.spacePressed && this.keys.space.isDown) {
    this.spacePressed = true;
    this.handleInteraction();
  }
  if (!this.keys.space.isDown) {
    this.spacePressed = false;
  }
}
```

## Systems Overview

### PlayerController
- `create(scene, x, y, texture)` - Create player sprite
- `setupInput(scene)` - Setup WASD/Arrow keys
- `handleMovement(player, keys, speed?)` - Apply movement velocity
- `handleAnimation(player, keys, time)` - Play walking/idle animations

### NPCController
- `create(scene, x, y, texture)` - Create NPC sprite
- `handleAnimation(npc, time)` - Play idle animations

### Dialog
- `Dialog.open(scene, dialogData)` - Open dialog with array of lines
- `Dialog.skip()` - Skip typing or advance to next line
- `Dialog.update(time)` - Update typewriter effect
- `Dialog.isOpen()` - Check if dialog is active
- `Dialog.showInteractPrompt(scene, text)` - Show interaction hint
- `Dialog.hideInteractPrompt()` - Hide interaction hint

### Dialog Data Format

```javascript
const dialogData = [
  {
    speaker: "NPC Name",  // Optional - hides speaker label if omitted
    text: "Line of dialog text.",
    isEndOfDialog: true    // Optional - closes dialog after this line
  },
  // More lines...
];
```

### Interaction System

```javascript
getNearInteractable() {
  // Check near NPCs
  const nearNPC = InteractionManager.getNearObject(this.player, [this.npc], 25);
  if (nearNPC) return { type: "npc", target: nearNPC };

  // Check near pickables
  const nearPickable = InteractionManager.getNearObject(this.player, this.pickables, 18);
  if (nearPickable) return { type: "pickable", target: nearPickable };

  return null;
}

handleInteraction() {
  const interactable = this.getNearInteractable();
  if (!interactable) return;

  if (interactable.type === "npc") {
    this.handleNPCTalk(interactable.target);
  } else if (interactable.type === "pickable") {
    this.handlePickup(interactable.target);
  }
}
```

### Pickable Objects

```javascript
this.pickables = [];
this.createPickable(x, y, "sprite_key", { id: "item_id", name: "Item Name" });

createPickable(x, y, sprite, data) {
  const obj = this.physics.add.sprite(x, y, sprite);
  obj.setInteractive();
  obj.pickupData = data;
  this.pickables.push(obj);
  return obj;
}

handlePickup(obj) {
  if (obj.pickupData) {
    Inventory.add(obj.pickupData);
    obj.destroy();
    this.pickables = this.pickables.filter(p => p !== obj);
  }
}
```

### Equipment System

```javascript
handlePickup(obj) {
  const itemData = {
    ...obj.pickupData,
    texture: obj.texture.key,
    slot: "mainHand",  // or "armor", etc.
  };
  Inventory.add(itemData);
  Equipment.equip(this, this.player, itemData);
  obj.destroy();
}
```

### GameState

Use `GameState` to track persistent game state across scenes.

```javascript
import { GameState } from "../data/dialogs.js";

// Examples
GameState.hasWeapon = true;
GameState.exitUnlocked = true;

// Check in update
if (GameState.hasWeapon) { ... }
```

### Traveling Between Scenes

When a player can travel between multiple scenes (e.g., BeginScene ↔ Act1Scene), use GameState flags to track the player's journey and persist state.

**GameState flags:**
```javascript
export const GameState = {
  hasWeapon: false,
  exitUnlocked: false,
  playerHealth: 3,
  returnedFromAct1: false,  // true when returning from Act1 to Begin
  leftBeginScene: false,    // true when player exits Begin to another scene
  dadPosition: { x: 0, y: 0 },  // store NPC position when they disappear
};
```

**In the leaving scene (BeginScene):**
```javascript
create() {
  this.dad = null;
  this.sceneTransitioning = false;  // Reset flag on each scene load

  if (GameState.returnedFromAct1) {
    this.player = PlayerController.create(this, 268, 144, "player");
    this.player.setFlipX(true);
    // Re-equip weapon if player has one
    if (GameState.hasWeapon && Inventory.items.length > 0) {
      const weaponItem = Inventory.items[Inventory.items.length - 1];
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }
  } else {
    this.player = PlayerController.create(this, 152, 152, "player");
    this.dad = NPCController.create(this, 16 * 16.5, 16 * 9, "dad");
  }
}

// Only create pickables on fresh start
this.pickables = [];
if (!GameState.returnedFromAct1) {
  this.createPickable(208 + 8, 192 + 8, "sword1", WEAPONS.sword1);
}
```

```javascript
update(time) {
  // Don't forget to check this.dad exists before interacting
  if (this.dad) {
    NPCController.handleAnimation(this.dad, time);
  }

  // Transition when player exits bounds
  if (!this.sceneTransitioning && (this.player.x < 0 || this.player.x > 288 || this.player.y < 0 || this.player.y > 288)) {
    this.sceneTransitioning = true;
    GameState.leftBeginScene = true;
    if (this.dad) {
      GameState.dadPosition = { x: this.dad.x, y: this.dad.y };
      this.dad.destroy();
    }
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start("Act1Scene");
    });
  }
}
```

**In the arriving scene (Act1Scene):**
```javascript
create() {
  this.dad = null;  // Initialize to null first
  this.sceneTransitioning = false;

  this.player = PlayerController.create(this, 16, 144, "player");
  this.keys = PlayerController.setupInput(this);

  // Only show dad when entering from Begin (not when returning)
  if (GameState.leftBeginScene) {
    SpriteLoader.load(this, "dad", "dad");
    this.dad = NPCController.create(this, 48, 118, "dad");
    this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
    this.dad.hitbox.body.setImmovable(true);
    SpriteLoader.createAnims(this, "dad", "dad");
  }

  // Re-equip weapon
  if (GameState.hasWeapon) {
    const weaponItem = Inventory.items[Inventory.items.length - 1];
    if (weaponItem) {
      Equipment.equip(this, this.player, weaponItem);
    }
  }

  this.cameras.main.fadeIn(500);
}
```

```javascript
update(time) {
  // Check if dad exists before animating
  if (this.dad) {
    NPCController.handleAnimation(this.dad, time);
  }

  // Transition back when player walks to edge
  if (!this.sceneTransitioning && this.player.x < 0) {
    this.sceneTransitioning = true;
    GameState.returnedFromAct1 = true;  // Mark as returning
    GameState.leftBeginScene = false;
    this.cameras.main.fadeOut(500);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("BeginScene");
    });
  }
}
```

**Return transitions (going back):**
```javascript
// In BeginScene update - go back to Act1
if (!this.sceneTransitioning && this.player.x < 0) {
  this.sceneTransitioning = true;
  this.cameras.main.fadeOut(500);
  this.cameras.main.once("camerafadeoutcomplete", () => {
    this.scene.start("Act1Scene");
  });
}
```

### Scene Transitions

**Fade out and transition:**

```javascript
if (!this.sceneTransitioning && /* player exits bounds */) {
  this.sceneTransitioning = true;
  this.cameras.main.fadeOut(500);
  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start(NextScene);
  });
}
```

**Fade in on new scene:**

```javascript
create() {
  super.create();
  // Your scene setup...
  this.cameras.main.fadeIn(500);
}
```

## File Structure

```
game/
├── scenes/
│   ├── BeginScene.js      # First scene
│   ├── Act1Scene.js       # Next area scene
│   └── index.js
├── components/
│   ├── Dialog.js
│   └── EquipmentHUD.js
├── core/
│   ├── PlayerController.js
│   ├── NPCController.js
│   ├── InteractionManager.js
│   ├── Equipment.js
│   ├── Inventory.js
│   ├── SpriteLoader.js
│   └── EmoteController.js
├── data/
│   ├── dialogs.js         # All dialog data + GameState
│   └── events.js
└── assets/
    └── maps/
        └── mapname.json   # Tilemap data
```

## Map Configuration

Add new maps to `maki.config.js`:

```javascript
export default {
  maps: ["begin", "act1", "new_map"],
  sprites: [...],
};
```
