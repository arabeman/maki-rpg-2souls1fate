import {
  EnemyConfig,
  createCharacter,
  handleIdle,
  handleWalking,
  syncSpriteToHitbox,
} from "./CharacterAnimation.js";

const ENEMY_AXE = {
  range: 24,
  delay: 500,
  damage: 4,
  texture: "axe",
};

export const EnemyBehavior = {
  visionRange: 100,
  attackRange: 25,
};

export class EnemyController {
  static create(scene, x, y, name) {
    return createCharacter(scene, x, y, name);
  }

  static handleMovement(enemy, targetX, targetY, speed = EnemyConfig.defaultSpeed) {
    const hitbox = enemy.hitbox;
    const dx = targetX - hitbox.x;
    const dy = targetY - hitbox.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < EnemyConfig.stopDistance) {
      hitbox.body.setVelocity(0);
      enemy.anims.stop();
      return true;
    }

    hitbox.body.setVelocity((dx / distance) * speed, (dy / distance) * speed);

    if (Math.abs(dx) > Math.abs(dy)) {
      enemy.setFlipX(dx < 0);
      enemy.anims.play(
        `${EnemyConfig.animPrefix}${dx < 0 ? "left" : "right"}`,
        true,
      );
    } else {
      enemy.anims.play(`${EnemyConfig.animPrefix}${dy < 0 ? "up" : "down"}`, true);
    }

    return false;
  }

  static handleAnimation(enemy, time) {
    syncSpriteToHitbox(enemy);

    const isMoving =
      enemy.hitbox.body.velocity.x !== 0 || enemy.hitbox.body.velocity.y !== 0;

    if (isMoving) {
      this.handleWalking(enemy, time);
    } else {
      this.handleIdle(enemy, time);
    }
  }

  static handleIdle(enemy, time) {
    handleIdle(enemy, time, EnemyConfig);
  }

  static handleWalking(enemy, time) {
    handleWalking(enemy, time, EnemyConfig);
  }

  static chase(scene, enemy, target, speed = EnemyConfig.defaultSpeed * 0.5, stopDistance = 15) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < stopDistance) {
      enemy.hitbox.body.setVelocity(0);
      enemy.anims.stop();
      return false;
    }

    const moveX = (dx / dist) * speed;
    const moveY = (dy / dist) * speed;
    enemy.hitbox.body.setVelocity(moveX, moveY);

    if (Math.abs(dx) > Math.abs(dy)) {
      enemy.setFlipX(dx < 0);
      enemy.anims.play(
        `${EnemyConfig.animPrefix}${dx < 0 ? "left" : "right"}`,
        true,
      );
    } else {
      enemy.anims.play(`${EnemyConfig.animPrefix}${dy < 0 ? "up" : "down"}`, true);
    }

    return true;
  }

  static getDistanceToTarget(enemy, target) {
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static updateHealth(enemy, health, maxHealth = 3) {
    if (!enemy.scene || !enemy.scene.textures.exists("heart_full")) return;

    if (!enemy.healthHearts) {
      enemy.healthHearts = [];
      for (let i = 0; i < maxHealth; i++) {
        const heart = enemy.scene.add.image(
          enemy.x,
          enemy.y - 12,
          "heart_full"
        );
        heart.setScrollFactor(1);
        heart.setDepth(enemy.depth + 10);
        heart.setScale(1);
        heart.setOrigin(0.5, 0.5);
        enemy.healthHearts.push(heart);
      }
    }

    const gap = 10;
    const totalWidth = (health - 1) * gap;
    const startX = enemy.x - totalWidth / 2;

    for (let i = 0; i < enemy.healthHearts.length; i++) {
      const heart = enemy.healthHearts[i];
      if (!heart) continue;
      if (i >= health) {
        heart.destroy();
        enemy.healthHearts[i] = null;
      } else {
        heart.x = startX + (i * gap);
        heart.y = enemy.y - 12;
      }
    }
  }

  static attack(scene, enemy, target, equippedWeapon) {
    if (scene.enemyAttacking || enemy.isStunned) return;

    const now = scene.time.now;
    const lastAttack = enemy.lastAttackTime || 0;
    const delay = 1000;

    if (now - lastAttack < delay) return;

    enemy.lastAttackTime = now;
    scene.enemyAttacking = true;
    const weapon = ENEMY_AXE;
    const range = 8;
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    const dirX = dx / dist;
    const dirY = dy / dist;

    let angle = 0;
    if (Math.abs(dirX) > Math.abs(dirY)) {
      angle = dirX > 0 ? 90 : -90;
    } else {
      angle = dirY > 0 ? 180 : 0;
    }

    if (equippedWeapon) equippedWeapon.setVisible(false);

    const attackSprite = scene.add
      .image(enemy.x, enemy.y, weapon.texture)
      .setOrigin(0.5)
      .setAngle(angle)
      .setDepth(enemy.depth + 2);

    const progress = { t: 0 };
    const attackDirX = dirX * range;
    const attackDirY = dirY * range;

    const syncPositions = (t) => {
      attackSprite.setPosition(enemy.x + attackDirX * t, enemy.y + attackDirY * t);
    };

    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: 100,
      ease: "Linear",
      onUpdate: () => syncPositions(progress.t),
      onComplete: () => {
        scene.time.delayedCall(80, () => {
          scene.tweens.add({
            targets: progress,
            t: 0,
            duration: 100,
            ease: "Linear",
            onUpdate: () => syncPositions(progress.t),
            onComplete: () => {
              attackSprite.destroy();
              if (equippedWeapon) equippedWeapon.setVisible(true);
              scene.enemyAttacking = false;
            },
          });
        });
      },
    });
  }
}