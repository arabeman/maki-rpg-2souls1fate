import { EnemyBehavior, EnemyController } from "../../core/EnemyController.js";
import {
  GameState,
  cyclopsDialogOnHit,
  cyclopsDialogOnFoundCactusPlace,
  cyclopsDialogOnAlreadyVisited,
  heroChoiceThoughtDialog,
} from "../../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";

import { BattleController } from "../../core/BattleController.js";
import { Dialog } from "../../components/Dialog.js";
import { Equipment } from "../../core/Equipment.js";
import { EquipmentHUD } from "../../components/EquipmentHUD.js";
import { HealthHUD } from "../../components/HealthHUD.js";
import { Inventory } from "../../core/Inventory.js";
import { Persistence } from "../../core/Persistence.js";
import { PlayerController } from "../../core/PlayerController.js";
import { PotionHUD } from "../../components/PotionHUD.js";
import { SpriteLoader } from "../../core/SpriteLoader.js";
import { showEmote } from "../../core/EmoteController.js";
import { showItemPickup } from "../../core/ItemPickupEffect.js";

const ACT3_TILE_SIZE = 16;
const ACT3_MAP_WIDTH_TILES = 50;
const ACT3_MAP_HEIGHT_TILES = 26;
const ACT3_MAP_WIDTH = ACT3_MAP_WIDTH_TILES * ACT3_TILE_SIZE;
const ACT3_MAP_HEIGHT = ACT3_MAP_HEIGHT_TILES * ACT3_TILE_SIZE;
const ACT3_VIEWPORT_WIDTH = 640;
const ACT3_VIEWPORT_HEIGHT = 448;

class Act3Scene extends Scene {
  constructor() {
    super({ key: "Act3Scene" });
  }

  init() {
    this.scale.resize(ACT3_VIEWPORT_WIDTH, ACT3_VIEWPORT_HEIGHT);
    this.cameras.main.setZoom(1.4);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "enemy", "enemy");
    SpriteLoader.load(this, "cyclops", "cyclops");
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
    SpriteLoader.loadImage(this, "emote_exclamation", "exclamation");
    SpriteLoader.loadImage(this, "emote_exclamations", "exclamations");
    SpriteLoader.loadImage(this, "hammer", "hammer");
    manager.map(this, "act_3");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);
    this.sceneTransitioning = false;
    this.spacePressed = false;
    this.ePressed = false;
    this.isRespawning = false;
    this.cyclopsDialogCompleted = GameState.cyclopsDialogCompleted || false;
    this.cyclopsTeleportTriggered = false;
    this.cyclopsTeleported = GameState.cyclopsTeleported || false;
    this.heroChoiceDialogTriggered = false;

    this.player = PlayerController.create(
      this,
      56,
      395,
      "player",
    );
    this.player.setFlipX(true);
    Persistence.applySavedPlayerState("Act3Scene", this.player);
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "enemy", "enemy");
    SpriteLoader.createAnims(this, "cyclops", "cyclops");
    this.physics.add.collider(this.player.hitbox, manager.getWallGroup(this, "act_3"));
    if (GameState.hasWeapon) {
      const weaponItem = Inventory.getLastBySlot("mainHand");
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }
    this.createAct3Cyclops();

    this.physics.world.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.fadeIn(500);

    this.enemies = [
      // { sprite: this.createEnemy(69, 277, 4) },
      // { sprite: this.createEnemy(125, 271, 4) },
      // { sprite: this.createEnemy(125, 197, 4) },
      // { sprite: this.createEnemy(31, 151, 4) },
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
      Persistence.clearSceneState("Act3Scene");
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
        [
          ...this.enemies.map((e) => e.sprite).filter(Boolean),
          ...(this.cyclops ? [this.cyclops] : []),
        ],
      );
    }
    Equipment.update(this, this.player);
    HealthHUD.update();
    EquipmentHUD.update();
    PotionHUD.update();
    Dialog.update(time);
    if (this.cyclops && this.cyclops.active) {
      EnemyController.handleAnimation(this.cyclops, time);
    }

    if (!this.spacePressed && this.keys.space.isDown) {
      this.spacePressed = true;
      if (Dialog.isOpen()) {
        Dialog.skip();
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

    if (!this.sceneTransitioning && this.player.y > ACT3_MAP_HEIGHT) {
      this.sceneTransitioning = true;
      GameState.enteredAct2FromAct3 = true;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.start("Act2Scene"),
      );
    }

    if (!this.isRespawning) {
      Persistence.saveSceneState("Act3Scene", this.player);
    }

    // Check for cyclops teleportation trigger
    this.checkCyclopsTeleport();
    
    // Check for hero choice dialog trigger
    this.checkHeroChoiceDialog();
  }

  createAct3Cyclops() {
    // Use different position based on teleportation state
    const cyclopsTileX = this.cyclopsTeleported ? 3 : 39.5;
    const cyclopsTileY = this.cyclopsTeleported ? 3 : 12.5;
    const x = cyclopsTileX * ACT3_TILE_SIZE + ACT3_TILE_SIZE / 2;
    const y = cyclopsTileY * ACT3_TILE_SIZE + ACT3_TILE_SIZE / 2;
    this.cyclops = EnemyController.create(this, x, y, "cyclops");
    const hp = 3;
    this.cyclops.health = hp;
    this.cyclops.maxHealth = hp;
    this.cyclops.canMove = false;
    this.cyclops.enemyEmote = null;
    this.cyclops.setFlipX(true);
    this.cyclops.hitInvulnerable = true;
    this.cyclops.onHitByPlayer = (scene) => {
      if (Dialog.isOpen()) return;
      
      let dialogToShow;
      if (this.cyclopsTeleported) {
        // If cyclops has already teleported, show the "already visited" dialog
        dialogToShow = cyclopsDialogOnAlreadyVisited;
      } else if (this.cyclopsDialogCompleted) {
        // If initial dialog was completed but not teleported yet, show "found cactus place" dialog
        dialogToShow = cyclopsDialogOnFoundCactusPlace;
      } else {
        // First time interaction
        dialogToShow = cyclopsDialogOnHit;
        this.cyclopsDialogCompleted = true;
        GameState.cyclopsDialogCompleted = true;
      }
      
      Dialog.open(scene, dialogToShow);
    };

    this.physics.add.collider(this.player.hitbox, this.cyclops.hitbox);
    this.physics.add.collider(
      this.cyclops.hitbox,
      manager.getWallGroup(this, "act_3"),
    );
    this.cyclops.hitbox.body.setImmovable(true);
    this.cyclops.hitbox.body.setCollideWorldBounds(true);
    EnemyController.updateHealth(this.cyclops, this.cyclops.health, this.cyclops.maxHealth);
    for (const heart of this.cyclops.healthHearts || []) {
      heart?.setAlpha(0);
      heart?.setVisible(false);
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
    this.physics.add.collider(enemy.hitbox, manager.getWallGroup(this, "act_3"));
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
    if (dist < EnemyBehavior.visionRange && !Dialog.isOpen()) {
      if (!enemy.canMove && !enemy.enemyEmote) {
        const emote = showEmote(this, enemy, "exclamations", 0);
        if (emote) {
          enemy.enemyEmote = emote;
          this.time.delayedCall(200, () => {
            if (enemy) enemy.canMove = true;
          });
        } else {
          enemy.canMove = true;
        }
      }

      if (enemy.canMove) {
        if (enemy.enemyEmote) {
          enemy.enemyEmote.destroy();
          enemy.enemyEmote = null;
        }
        if (dist > EnemyBehavior.attackRange) {
          EnemyController.chase(this, enemy, this.player);
        } else {
          enemy.hitbox.body.setVelocity(0);
          enemy.anims.stop();
          EnemyController.attack(this, enemy, this.player, entry.weapon);
        }
      } else {
        enemy.hitbox.body.setVelocity(0);
        enemy.anims.stop();
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

  checkCyclopsTeleport() {
    // Only trigger if dialog is completed and teleport hasn't been triggered yet
    if (!this.cyclopsDialogCompleted || this.cyclopsTeleportTriggered || !this.cyclops || !this.cyclops.active) {
      return;
    }

    // Check if player is at either of the trigger positions
    const playerTileX = Math.round(this.player.x / ACT3_TILE_SIZE);
    const playerTileY = Math.round(this.player.y / ACT3_TILE_SIZE);
    
    const triggerPositions = [
      { tileX: 6, tileY: 1, pixelX: 93, pixelY: 22 },
      { tileX: 93, tileY: 22, pixelX: 1488, pixelY: 352 }
    ];

    const isAtTriggerPosition = triggerPositions.some(pos => 
      (playerTileX === pos.tileX && playerTileY === pos.tileY) ||
      (Math.round(this.player.x) === pos.pixelX && Math.round(this.player.y) === pos.pixelY)
    );

    if (isAtTriggerPosition) {
      this.cyclopsTeleportTriggered = true;
      this.teleportCyclops();
    }
  }

  teleportCyclops() {
    // Fade game to black
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Move cyclops to new position during black screen
      const newTileX = 3;
      const newTileY = 3;
      const newX = newTileX * ACT3_TILE_SIZE + ACT3_TILE_SIZE / 2;
      const newY = newTileY * ACT3_TILE_SIZE + ACT3_TILE_SIZE / 2;
      
      this.cyclops.setPosition(newX, newY);
      if (this.cyclops.hitbox) {
        this.cyclops.hitbox.setPosition(newX, newY);
      }
      
      // Mark teleportation as complete
      this.cyclopsTeleported = true;
      GameState.cyclopsTeleported = true;
      
      // Fade game back in
      this.cameras.main.fadeIn(500);
    });
  }

  checkHeroChoiceDialog() {
    // Only trigger if dialog hasn't been shown yet and no dialog is currently open
    if (this.heroChoiceDialogTriggered || Dialog.isOpen()) {
      return;
    }

    // Check if player has passed tile x=41
    const playerTileX = Math.round(this.player.x / ACT3_TILE_SIZE);
    
    if (playerTileX >= 41) {
      this.heroChoiceDialogTriggered = true;
      Dialog.open(this, heroChoiceThoughtDialog);
    }
  }
}

export { Act3Scene };
