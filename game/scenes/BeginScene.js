import {
  GameState,
  dadDialogHasSword,
  dadDialogNoSword,
  dadDialogUnlock,
} from "../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";
import Act1Scene from "./Act1Scene.js";

import { Dialog } from "../components/Dialog.js";
import { Equipment } from "../core/Equipment.js";
import { EquipmentHUD } from "../components/EquipmentHUD.js";
import { InteractionManager } from "../core/InteractionManager.js";
import { Inventory } from "../core/Inventory.js";
import { NPCController } from "../core/NPCController.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { showEmote } from "../core/EmoteController.js";
import { showItemPickup } from "../core/ItemPickupEffect.js";

/**
 * Begin scene - first scene of the game
 */
export default class BeginScene extends Scene {
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

    if (!this.sceneTransitioning && (this.player.x < 0 || this.player.x > 288 || this.player.y < 0 || this.player.y > 288)) {
      this.sceneTransitioning = true;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(Act1Scene);
      });
    }

    if (this.shouldUnlockOnClose && !Dialog.isOpen()) {
      this.shouldUnlockOnClose = false;
      GameState.exitUnlocked = true;
      this.unlockExit();
    }

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
    const nearNPC = InteractionManager.getNearObject(this.player, [this.dad], 25);
    if (nearNPC) {
      return { type: "npc", target: nearNPC };
    }

    const nearPickable = InteractionManager.getNearObject(this.player, this.pickables, 18);
    if (nearPickable) {
      return { type: "pickable", target: nearPickable };
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

      GameState.hasSword = true;
      this.talkCount = 1;

      obj.destroy();
      this.pickables = this.pickables.filter(p => p !== obj);
    }
  }

isNearNPC() {
    return InteractionManager.isNear(this.player, this.dad, 25);
  }

  /**
     * Handle NPC interaction when Space is pressed near an NPC
     */
  handleNPCTalk() {
    if (!InteractionManager.isNear(this.player, this.dad, 25)) return;
    if (Dialog.isOpen()) {
      Dialog.skip();
      return;
    }

    this.dad.setFlipX(this.player.x < this.dad.x);

    if (this.dadEmote) {
      this.dadEmote.destroy();
      this.dadEmote = null;
    }

    if (GameState.exitUnlocked) {
      Dialog.open(this, dadDialogUnlock);
      return;
    }

    if (GameState.hasSword && this.talkCount === 1) {
      Dialog.open(this, dadDialogHasSword);
      this.talkCount = 2;
    } else if (GameState.hasSword && this.talkCount === 2 && !GameState.exitUnlocked) {
      this.shouldUnlockOnClose = true;
      Dialog.open(this, dadDialogUnlock);
    } else {
      Dialog.open(this, dadDialogNoSword);
    }
  }

  unlockExit() {
    this.dad.setVelocity(100, 0);
    setTimeout(() => {
      this.dad.body.setImmovable(false);
    }, 500);
  }
}