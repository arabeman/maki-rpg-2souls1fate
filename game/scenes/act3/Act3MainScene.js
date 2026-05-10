import { Scene, manager } from "@tialops/maki";
import { BattleController } from "../../core/BattleController.js";
import { Dialog } from "../../components/Dialog.js";
import { Equipment } from "../../core/Equipment.js";
import { EnemyController } from "../../core/EnemyController.js";
import { GameState } from "../../data/dialogs.js";
import { Inventory } from "../../core/Inventory.js";
import { PlayerController } from "../../core/PlayerController.js";
import { SpriteLoader } from "../../core/SpriteLoader.js";

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
    manager.map(this, "act_3");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);
    this.sceneTransitioning = false;

    this.player = PlayerController.create(
      this,
      56,
      395,
      "player",
    );
    this.player.setFlipX(true);
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

    this.physics.world.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, ACT3_MAP_WIDTH, ACT3_MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.fadeIn(500);

    this.enemies = [];

    BattleController.setup(this, this.player);

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
      GameState.playerHealth = 3;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () =>
        this.scene.restart(),
      );
      return;
    }

    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
      BattleController.attack(
        this,
        this.player,
        this.keys,
        this.enemies.map((e) => e.sprite).filter(Boolean),
      );
    }
    Equipment.update(this, this.player);

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
}

export { Act3Scene };
