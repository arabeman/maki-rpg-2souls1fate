import { EnemyBehavior, EnemyController } from "../../core/EnemyController.js";
import { Dialog } from "../../components/Dialog.js";
import { manager } from "@tialops/maki";
import { showEmote } from "../../core/EmoteController.js";

export function createEnemy(scene, x, y, health = 3, facing = "right") {
  const enemy = EnemyController.create(scene, x, y, "enemy");
  enemy.health = health;
  enemy.maxHealth = health;
  enemy.setFlipX(facing === "left");
  enemy.enemyEmote = null;
  enemy.canMove = false;

  scene.physics.add.collider(scene.player.hitbox, enemy.hitbox);
  scene.physics.add.collider(enemy.hitbox, manager.getWallGroup(scene, "act_1"));
  enemy.hitbox.body.setImmovable(false);
  enemy.hitbox.body.setCollideWorldBounds(true);
  EnemyController.updateHealth(enemy, enemy.health);
  return enemy;
}

export function createEnemyWeapon(scene, enemy) {
  const weapon = scene.add.sprite(enemy.x + 8, enemy.y + 4, "axe");
  weapon.setOrigin(1.5, 0.7);
  weapon.setDepth(enemy.depth + 1);
  return weapon;
}

export function triggerEnemyDeath(scene, entry) {
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
    scene.time.addEvent({ delay, callback: flash }),
  );
  scene.time.addEvent({
    delay: 320,
    callback: () => destroyEnemyEntry(scene, entry),
  });
}

export function destroyEnemyEntry(scene, entry) {
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

export function updateEnemyAI(scene, entry, time) {
  const { sprite: enemy } = entry;
  if (!enemy || !enemy.active || enemy.isDying) return;

  EnemyController.handleAnimation(enemy, time);

  if (enemy.lastHealth !== enemy.health) {
    enemy.lastHealth = enemy.health;
    EnemyController.showHealthBar(enemy);
  }
  EnemyController.updateHealth(enemy, enemy.health);

  const dist = EnemyController.getDistanceToTarget(enemy, scene.player);
  if (dist < EnemyBehavior.visionRange && !Dialog.isOpen()) {
    if (!enemy.canMove && !enemy.enemyEmote) {
      const emote = showEmote(scene, enemy, "exclamations", 0);
      if (emote) {
        enemy.enemyEmote = emote;
        scene.time.delayedCall(200, () => {
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
        EnemyController.chase(scene, enemy, scene.player);
      } else {
        enemy.hitbox.body.setVelocity(0);
        enemy.anims.stop();
        EnemyController.attack(scene, enemy, scene.player, entry.weapon);
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
