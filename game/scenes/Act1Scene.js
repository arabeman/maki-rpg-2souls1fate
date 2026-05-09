import { EnemyBehavior, EnemyController } from "../core/EnemyController.js";
import { GameState, dadAct1Dialog } from "../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";

import { BattleController } from "../core/BattleController.js";
import { Dialog } from "../components/Dialog.js";
import { Equipment } from "../core/Equipment.js";
import { HealthHUD } from "../components/HealthHUD.js";
import { InteractionManager } from "../core/InteractionManager.js";
import { Inventory } from "../core/Inventory.js";
import { NPCController } from "../core/NPCController.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { showEmote } from "../core/EmoteController.js";

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
    SpriteLoader.loadImage(this, "hammer", "hammer");
    SpriteLoader.loadImage(this, "attack", "attack");
    SpriteLoader.loadImage(this, "axe", "axe");
    manager.map(this, "act_1");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.dad = null;
    this.sceneTransitioning = false;
    this.playerDied = false;

    this.player = PlayerController.create(this, 16, 128, "player");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "enemy", "enemy");

    this.physics.add.collider(
      this.player.hitbox,
      manager.getWallGroup(this, "act_1"),
    );

    if (GameState.leftBeginScene) {
      SpriteLoader.load(this, "dad", "dad");
      this.dad = NPCController.create(this, 48, 118, "dad");
      this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
      this.dad.hitbox.body.setImmovable(true);
      SpriteLoader.createAnims(this, "dad", "dad");
    }

    this.enemy = EnemyController.create(this, 88, 260, "enemy");
    this.enemy.health = 3;
    this.physics.add.collider(this.player.hitbox, this.enemy.hitbox);
    this.physics.add.collider(
      this.enemy.hitbox,
      manager.getWallGroup(this, "act_1"),
    );
    this.enemy.hitbox.body.setImmovable(false);

    this.enemy2 = EnemyController.create(this, 89, 383, "enemy");
    this.enemy2.health = 3;
    this.physics.add.collider(this.player.hitbox, this.enemy2.hitbox);
    this.physics.add.collider(
      this.enemy2.hitbox,
      manager.getWallGroup(this, "act_1"),
    );
    this.enemy2.hitbox.body.setImmovable(false);

    this.enemyWeapon = this.add.sprite(
      this.enemy.x + 8,
      this.enemy.y + 4,
      "axe",
    );
    this.enemyWeapon.setOrigin(1.5, 0.7);
    this.enemyWeapon.setDepth(this.enemy.depth + 1);

    this.enemy2Weapon = this.add.sprite(
      this.enemy2.x + 8,
      this.enemy2.y + 4,
      "axe",
    );
    this.enemy2Weapon.setOrigin(1.5, 0.7);
    this.enemy2Weapon.setDepth(this.enemy2.depth + 1);

    if (GameState.hasWeapon) {
      const weaponItem = Inventory.items[Inventory.items.length - 1];
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }

    HealthHUD.init();

    // Physics world bounds must match the actual map size in world coordinates.
    // Without this, Phaser defaults to the canvas pixel size (640×448 before zoom).
    // At zoom 1.4 that creates an invisible hard wall at ~320px on Y — that was the bug.
    this.physics.world.setBounds(0, 0, 640, 448);

    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.setBounds(0, 0, 640, 448);

    this.cameras.main.fadeIn(500);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        console.log("Player pos:", Math.round(this.player.x), Math.round(this.player.y));
      },
    });

    BattleController.setup(this, this.player);
  }

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

    // --- Player input ---
    if (!Dialog.isOpen()) {
      if (!this.player.isKnockedBack) {
        PlayerController.handleMovement(this.player, this.keys);
      }
      PlayerController.handleAnimation(this.player, this.keys, time);
      // Pass all enemies as an array — one swing, all hit-checks done inside BattleController
      BattleController.attack(this, this.player, this.keys, [this.enemy, this.enemy2]);
    }

    if (this.dad) {
      NPCController.handleAnimation(this.dad, time);
    }

    // --- Scene transition ---
    if (!this.sceneTransitioning && this.player.x < 0) {
      this.sceneTransitioning = true;
      GameState.returnedFromAct1 = true;
      GameState.leftBeginScene = false;
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BeginScene");
      });
      return;
    }

    // --- Enemy 1 death ---
    if (this.enemy && this.enemy.health <= 0 && !this.enemy.isDying) {
      this.enemy.isDying = true;
      const flashEnemy = () => {
        if (this.enemy && this.enemy.active) {
          this.enemy.setVisible(!this.enemy.visible);
          if (this.enemyWeapon) this.enemyWeapon.setVisible(this.enemy.visible);
        }
      };
      flashEnemy();
      this.time.addEvent({ delay: 80, callback: flashEnemy });
      this.time.addEvent({ delay: 160, callback: flashEnemy });
      this.time.addEvent({ delay: 240, callback: flashEnemy });
      this.time.addEvent({ delay: 320, callback: () => {
        if (this.enemyWeapon) {
          this.enemyWeapon.destroy();
          this.enemyWeapon = null;
        }
        if (this.enemy && this.enemy.healthHearts) {
          this.enemy.healthHearts.forEach(h => h && h.destroy());
          this.enemy.healthHearts = [];
        }
        if (this.enemy) {
          if (this.enemy.hitbox) {
            this.enemy.hitbox.body.setVelocity(0);
            this.enemy.hitbox.destroy();
            this.enemy.hitbox = null;
          }
          this.enemy.destroy();
          this.enemy = null;
        }
      }});
    }

    // --- Enemy 2 death ---
    // FIX 2: enemy2 death runs independently, not gated behind enemy1 being dead
    if (this.enemy2 && this.enemy2.health <= 0 && !this.enemy2.isDying) {
      this.enemy2.isDying = true;
      const flashEnemy2 = () => {
        if (this.enemy2 && this.enemy2.active) {
          this.enemy2.setVisible(!this.enemy2.visible);
          if (this.enemy2Weapon) this.enemy2Weapon.setVisible(this.enemy2.visible);
        }
      };
      flashEnemy2();
      this.time.addEvent({ delay: 80, callback: flashEnemy2 });
      this.time.addEvent({ delay: 160, callback: flashEnemy2 });
      this.time.addEvent({ delay: 240, callback: flashEnemy2 });
      this.time.addEvent({ delay: 320, callback: () => {
        if (this.enemy2Weapon) {
          this.enemy2Weapon.destroy();
          this.enemy2Weapon = null;
        }
        if (this.enemy2 && this.enemy2.healthHearts) {
          this.enemy2.healthHearts.forEach(h => h && h.destroy());
          this.enemy2.healthHearts = [];
        }
        if (this.enemy2) {
          if (this.enemy2.hitbox) {
            this.enemy2.hitbox.body.setVelocity(0);
            this.enemy2.hitbox.destroy();
            this.enemy2.hitbox = null;
          }
          this.enemy2.destroy();
          this.enemy2 = null;
        }
      }});
    }

    // --- Enemy 1 AI (runs independently every frame while alive) ---
    // FIX 3: no longer gated behind enemy2 being dead either
    if (this.enemy && this.enemy.active && !this.enemy.isDying) {
      EnemyController.handleAnimation(this.enemy, time);
      if (this.enemy.lastHealth !== this.enemy.health) {
        this.enemy.lastHealth = this.enemy.health;
        EnemyController.showHealthBar(this.enemy);
      }
      EnemyController.updateHealth(this.enemy, this.enemy.health);

      const distToPlayer = EnemyController.getDistanceToTarget(this.enemy, this.player);
      if (distToPlayer < EnemyBehavior.visionRange && !Dialog.isOpen()) {
        if (distToPlayer > EnemyBehavior.attackRange) {
          EnemyController.chase(this, this.enemy, this.player);
        } else {
          this.enemy.hitbox.body.setVelocity(0);
          this.enemy.anims.stop();
          EnemyController.attack(this, this.enemy, this.player, this.enemyWeapon);
        }
      } else {
        this.enemy.hitbox.body.setVelocity(0);
        this.enemy.anims.stop();
      }
      if (this.enemyWeapon) {
        this.enemyWeapon.setPosition(this.enemy.x + 8, this.enemy.y + 4);
        this.enemyWeapon.setFlipX(this.enemy.flipX);
      }
    }

    // --- Enemy 2 AI (runs independently every frame while alive) ---
    if (this.enemy2 && this.enemy2.active && !this.enemy2.isDying) {
      EnemyController.handleAnimation(this.enemy2, time);
      if (this.enemy2.lastHealth !== this.enemy2.health) {
        this.enemy2.lastHealth = this.enemy2.health;
        EnemyController.showHealthBar(this.enemy2);
      }
      EnemyController.updateHealth(this.enemy2, this.enemy2.health);

      const distToPlayer2 = EnemyController.getDistanceToTarget(this.enemy2, this.player);
      if (distToPlayer2 < EnemyBehavior.visionRange && !Dialog.isOpen()) {
        if (distToPlayer2 > EnemyBehavior.attackRange) {
          EnemyController.chase(this, this.enemy2, this.player);
        } else {
          this.enemy2.hitbox.body.setVelocity(0);
          this.enemy2.anims.stop();
          EnemyController.attack(this, this.enemy2, this.player, this.enemy2Weapon);
        }
      } else {
        this.enemy2.hitbox.body.setVelocity(0);
        this.enemy2.anims.stop();
      }
      if (this.enemy2Weapon) {
        this.enemy2Weapon.setPosition(this.enemy2.x + 8, this.enemy2.y + 4);
        this.enemy2Weapon.setFlipX(this.enemy2.flipX);
      }
    }

    // --- HUD, equipment, dialog (always runs once per frame) ---
    Equipment.update(this, this.player);
    HealthHUD.update();
    Dialog.update(time);

    // --- Interaction prompt & space key (always runs once per frame) ---
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
  }

  getNearInteractable() {
    if (this.dad) {
      const nearNPC = InteractionManager.getNearObject(
        this.player,
        [this.dad],
        25,
      );
      if (nearNPC) {
        return { type: "npc", target: nearNPC };
      }
    }
    return null;
  }

  handleInteraction() {
    const interactable = this.getNearInteractable();
    if (!interactable) return;

    if (interactable.type === "npc") {
      this.handleNPCTalk();
    }
  }

  handleNPCTalk() {
    if (!this.dad) return;
    if (this.player.x < this.dad.x) {
      this.dad.setFlipX(true);
    } else {
      this.dad.setFlipX(false);
    }
    Dialog.open(this, dadAct1Dialog);
  }
}

export { Act1Scene };