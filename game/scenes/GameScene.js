import { Scene, manager } from "@tialops/maki";

import { Dialog } from "../components/Dialog.js";
import { NPCController } from "../core/NPCController.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { dad as dadDialog } from "../data/dialogs.js";
import { showEmote } from "../core/EmoteController.js";

/**
 * Main game scene - initializes and updates all game objects
 *
 * Handles:
 * - Player movement and animations
 * - NPC creation and interactions
 * - Dialog system
 */
export default class GameScene extends Scene {
  /**
   * Load assets (sprites, maps) before scene starts
   */
  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "dad", "dad");
    SpriteLoader.loadImage(this, "emote_exclamation", "exclamation");
    manager.map(this, "begin");
    manager.preload(this);
  }

  /**
   * Create game objects after scene loads
   */
  create() {
    super.create();
    manager.create(this);

    this.player = PlayerController.create(this, 152, 152, "player");
    this.dad = NPCController.create(this, 16 * 16.5, 16 * 9, "dad");
    this.keys = PlayerController.setupInput(this);

    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "dad", "dad");

    // Wall collisions
    this.physics.add.collider(this.player, manager.getWallGroup(this, "begin"));
    this.physics.add.collider(this.dad, manager.getWallGroup(this, "begin"));
    this.dad.body.setImmovable(true);
    this.physics.add.collider(this.player, this.dad);

    // Show emote over dad when scene appears
    this.dadEmote = showEmote(this, this.dad, "exclamation", 0); // 0 = infinite, no auto-hide
  }

  /**
   * Update loop - runs every frame
   * @param {number} time - Current timestamp in milliseconds
   */
  update(time) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
    NPCController.handleAnimation(this.dad, time);
    Dialog.update(time);

    // Handle E or Space key press for NPC interaction
    if (
      (!this.ePressed && this.keys.e.isDown) ||
      (!this.spacePressed && this.keys.space.isDown)
    ) {
      this.ePressed = true;
      this.spacePressed = true;
      this.handleNPCTalk();
    }
    if (!this.keys.e.isDown) {
      this.ePressed = false;
    }
    if (!this.keys.space.isDown) {
      this.spacePressed = false;
    }
  }

  /**
   * Handle NPC interaction when E is pressed near an NPC
   */
  handleNPCTalk() {
    const dx = this.player.x - this.dad.x;
    const dy = this.player.y - this.dad.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      if (Dialog.isOpen()) {
        Dialog.skip();
      } else {
        // Hide emote when starting to talk
        if (this.dadEmote) {
          this.dadEmote.destroy();
          this.dadEmote = null;
        }
        Dialog.open(this, dadDialog);
      }
    }
  }
}
