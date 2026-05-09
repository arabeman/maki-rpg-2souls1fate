import { EnemyBehavior, EnemyController } from "../core/EnemyController.js";
import {
  GameState,
  dadAct1Dialog,
  georgesNpcDialog,
  georgesNpcDialog2,
} from "../data/dialogs.js";
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
    SpriteLoader.loadImage(this, "emote_exclamation", "exclamation");
    SpriteLoader.loadImage(this, "emote_exclamations", "exclamations");
    SpriteLoader.loadImage(this, "emote_question", "question");
    this.load.spritesheet("georges", "assets/tiles_kenney/georges.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
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

    this.georges = NPCController.create(this, 47, 33, "georges");
    this.georges.hitbox.body.setImmovable(true);
    this.georges.hitbox.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.hitbox, this.georges.hitbox);
    this.physics.add.collider(this.georges.hitbox, manager.getWallGroup(this, "act_1"));

    if (GameState.leftBeginScene) {
      SpriteLoader.load(this, "dad", "dad");
      this.dad = NPCController.create(this, 48, 118, "dad");
      this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
      this.dad.hitbox.body.setImmovable(true);
      SpriteLoader.createAnims(this, "dad", "dad");
      this.dadEmote = showEmote(this, this.dad, "question", 0);
    }

    // enemies[i] = { sprite, weapon }
    this.enemies = [
      { sprite: this.createEnemy(88, 260) },
      { sprite: this.createEnemy(89, 383) },
      { sprite: this.createEnemy(373, 114 - 10) },
      { sprite: this.createEnemy(373, 114 + 16 - 10) },
      { sprite: this.createEnemy(295, 415) },
      { sprite: this.createEnemy(378, 413) },
      { sprite: this.createEnemy(578, 240) },
      { sprite: this.createEnemy(511, 259) },
      { sprite: this.createEnemy(586, 395, 5) },
      { sprite: this.createEnemy(73, 33, 4, "left") },
    ].map((e) => ({ ...e, weapon: this.createEnemyWeapon(e.sprite) }));

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
        console.log(
          "Player pos:",
          Math.round(this.player.x),
          Math.round(this.player.y),
        );
      },
    });

    BattleController.setup(this, this.player);
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
      manager.getWallGroup(this, "act_1"),
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

  // Triggers the flash-and-destroy death sequence for one enemy entry.
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

  // Cleans up all objects belonging to one enemy entry.
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

  // Runs the per-frame AI for one enemy entry.
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
      // Show alert emote on first sight
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
        if (dist > EnemyBehavior.attackRange) {
          if (enemy.enemyEmote) {
            enemy.enemyEmote.destroy();
            enemy.enemyEmote = null;
          }
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

  update(time) {
    if (GameState.playerHealth <= 0 && !this.playerDied) {
      this.playerDied = true;
      GameState.playerHealth = 3;
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
    Dialog.update(time);

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
  }

  getNearInteractable() {
    if (this.georges) {
      const nearGeorges = InteractionManager.getNearObject(
        this.player,
        [this.georges],
        25,
      );
      if (nearGeorges) return { type: "npc", target: nearGeorges };
    }

    if (this.dad) {
      const nearNPC = InteractionManager.getNearObject(
        this.player,
        [this.dad],
        25,
      );
      if (nearNPC) return { type: "npc", target: nearNPC };
    }
    return null;
  }

  handleInteraction() {
    const interactable = this.getNearInteractable();
    if (!interactable) return;
    if (interactable.type === "npc") this.handleNPCTalk(interactable.target);
  }

  handleNPCTalk(npc) {
    if (!npc) return;

    if (npc === this.dad && this.dadEmote) {
      this.dadEmote.destroy();
      this.dadEmote = null;
    }

    npc.setFlipX(this.player.x < npc.x);

    if (npc === this.georges) {
      const dialogToOpen = GameState.georgesTalked
        ? georgesNpcDialog2
        : georgesNpcDialog;
      Dialog.open(this, dialogToOpen);
      GameState.georgesTalked = true;
      return;
    }

    if (npc === this.dad) {
      Dialog.open(this, dadAct1Dialog);
    }
  }

}

export { Act1Scene };
