import { Scene, manager } from "@tialops/maki";

import { Dialog } from "../components/Dialog.js";
import { Equipment } from "../core/Equipment.js";
import { EquipmentHUD } from "../components/EquipmentHUD.js";
import { Inventory } from "../core/Inventory.js";
import { NPCController } from "../core/NPCController.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { dad as dadDialog } from "../data/dialogs.js";
import { showEmote } from "../core/EmoteController.js";
import { showItemPickup } from "../core/ItemPickupEffect.js";

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
    SpriteLoader.loadImage(this, "sword_pickup", "sword1");
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
    EquipmentHUD.init();

    // Wall collisions
    this.physics.add.collider(this.player, manager.getWallGroup(this, "begin"));
    this.physics.add.collider(this.dad, manager.getWallGroup(this, "begin"));
    this.dad.body.setImmovable(true);
    this.physics.add.collider(this.player, this.dad);

    // Show emote over dad when scene appears
    this.dadEmote = showEmote(this, this.dad, "exclamation", 0); // 0 = infinite, no auto-hide

    // Create pickable objects
    this.pickables = [];
    this.createPickable(208 + 8, 192 + 8, "sword_pickup", { id: "sword", name: "Sword" });
  }

  createPickable(x, y, sprite, data) {
    const obj = this.physics.add.sprite(x, y, sprite);
    obj.setInteractive();
    obj.pickupData = data;
    this.pickables.push(obj);
    return obj;
  }

  /**
   * Update loop - runs every frame
   * @param {number} time - Current timestamp in milliseconds
   */
  update(time) {
    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
    }
    Equipment.update(this, this.player);
    NPCController.handleAnimation(this.dad, time);
    Dialog.update(time);
    EquipmentHUD.update();

    // Update interact prompt
    const nearInteractable = this.getNearInteractable();
    if (nearInteractable && !Dialog.isOpen()) {
      const prompt = nearInteractable.type === "pickable" 
        ? "Space to pick up" 
        : "Space to interact";
      Dialog.showInteractPrompt(this, prompt);
    } else {
      Dialog.hideInteractPrompt();
    }

    // Handle Space key press for interaction
    if (!this.spacePressed && this.keys.space.isDown) {
      this.spacePressed = true;
      this.handleInteraction();
    }
    if (!this.keys.space.isDown) {
      this.spacePressed = false;
    }
  }

  getNearInteractable() {
    // Check NPC
    const dx = this.player.x - this.dad.x;
    const dy = this.player.y - this.dad.y;
    const distToNPC = Math.sqrt(dx * dx + dy * dy);
    if (distToNPC < 40) {
      return { type: "npc", target: this.dad };
    }

    // Check pickables
    for (const obj of this.pickables) {
      const pdx = this.player.x - obj.x;
      const pdy = this.player.y - obj.y;
      const dist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (dist < 30) {
        return { type: "pickable", target: obj };
      }
    }

    return null;
  }

  handleInteraction() {
    const interactable = this.getNearInteractable();
    if (!interactable) return;

    if (interactable.type === "npc") {
      this.handleNPCTalk();
    } else if (interactable.type === "pickable") {
      this.handlePickup(interactable.target);
    }
  }

  handlePickup(obj) {
    if (obj.pickupData) {
      const itemData = {
        ...obj.pickupData,
        texture: obj.texture.key,
        slot: "mainHand",
      };
      Inventory.add(itemData);
      showItemPickup(this, obj, obj.texture.key);
      Equipment.equip(this, this.player, itemData);
      obj.destroy();
      this.pickables = this.pickables.filter(p => p !== obj);
    }
  }

  isNearNPC() {
    const dx = this.player.x - this.dad.x;
    const dy = this.player.y - this.dad.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 40;
  }

/**
    * Handle NPC interaction when Space is pressed near an NPC
    */
  handleNPCTalk() {
    const dx = this.player.x - this.dad.x;
    const dy = this.player.y - this.dad.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      if (Dialog.isOpen()) {
        Dialog.skip();
      } else {
        // Turn to face player
        this.dad.setFlipX(this.player.x < this.dad.x);

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
