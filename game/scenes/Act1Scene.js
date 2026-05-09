import { EnemyController, EnemyBehavior } from "../core/EnemyController.js";
import { GameState, dadAct1Dialog } from "../data/dialogs.js";
import { Scene, manager } from "@tialops/maki";

import { BattleController } from "../core/BattleController.js";
import { Dialog } from "../components/Dialog.js";
import { HealthHUD } from "../components/HealthHUD.js";
import { Equipment } from "../core/Equipment.js";
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

    this.player = PlayerController.create(this, 16, 128, "player");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "enemy", "enemy");
    SpriteLoader.load(this, "dad", "dad");

    this.physics.add.collider(
      this.player.hitbox,
      manager.getWallGroup(this, "act_1"),
    );

    this.dad = NPCController.create(this, 48, 118, "dad");
    this.physics.add.collider(this.player.hitbox, this.dad.hitbox);
    this.dad.hitbox.body.setImmovable(true);
    SpriteLoader.createAnims(this, "dad", "dad");

    this.enemy = EnemyController.create(this, 88, 260, "enemy");
    this.enemy.health = 3;
    this.physics.add.collider(this.player.hitbox, this.enemy.hitbox);
    this.physics.add.collider(
      this.enemy.hitbox,
      manager.getWallGroup(this, "act_1"),
    );
    this.enemy.hitbox.body.setImmovable(true);
    this.enemy.hitbox.body.setCollideWorldBounds(true);

    this.enemyWeapon = this.add.sprite(
      this.enemy.x + 8,
      this.enemy.y + 4,
      "axe",
    );
    this.enemyWeapon.setOrigin(1.5, 0.7);
    this.enemyWeapon.setDepth(this.enemy.depth + 1);

    if (GameState.hasWeapon) {
      const weaponItem = Inventory.items[Inventory.items.length - 1];
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }

    HealthHUD.init();

    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.setBounds(0, 0, 640, 448);

    this.cameras.main.fadeIn(500);

    BattleController.setup(this, this.player);
  }

  update(time) {
    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
      BattleController.attack(this, this.player, this.keys, this.enemy);
    }
    NPCController.handleAnimation(this.dad, time);
    EnemyController.handleAnimation(this.enemy, time);
    EnemyController.updateHealth(this.enemy, this.enemy.health);
    const distToPlayer = EnemyController.getDistanceToTarget(
      this.enemy,
      this.player,
    );

    if (distToPlayer < EnemyBehavior.visionRange && !Dialog.isOpen()) {
      if (distToPlayer > EnemyBehavior.attackRange) {
        EnemyController.chase(this, this.enemy, this.player);
        this.enemy.hitbox.body.setImmovable(true);
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
    Equipment.update(this, this.player);
    HealthHUD.update();
    Dialog.update(time);

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
    const nearNPC = InteractionManager.getNearObject(
      this.player,
      [this.dad],
      25,
    );
    if (nearNPC) {
      return { type: "npc", target: nearNPC };
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
    if (this.player.x < this.dad.x) {
      this.dad.setFlipX(true);
    } else {
      this.dad.setFlipX(false);
    }
    Dialog.open(this, dadAct1Dialog);
  }
}

export { Act1Scene };
