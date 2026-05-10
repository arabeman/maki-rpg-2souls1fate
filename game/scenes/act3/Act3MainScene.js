import { Scene, manager } from "@tialops/maki";
import { BattleController } from "../../core/BattleController.js";
import { Dialog } from "../../components/Dialog.js";
import { Equipment } from "../../core/Equipment.js";
import { EquipmentHUD } from "../../components/EquipmentHUD.js";
import { EnemyController, EnemyBehavior } from "../../core/EnemyController.js";
import { GameState } from "../../data/dialogs.js";
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
import { ameliaSisterDialog } from "../../data/dialogs.js";

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
    this.load.spritesheet("georges", "assets/tiles_kenney/georges.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
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
    this.physics.add.collider(this.player.hitbox, manager.getWallGroup(this, "act_3"));
    if (GameState.hasWeapon) {
      const weaponItem = Inventory.getLastBySlot("mainHand");
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }
    this.ameliaSister = NPCController.create(this, 102, 81, "georges");
    this.ameliaSister.hitbox.body.setImmovable(true);
    this.ameliaSister.hitbox.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.hitbox, this.ameliaSister.hitbox);
    this.physics.add.collider(
      this.ameliaSister.hitbox,
      manager.getWallGroup(this, "act_3"),
    );

    this.physics.world.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.fadeIn(500);

    this.enemies = [
      { sprite: this.createEnemy(69, 277, 4) },
      { sprite: this.createEnemy(125, 271, 4) },
      { sprite: this.createEnemy(125, 197, 4) },
      { sprite: this.createEnemy(31, 151, 4) },
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
        this.enemies.map((e) => e.sprite).filter(Boolean),
      );
    }
    Equipment.update(this, this.player);
    HealthHUD.update();
    EquipmentHUD.update();
    PotionHUD.update();
    Dialog.update(time);
    if (this.ameliaSister) {
      NPCController.handleAnimation(this.ameliaSister, time);
    }

    if (this.getNearNPCInteractable() && !Dialog.isOpen()) {
      Dialog.showInteractPrompt(this, "Space to interact");
    } else {
      Dialog.hideInteractPrompt();
    }

    if (!this.spacePressed && this.keys.space.isDown) {
      this.spacePressed = true;
      if (Dialog.isOpen()) {
        Dialog.skip();
      } else {
        this.handleNpcInteraction();
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
  }

  getNearNPCInteractable() {
    if (!this.ameliaSister) return null;
    return InteractionManager.getNearObject(this.player, [this.ameliaSister], 25);
  }

  handleNpcInteraction() {
    const npc = this.getNearNPCInteractable();
    if (!npc) return;
    npc.setFlipX(this.player.x < npc.x);
    Dialog.open(this, ameliaSisterDialog);
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
}

export { Act3Scene };
