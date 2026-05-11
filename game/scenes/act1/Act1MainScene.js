import { Scene, manager } from "@tialops/maki";
import {
  createEnemy as createAct1Enemy,
  createEnemyWeapon as createAct1EnemyWeapon,
  destroyEnemyEntry as destroyAct1EnemyEntry,
  triggerEnemyDeath as triggerAct1EnemyDeath,
  updateEnemyAI as updateAct1EnemyAI,
} from "./EnemyEncounterSystem.js";
import {
  createPotionChests,
  getNearChestInteractable,
  handleChestInteraction as handleAct1ChestInteraction,
} from "./ChestPotionSystem.js";
import {
  getNearNpcInteractable,
  handleNpcTalk,
  tryGrantGeorgesPotionReward as tryGrantAct1GeorgesPotionReward,
} from "./NpcDialogueSystem.js";

import { BattleController } from "../../core/BattleController.js";
import { Dialog } from "../../components/Dialog.js";
import { EnemyController } from "../../core/EnemyController.js";
import { Equipment } from "../../core/Equipment.js";
import { EquipmentHUD } from "../../components/EquipmentHUD.js";
import {
  GameState,
} from "../../data/dialogs.js";
import { HealthHUD } from "../../components/HealthHUD.js";
import { Inventory } from "../../core/Inventory.js";
import { NPCController } from "../../core/NPCController.js";
import { Persistence } from "../../core/Persistence.js";
import { PlayerController } from "../../core/PlayerController.js";
import { PotionHUD } from "../../components/PotionHUD.js";
import { SpriteLoader } from "../../core/SpriteLoader.js";
import { showEmote } from "../../core/EmoteController.js";
import { showItemPickup } from "../../core/ItemPickupEffect.js";

class Act1Scene extends Scene {
  constructor() {
    super({ key: "Act1Scene" });
  }

  init() {
    this.scale.resize(640, 448);
    this.cameras.main.setZoom(1.4);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "enemy", "enemy");
    SpriteLoader.load(this, "impact", "impact");
    SpriteLoader.loadImage(this, "impact0", "impact0");
    SpriteLoader.loadImage(this, "impact1", "impact1");
    SpriteLoader.loadImage(this, "impact2", "impact2");
    SpriteLoader.loadImage(this, "impact3", "impact3");
    SpriteLoader.loadImage(this, "impact4", "impact4");
    SpriteLoader.loadImage(this, "impact5", "impact5");
    SpriteLoader.loadImage(this, "heart_full", "heart_full");
    SpriteLoader.loadImage(this, "heart_half", "heart_half");
    SpriteLoader.loadImage(this, "heart_empty", "heart_empty");
    SpriteLoader.loadImage(this, "sword1", "sword1");
    SpriteLoader.loadImage(this, "sword2", "sword2");
    SpriteLoader.loadImage(this, "hammer", "hammer");
    SpriteLoader.loadImage(this, "attack", "attack");
    SpriteLoader.loadImage(this, "axe", "axe");
    SpriteLoader.load(this, "dad", "dad");
    SpriteLoader.loadImage(this, "emote_exclamation", "exclamation");
    SpriteLoader.loadImage(this, "emote_exclamations", "exclamations");
    SpriteLoader.loadImage(this, "emote_question", "question");
    this.load.image("chest_closed", "assets/tiles_kenney/chest_closed.png");
    this.load.image("chest_opened", "assets/tiles_kenney/chest_opened.png");
    this.load.spritesheet("georges", "assets/tiles_kenney/georges.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("potion", "assets/tiles_kenney/potion.png");
    manager.map(this, "act_1");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.dad = null;
    this.sceneTransitioning = false;
    this.playerDied = false;
    this.isRespawning = false;
    this.pendingGeorgesPotionReward = false;
    this.ePressed = false;

    const spawnFromAct2 = GameState.enteredAct1FromAct2;
    const act1SpawnX = spawnFromAct2 ? 625 : 16;
    const act1SpawnY = spawnFromAct2 ? 414 : 128;
    this.player = PlayerController.create(this, act1SpawnX, act1SpawnY, "player");
    this.player.setFlipX(spawnFromAct2);
    Persistence.applySavedPlayerState("Act1Scene", this.player);
    GameState.enteredAct1FromAct2 = false;
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "enemy", "enemy");

    this.physics.add.collider(
      this.player.hitbox,
      manager.getWallGroup(this, "act_1"),
    );

    this.georges = NPCController.create(this, 47, 33, "georges");
    this.georges.hitbox.body.setImmovable(true);
    this.georges.hitbox.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.hitbox, this.georges.hitbox);
    this.physics.add.collider(this.georges.hitbox, manager.getWallGroup(this, "act_1"));

    this.arthur = NPCController.create(this, 33.5 * 16 + 8, 9 * 16 + 8, "georges");
    this.arthur.hitbox.body.setImmovable(true);
    this.arthur.hitbox.body.setCollideWorldBounds(true);
    if (GameState.arthurMoved) {
      this.arthur.y -= 16;
      this.arthur.hitbox.y -= 16;
    }
    this.physics.add.collider(this.player.hitbox, this.arthur.hitbox);
    this.physics.add.collider(this.arthur.hitbox, manager.getWallGroup(this, "act_1"));

    createPotionChests(this);

    if (GameState.leftBeginScene) {
      this.dad = NPCController.create(this, 48, 118, "dad");
      this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
      this.dad.hitbox.body.setImmovable(true);
      SpriteLoader.createAnims(this, "dad", "dad");
      this.dadEmote = showEmote(this, this.dad, "question", 0);
    }

    // enemies[i] = { sprite, weapon }
    this.enemies = [
      // { sprite: this.createEnemy(88, 260) },
      // { sprite: this.createEnemy(89, 383) },
      // { sprite: this.createEnemy(373, 114 - 10) },
      // { sprite: this.createEnemy(373, 114 + 16 - 10) },
      // { sprite: this.createEnemy(295, 415) },
      // { sprite: this.createEnemy(378, 413) },
      // { sprite: this.createEnemy(578, 287) },
      // { sprite: this.createEnemy(511, 259) },
      // {
      //   sprite: (() => {
      //     const e = createAct1Enemy(this, 586, 395, 6);
      //     e.attackSpeedMultiplier = 0.2;
      //     this.physics.add.collider(this.player.hitbox, e.hitbox);
      //     this.physics.add.collider(e.hitbox, manager.getWallGroup(this, "act_1"));
      //     e.hitbox.body.setImmovable(false);
      //     e.hitbox.body.setCollideWorldBounds(true);
      //     EnemyController.updateHealth(e, e.health);
      //     return e;
      //   })(),
      // },
      // { sprite: this.createEnemy(73 + 32, 33, 4, "left") },
    ].map((e) => ({ ...e, weapon: this.createEnemyWeapon(e.sprite) }));

    if (GameState.hasWeapon) {
      const weaponItem = Inventory.getLastBySlot("mainHand");
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }

    HealthHUD.init();
    EquipmentHUD.init();
    PotionHUD.init();

    // Physics world bounds must match the actual map size in world coordinates.
    // Without this, Phaser defaults to the canvas pixel size (640×448 before zoom).
    // At zoom 1.4 that creates an invisible hard wall at ~320px on Y — that was the bug.
    this.physics.world.setBounds(0, 0, 640, 448);

    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.setBounds(0, 0, 640, 448);

    this.cameras.main.fadeIn(500);

    this.arthurMoveCallback = () => {
      if (this.arthur && this.arthurPendingMove && !GameState.arthurMoved) {
        GameState.arthurMoved = true;
        this.arthurPendingMove = false;
        this.arthurMoveStartY = this.arthur.y;
        this.arthur.hitbox.body.setImmovable(false);
        this.arthur.hitbox.body.setVelocity(0, -100);
      }
      if (!GameState.arthurMoved) {
        Dialog.onCloseCallback(this.arthurMoveCallback);
      }
    };
    Dialog.onCloseCallback(this.arthurMoveCallback);

    BattleController.setup(this, this.player);
  }

  createEnemy(x, y, health = 3, facing = "right") {
    return createAct1Enemy(this, x, y, health, facing);
  }

  createEnemyWeapon(enemy) {
    return createAct1EnemyWeapon(this, enemy);
  }

  // Triggers the flash-and-destroy death sequence for one enemy entry.
  triggerEnemyDeath(entry) {
    triggerAct1EnemyDeath(this, entry);
  }

  // Cleans up all objects belonging to one enemy entry.
  destroyEnemyEntry(entry) {
    destroyAct1EnemyEntry(this, entry);
  }

  // Runs the per-frame AI for one enemy entry.
  updateEnemyAI(entry, time) {
    updateAct1EnemyAI(this, entry, time);
  }

  update(time) {
    if (GameState.playerHealth <= 0 && !this.playerDied) {
      this.playerDied = true;
      this.isRespawning = true;
      GameState.playerHealth = 3;
      Persistence.clearSceneState("Act1Scene");
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.restart(),
      );
      return;
    }

    // --- Player input ---
    if (!Dialog.isOpen()) {
      if (!this.player.isKnockedBack) {
        PlayerController.handleMovement(this.player, this.keys);
      }
      PlayerController.handleAnimation(this.player, this.keys, time);
      PlayerController.handleWeaponSwitch(this, this.player, this.keys);
      BattleController.attack(
        this,
        this.player,
        this.keys,
        this.enemies.map((e) => e.sprite).filter(Boolean),
      );
    }

    if (this.dad) {
      NPCController.handleAnimation(this.dad, time);
    }
    if (this.georges) {
      NPCController.handleAnimation(this.georges, time);
    }
    if (this.arthur) {
      NPCController.handleAnimation(this.arthur, time);
      if (this.arthurMoveStartY && this.arthur.y <= this.arthurMoveStartY - 16) {
        this.arthur.hitbox.body.setVelocity(0, 0);
        this.arthur.hitbox.body.setImmovable(true);
        this.arthurMoveStartY = null;
      }
    }

    // --- Scene transition ---
    if (!this.sceneTransitioning && this.player.x < 0) {
      this.sceneTransitioning = true;
      GameState.returnedFromAct1 = true;
      GameState.leftBeginScene = false;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("BeginScene"),
      );
      return;
    }
    if (!this.sceneTransitioning && this.player.x > 640) {
      this.sceneTransitioning = true;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("Act2Scene"),
      );
      return;
    }

    // --- Enemy death checks & AI ---
    for (const entry of this.enemies) {
      const enemy = entry.sprite;
      if (enemy && enemy.health <= 0 && !enemy.isDying) {
        this.triggerEnemyDeath(entry);
      }
      this.updateEnemyAI(entry, time);
    }

    // --- HUD, equipment, dialog ---
    Equipment.update(this, this.player);
    HealthHUD.update();
    EquipmentHUD.update();
    PotionHUD.update();
    Dialog.update(time);
    this.tryGrantGeorgesPotionReward();

    // --- Interaction prompt & space key ---
    const nearInteractable = this.getNearInteractable();
    if (nearInteractable && !Dialog.isOpen()) {
      Dialog.showInteractPrompt(this, "Space to interact");
    } else {
      Dialog.hideInteractPrompt();
    }

    if (!this.spacePressed && this.keys.space.isDown) {
      this.spacePressed = true;
      if (Dialog.isOpen()) {
        Dialog.skip();
      } else {
        this.handleInteraction();
      }
    }
    if (this.keys.space.isUp) {
      this.spacePressed = false;
    }
    if (!this.ePressed && this.keys.e.isDown) {
      this.ePressed = true;
      this.tryUsePotion();
    }
    if (this.keys.e.isUp) {
      this.ePressed = false;
    }

    if (!this.isRespawning) {
      Persistence.saveSceneState("Act1Scene", this.player);
    }
  }

  getNearInteractable() {
    return getNearChestInteractable(this) || getNearNpcInteractable(this);
  }

  handleInteraction() {
    const interactable = this.getNearInteractable();
    if (!interactable) return;
    if (interactable.type === "chest") {
      this.handleChestInteraction(interactable.target);
      return;
    }
    if (interactable.type === "npc") this.handleNPCTalk(interactable.target);
  }

  handleChestInteraction(chest) {
    handleAct1ChestInteraction(this, chest);
  }

  handleNPCTalk(npc) {
    handleNpcTalk(this, npc);
  }

  tryGrantGeorgesPotionReward() {
    tryGrantAct1GeorgesPotionReward(this);
  }

  tryUsePotion() {
    if (Dialog.isOpen()) return;
    const maxHealth = 3;
    if ((GameState.playerHealth || 0) >= maxHealth) return;
    if (!Inventory.removeOne("potion")) {
      PotionHUD.shake();
      return;
    }

    GameState.playerHealth = Math.min(maxHealth, (GameState.playerHealth || 0) + 1);
    showItemPickup(this, this.player, "heart_full", 0);
  }
}

export { Act1Scene };
