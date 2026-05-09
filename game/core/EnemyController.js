import {
  EnemyConfig,
  createCharacter,
  handleIdle,
  handleWalking,
  syncSpriteToHitbox,
} from "./CharacterAnimation.js";

import { GameState } from "../data/dialogs.js";
import { HealthHUD } from "../components/HealthHUD.js";

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

  static chase(scene, enemy, target, speed = EnemyConfig.defaultSpeed * 0.55, stopDistance = 15) {
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

   static updateHealth(enemy, health, maxHealth) {
     if (!enemy.scene || !enemy.scene.textures.exists("heart_full")) return;

     const resolvedMaxHealth = Math.max(
       1,
       maxHealth ?? enemy.maxHealth ?? health ?? 1,
     );
     enemy.maxHealth = resolvedMaxHealth;

     const needsRebuild =
       !enemy.healthHearts || enemy.healthHearts.length !== resolvedMaxHealth;

     if (needsRebuild) {
       if (enemy.healthHearts) {
         enemy.healthHearts.forEach((heart) => heart && heart.destroy());
       }
       enemy.healthHearts = [];
       for (let i = 0; i < resolvedMaxHealth; i++) {
         const heart = enemy.scene.add.image(
           enemy.x,
           enemy.y - 12,
           "heart_full"
         );
         heart.setScrollFactor(1);
         heart.setDepth(enemy.depth + 10);
         heart.setScale(1);
         heart.setOrigin(0.5, 0.5);
         heart.setAlpha(0);
         enemy.healthHearts.push(heart);
       }
     }

     const clampedHealth = Math.max(0, Math.min(health ?? 0, resolvedMaxHealth));
     const gap = 10;
     const totalWidth = (resolvedMaxHealth - 1) * gap;
     const startX = enemy.x - totalWidth / 2;

     for (let i = 0; i < enemy.healthHearts.length; i++) {
       const heart = enemy.healthHearts[i];
       if (!heart) continue;
       heart.setVisible(i < clampedHealth);
       heart.x = startX + (i * gap);
       heart.y = enemy.y - 12;
     }
   }

  static showHealthBar(enemy) {
    if (!enemy.healthHearts) return;
    enemy.scene.tweens.killTweensOf(enemy.healthHearts);
    enemy.healthHearts.forEach(h => h && h.setAlpha(1));
    enemy.scene.tweens.add({
      targets: enemy.healthHearts,
      alpha: 0,
      duration: 700,
      delay: 500,
    });
  }

  static applyKnockbackToPlayer(scene, target, dirX, dirY, knockbackStrength = 120, duration = 150) {
    if (!target || !target.hitbox || !target.hitbox.body) return;

    target.isKnockedBack = true;
    target.hitbox.body.setVelocity(dirX * knockbackStrength, dirY * knockbackStrength);

    scene.cameras.main.shake(150, 0.004);
    scene.cameras.main.flash(100, 255, 0, 0, 0.15);

    scene.time.delayedCall(duration, () => {
      if (target && target.hitbox && target.hitbox.body) {
        target.hitbox.body.setVelocity(0);
      }
      target.isKnockedBack = false;
    });
  }

  static spawnSlashEffect(scene, x, y, angle, depth) {
    const gfx = scene.add.graphics();
    gfx.setDepth(depth + 5);

    let frame = 0;
    const totalFrames = 6;

    scene.time.addEvent({
      delay: 16,
      repeat: totalFrames - 1,
      callback: () => {
        const t = frame / totalFrames;
        const alpha = 1 - t;
        const radius = 10 + t * 8;

        gfx.clear();
        gfx.lineStyle(2, 0xffffff, alpha);
        gfx.beginPath();
        gfx.arc(x, y, radius, Phaser.Math.DegToRad(angle - 50), Phaser.Math.DegToRad(angle + 50));
        gfx.strokePath();

        gfx.lineStyle(1, 0xffddaa, alpha * 0.6);
        gfx.beginPath();
        gfx.arc(x, y, radius * 0.6, Phaser.Math.DegToRad(angle - 40), Phaser.Math.DegToRad(angle + 40));
        gfx.strokePath();

        frame++;
        if (frame >= totalFrames) {
          gfx.destroy();
        }
      },
    });
  }

  static attack(scene, enemy, target, equippedWeapon) {
    if (enemy.isAttacking || enemy.isStunned) return;

    const now = scene.time.now;
    const lastAttack = enemy.lastAttackTime || 0;
    const delay = 1000;

    if (now - lastAttack < delay) return;

    enemy.lastAttackTime = now;
    enemy.isAttacking = true;
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
        // Slash arc effect at the point of impact
        const impactX = enemy.x + attackDirX;
        const impactY = enemy.y + attackDirY;
        this.spawnSlashEffect(scene, impactX, impactY, angle, enemy.depth);

        // Knock the player away from the enemy
        this.applyKnockbackToPlayer(scene, target, dirX, dirY);

        // Apply damage to player
        GameState.playerHealth = Math.max(0, (GameState.playerHealth || 3) - 0.5);
        HealthHUD.update();

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
              enemy.isAttacking = false;
            },
          });
        });
      },
    });
  }
}
