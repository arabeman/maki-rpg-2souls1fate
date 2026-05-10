import {
  GameState,
  ameliaSisterDialog,
  raphaelHasSwordDialog,
  raphaelNeedSwordDialog,
} from "../../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";
import {
  createPotionChests,
  getNearChestInteractable,
  handleChestInteraction as handleAct2ChestInteraction,
} from "./ChestPotionSystem.js";

import { BattleController } from "../../core/BattleController.js";
import { Dialog } from "../../components/Dialog.js";
import { EnemyController } from "../../core/EnemyController.js";
import { Equipment } from "../../core/Equipment.js";
import { EquipmentHUD } from "../../components/EquipmentHUD.js";
import { HealthHUD } from "../../components/HealthHUD.js";
import { InteractionManager } from "../../core/InteractionManager.js";
import { Inventory } from "../../core/Inventory.js";
import { NPCController } from "../../core/NPCController.js";
import { Persistence } from "../../core/Persistence.js";
import { PlayerController } from "../../core/PlayerController.js";
import { PotionHUD } from "../../components/PotionHUD.js";
import { SpriteLoader } from "../../core/SpriteLoader.js";
import { showEmote } from "../../core/EmoteController.js";
import { showItemPickup } from "../../core/ItemPickupEffect.js";

const ACT2_TILE_SIZE = 16;
const ACT2_MAP_WIDTH_TILES = 45;
const ACT2_MAP_HEIGHT_TILES = 34;
const ACT2_MAP_WIDTH = ACT2_MAP_WIDTH_TILES * ACT2_TILE_SIZE;
const ACT2_MAP_HEIGHT = ACT2_MAP_HEIGHT_TILES * ACT2_TILE_SIZE;
const ACT2_VIEWPORT_WIDTH = 640;
const ACT2_VIEWPORT_HEIGHT = 448;

class Act2Scene extends Scene {
  constructor() {
    super({ key: "Act2Scene" });
  }

  init() {
    this.scale.resize(ACT2_VIEWPORT_WIDTH, ACT2_VIEWPORT_HEIGHT);
    this.cameras.main.setZoom(1.4);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "enemy", "enemy");
    SpriteLoader.loadImage(this, "impact0", "impact0");
    SpriteLoader.loadImage(this, "impact1", "impact1");
    SpriteLoader.loadImage(this, "impact2", "impact2");
    SpriteLoader.loadImage(this, "impact3", "impact3");
    SpriteLoader.loadImage(this, "impact4", "impact4");
    SpriteLoader.loadImage(this, "impact5", "impact5");
    SpriteLoader.loadImage(this, "heart_full", "heart_full");
    SpriteLoader.loadImage(this, "heart_half", "heart_half");
    SpriteLoader.loadImage(this, "heart_empty", "heart_empty");
    SpriteLoader.loadImage(this, "attack", "attack");
    SpriteLoader.loadImage(this, "axe", "axe");
    SpriteLoader.loadImage(this, "sword1", "sword1");
    SpriteLoader.loadImage(this, "sword2", "sword2");
    SpriteLoader.loadImage(this, "hammer", "hammer");
    SpriteLoader.loadImage(this, "emote_exclamation", "exclamation");
    this.load.spritesheet("georges", "assets/tiles_kenney/georges.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("girl", "assets/tiles_kenney/girl.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("chest_closed", "assets/tiles_kenney/chest_closed.png");
    this.load.image("chest_opened", "assets/tiles_kenney/chest_opened.png");
    this.load.image("potion", "assets/tiles_kenney/potion.png");
    manager.map(this, "act_2");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);
    this.sceneTransitioning = false;
    this.spacePressed = false;
    this.ePressed = false;
    this.raphaelPendingMove = false;
    this.raphaelMoveStartX = null;
    this.isRespawning = false;

    this.player = PlayerController.create(this, 16, 448, "player");
    if (GameState.enteredAct2FromAct3) {
      this.player.x = 522;
      this.player.y = 18;
      this.player.hitbox.x = 522;
      this.player.hitbox.y = 18;
      this.player.setFlipX(true);
      GameState.enteredAct2FromAct3 = false;
    }
    Persistence.applySavedPlayerState("Act2Scene", this.player);
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "enemy", "enemy");
    this.physics.add.collider(
      this.player.hitbox,
      manager.getWallGroup(this, "act_2"),
    );
    if (GameState.hasWeapon) {
      const weaponItem = Inventory.getLastBySlot("mainHand");
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }

    this.raphael = NPCController.create(this, 613, 143, "georges");
    this.raphael.hitbox.body.setImmovable(true);
    this.raphael.hitbox.body.setCollideWorldBounds(true);
    if (GameState.raphaelMoved) {
      this.raphael.x += 16;
      this.raphael.hitbox.x += 16;
    }
    this.physics.add.collider(this.player.hitbox, this.raphael.hitbox);
    this.physics.add.collider(
      this.raphael.hitbox,
      manager.getWallGroup(this, "act_2"),
    );

    this.ameliaSister = NPCController.create(this, 102, 88, "girl");
    this.ameliaSister.hitbox.body.setImmovable(true);
    this.ameliaSister.hitbox.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.hitbox, this.ameliaSister.hitbox);
    this.physics.add.collider(
      this.ameliaSister.hitbox,
      manager.getWallGroup(this, "act_2"),
    );
    this.ameliaSisterEmote = showEmote(this, this.ameliaSister, "exclamation", 0);

    createPotionChests(this);

    this.physics.world.setBounds(0, 0, ACT2_MAP_WIDTH, ACT2_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, ACT2_MAP_WIDTH, ACT2_MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.fadeIn(500);

    this.enemies = [
      { sprite: this.createEnemy(282, 191) },
      // { sprite: this.createEnemy(282, 167) },
      // { sprite: this.createEnemy(282, 143) },
      // { sprite: this.createEnemy(282, 118) },
      // { sprite: this.createEnemy(282, 94) },
      // { sprite: this.createEnemy(426, 191, 3, "left") },
      // { sprite: this.createEnemy(426, 167, 3, "left") },
      // { sprite: this.createEnemy(426, 143, 3, "left") },
      // { sprite: this.createEnemy(426, 118, 3, "left") },
      // { sprite: this.createEnemy(426, 94, 3, "left") },
      // { sprite: this.createEnemy(654, 286, 4) },
      // { sprite: this.createEnemy(683, 257, 4, "left") },
      // { sprite: this.createEnemy(590, 445) },
      // { sprite: this.createEnemy(621, 256, 4) },
      // { sprite: this.createEnemy(454, 383, 3, "left") },
      // { sprite: this.createEnemy(203, 426) },
      // { sprite: this.createEnemy(251, 479) },
    ].map((e) => ({ ...e, weapon: this.createEnemyWeapon(e.sprite) }));

    BattleController.setup(this, this.player);
    HealthHUD.init();
    EquipmentHUD.init();
    PotionHUD.init();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        console.log(
          "Player tile/pixel:",
          Math.round(this.player.x / 16),
          Math.round(this.player.y / 16),
          "|",
          Math.round(this.player.x),
          Math.round(this.player.y),
        );
      },
    });
  }

  update(time) {
    if (GameState.playerHealth <= 0) {
      this.isRespawning = true;
      GameState.playerHealth = 3;
      Persistence.clearSceneState("Act2Scene");
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.restart(),
      );
      return;
    }

    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
      PlayerController.handleWeaponSwitch(this, this.player, this.keys);
      BattleController.attack(
        this,
        this.player,
        this.keys,
        this.enemies.map((e) => e.sprite).filter(Boolean),
      );
    }
    Equipment.update(this, this.player);
    HealthHUD.update();
    EquipmentHUD.update();
    PotionHUD.update();
    Dialog.update(time);
    if (this.raphael) {
      NPCController.handleAnimation(this.raphael, time);
      if (
        this.raphaelMoveStartX !== null &&
        this.raphael.x >= this.raphaelMoveStartX + 16
      ) {
        this.raphael.hitbox.body.setVelocity(0, 0);
        this.raphael.hitbox.body.setImmovable(true);
        this.raphaelMoveStartX = null;
      }
    }
    if (this.ameliaSister) {
      NPCController.handleAnimation(this.ameliaSister, time);
    }

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

    for (const entry of this.enemies) {
      const enemy = entry.sprite;
      if (enemy && enemy.health <= 0 && !enemy.isDying) {
        this.triggerEnemyDeath(entry);
      }
      this.updateEnemyAI(entry, time);
    }

    if (!this.sceneTransitioning && this.player.x < 0) {
      this.sceneTransitioning = true;
      GameState.enteredAct1FromAct2 = true;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("Act1Scene"),
      );
    }

    if (!this.sceneTransitioning && this.player.y < 0) {
      this.sceneTransitioning = true;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("Act3Scene"),
      );
    }

    if (!this.isRespawning) {
      Persistence.saveSceneState("Act2Scene", this.player);
    }
  }

  createEnemy(x, y, health = 3, facing = "right") {
    const enemy = EnemyController.create(this, x, y, "enemy");
    enemy.health = health;
    enemy.maxHealth = health;
    enemy.setFlipX(facing === "left");
    enemy.enemyEmote = null;
    enemy.canMove = false;
    this.physics.add.collider(this.player.hitbox, enemy.hitbox);
    this.physics.add.collider(
      enemy.hitbox,
      manager.getWallGroup(this, "act_2"),
    );
    enemy.hitbox.body.setImmovable(false);
    enemy.hitbox.body.setCollideWorldBounds(true);
    EnemyController.updateHealth(enemy, enemy.health);
    return enemy;
  }

  createEnemyWeapon(enemy) {
    const weapon = this.add.sprite(enemy.x + 8, enemy.y + 4, "axe");
    weapon.setOrigin(1.5, 0.7);
    weapon.setDepth(enemy.depth + 1);
    return weapon;
  }

  triggerEnemyDeath(entry) {
    const { sprite: enemy } = entry;
    enemy.isDying = true;

    const flash = () => {
      if (enemy && enemy.active) {
        enemy.setVisible(!enemy.visible);
        if (entry.weapon) entry.weapon.setVisible(enemy.visible);
      }
    };

    flash();
    [80, 160, 240].forEach((delay) =>
      this.time.addEvent({ delay, callback: flash }),
    );
    this.time.addEvent({
      delay: 320,
      callback: () => this.destroyEnemyEntry(entry),
    });
  }

  destroyEnemyEntry(entry) {
    const { sprite: enemy } = entry;

    if (entry.weapon) {
      entry.weapon.destroy();
      entry.weapon = null;
    }
    if (enemy) {
      if (enemy.enemyEmote) {
        enemy.enemyEmote.destroy();
        enemy.enemyEmote = null;
      }
      if (enemy.healthHearts) {
        enemy.healthHearts.forEach((h) => h && h.destroy());
        enemy.healthHearts = [];
      }
      if (enemy.hitbox) {
        enemy.hitbox.body.setVelocity(0);
        enemy.hitbox.destroy();
        enemy.hitbox = null;
      }
      enemy.destroy();
    }
    entry.sprite = null;
  }

  updateEnemyAI(entry, time) {
    const { sprite: enemy } = entry;
    if (!enemy || !enemy.active || enemy.isDying) return;

    EnemyController.handleAnimation(enemy, time);

    if (enemy.lastHealth !== enemy.health) {
      enemy.lastHealth = enemy.health;
      EnemyController.showHealthBar(enemy);
    }
    EnemyController.updateHealth(enemy, enemy.health);

    const dist = EnemyController.getDistanceToTarget(enemy, this.player);
    if (dist < 100 && !Dialog.isOpen()) {
      if (enemy.canMove) {
        if (dist > 25) {
          EnemyController.chase(this, enemy, this.player);
        } else {
          enemy.hitbox.body.setVelocity(0);
          enemy.anims.stop();
          EnemyController.attack(this, enemy, this.player, entry.weapon);
        }
      } else {
        enemy.canMove = true;
      }
    } else {
      enemy.hitbox.body.setVelocity(0);
      enemy.anims.stop();
    }

    if (entry.weapon) {
      entry.weapon.setPosition(enemy.x + 8, enemy.y + 4);
      entry.weapon.setFlipX(enemy.flipX);
    }
  }

  getNearInteractable() {
    const nearChest = getNearChestInteractable(this);
    if (nearChest) return nearChest;

    if (!this.raphael && !this.ameliaSister) return null;
    const nearRaphael = InteractionManager.getNearObject(
      this.player,
      [this.raphael, this.ameliaSister].filter(Boolean),
      25,
    );
    return nearRaphael ? { type: "npc", target: nearRaphael } : null;
  }

  handleInteraction() {
    const interactable = this.getNearInteractable();
    if (!interactable) return;
    if (interactable.type === "chest") {
      this.handleChestInteraction(interactable.target);
      return;
    }
    if (interactable.type === "npc") {
      this.handleNpcTalk(interactable.target);
    }
  }

  handleChestInteraction(chest) {
    handleAct2ChestInteraction(this, chest);
  }

  handleNpcTalk(npc) {
    if (npc === this.ameliaSister) {
      npc.setFlipX(this.player.x < npc.x);
      if (this.ameliaSisterEmote) {
        this.ameliaSisterEmote.destroy();
        this.ameliaSisterEmote = null;
      }
      GameState.ameliaSisterTalked = true;
      Dialog.open(this, ameliaSisterDialog);
      return;
    }
    if (npc !== this.raphael) return;
    if (Dialog.isOpen()) {
      Dialog.skip();
      return;
    }

    npc.setFlipX(this.player.x < npc.x);

    if (GameState.raphaelMoved) {
      Dialog.open(this, raphaelHasSwordDialog);
      return;
    }

    const weaponItem = Inventory.getLastBySlot("mainHand");
    const hasStrongerSword = Boolean(weaponItem && weaponItem.id !== "sword1");
    const dialogToOpen = hasStrongerSword
      ? raphaelHasSwordDialog
      : raphaelNeedSwordDialog;

    if (hasStrongerSword && !GameState.raphaelMoved) {
      this.raphaelPendingMove = true;
      Dialog.onCloseCallback(() => {
        if (!this.raphael || !this.raphaelPendingMove || GameState.raphaelMoved)
          return;
        this.raphaelPendingMove = false;
        GameState.raphaelMoved = true;
        this.raphaelMoveStartX = this.raphael.x;
        this.raphael.hitbox.body.setImmovable(false);
        this.raphael.hitbox.body.setVelocity(100, 0);
      });
    }

    GameState.raphaelFirstTalkDone = true;
    Dialog.open(this, dialogToOpen);
  }

  tryUsePotion() {
    if (Dialog.isOpen()) return;
    const maxHealth = 3;
    if ((GameState.playerHealth || 0) >= maxHealth) return;
    if (!Inventory.removeOne("potion")) {
      PotionHUD.shake();
      return;
    }

    GameState.playerHealth = Math.min(
      maxHealth,
      (GameState.playerHealth || 0) + 1,
    );
    showItemPickup(this, this.player, "heart_full", 0);
  }
}

export { Act2Scene };
