import {
  GameState,
  dadDialogHasSword,
  dadDialogNoSword,
  dadDialogUnlock,
} from "../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";

import { Dialog } from "../components/Dialog.js";
import { Equipment } from "../core/Equipment.js";
import { EquipmentHUD } from "../components/EquipmentHUD.js";
import { InteractionManager } from "../core/InteractionManager.js";
import { Inventory } from "../core/Inventory.js";
import { NPCController } from "../core/NPCController.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { WEAPONS } from "../data/weapons.js";
import { showEmote } from "../core/EmoteController.js";
import { showItemPickup } from "../core/ItemPickupEffect.js";

/**
 * Begin scene - first scene of the game
 */
class BeginScene extends Scene {
  static SceneKey = "BeginScene";
  constructor() {
    super({ key: "BeginScene" });
  }
  init() {
    this.scale.resize(288, 288);
    this.cameras.main.setZoom(1);
  }
  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "dad", "dad");
    SpriteLoader.loadImage(this, "sword1", "sword1");
    SpriteLoader.loadImage(this, "hammer", "hammer");
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

    this.dad = null;
    this.sceneTransitioning = false;
    this.playerDied = false;

    if (GameState.returnedFromAct1) {
      this.player = PlayerController.create(this, 268, 144, "player");
      this.player.setFlipX(true);
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
    this.keys = PlayerController.setupInput(this);

    SpriteLoader.createAnims(this, "player", "player");
    if (this.dad) {
      SpriteLoader.createAnims(this, "dad", "dad");
    }

    // Wall collisions
    this.physics.add.collider(this.player.hitbox, manager.getWallGroup(this, "begin"));
    if (this.dad) {
      this.physics.add.collider(this.dad.hitbox, manager.getWallGroup(this, "begin"));
      this.dad.hitbox.body.setImmovable(true);
      this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
      this.dadEmote = showEmote(this, this.dad, "exclamation", 0);
    }

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        console.log("Player pos:", Math.round(this.player.x), Math.round(this.player.y));
      },
    });

    EquipmentHUD.init();

    // Create pickable objects
    this.pickables = [];
    if (!GameState.returnedFromAct1) {
      this.createPickable(208 + 8, 192 + 8, "sword1", WEAPONS.sword1);
    }
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
    if (GameState.playerHealth <= 0 && !this.playerDied) {
      this.playerDied = true;
      GameState.playerHealth = 3;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.restart();
      });
      return;
    }

    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
    }
    Equipment.update(this, this.player);
    if (this.dad) {
      NPCController.handleAnimation(this.dad, time);
    }
    Dialog.update(time);

    if (!this.sceneTransitioning && (this.player.x < 0 || this.player.x > 288 || this.player.y < 0 || this.player.y > 288)) {
      this.sceneTransitioning = true;
      GameState.leftBeginScene = true;
      if (this.dad) {
        GameState.dadPosition = { x: this.dad.x, y: this.dad.y };
        this.dad.destroy();
      }
      if (this.dadEmote) {
        this.dadEmote.destroy();
        this.dadEmote = null;
      }
      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start("Act1Scene");
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
    if (this.dad) {
      const nearNPC = InteractionManager.getNearObject(this.player, [this.dad], 25);
      if (nearNPC) {
        return { type: "npc", target: nearNPC };
      }
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

      GameState.hasWeapon = true;
      this.talkCount = 1;

      obj.destroy();
      this.pickables = this.pickables.filter(p => p !== obj);
    }
  }

isNearNPC() {
    if (!this.dad) return false;
    return InteractionManager.isNear(this.player, this.dad, 25);
  }

  /**
     * Handle NPC interaction when Space is pressed near an NPC
     */
  handleNPCTalk() {
    if (!this.dad) return;
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

    if (GameState.hasWeapon && this.talkCount === 1) {
      Dialog.open(this, dadDialogHasSword);
      this.talkCount = 2;
    } else if (GameState.hasWeapon && this.talkCount === 2 && !GameState.exitUnlocked) {
      this.shouldUnlockOnClose = true;
      Dialog.open(this, dadDialogUnlock);
    } else {
      Dialog.open(this, dadDialogNoSword);
    }
  }

  unlockExit() {
    this.dad.hitbox.body.setVelocity(100, 0);
    setTimeout(() => {
      this.dad.hitbox.body.setImmovable(false);
    }, 500);
  }
}

export { BeginScene };