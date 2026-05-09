import { Equipment } from "./Equipment.js";
import Phaser from "phaser";

export class BattleController {
  static setup(scene, player) {
    scene.attackKeys = {
      left:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up:    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  static checkHit(attackX, attackY, target) {
    if (!target) return false;
    const hitSize = 24;
    const dx = Math.abs(attackX - target.x);
    const dy = Math.abs(attackY - target.y);
    return dx < hitSize && dy < hitSize;
  }

  static attack(scene, player, keys, enemy = null) {
    const { left, right, up, down } = scene.attackKeys;

    const mainHand = Equipment.getMainHand();
    if (!mainHand) return;
    if (scene.isAttacking) return;

    const weapon = mainHand.item;
    const range = weapon.range || 16;
    const damage = weapon.damage || 1;

    let dx = 0, dy = 0, angle = 0;
    if      (right.isDown) { dx = range; dy =   0; angle =  90; }
    else if (left.isDown)  { dx = -range; dy =   0; angle = -90; }
    else if (up.isDown)    { dx =   0; dy = -range; angle =   0; }
    else if (down.isDown)  { dx =   0; dy =  range; angle = 180; }
    else return;

    scene.isAttacking = true;

    const equippedSword = mainHand.sprite;
    if (equippedSword) equippedSword.setVisible(false);

    // Track how far along the thrust we are (0 = at player, 1 = full extension)
    const progress = { t: 0 };

    const swordSprite = scene.add
      .image(player.x, player.y, weapon.texture ?? "sword1")
      .setOrigin(0.5)
      .setAngle(angle)
      .setDepth(player.depth + 2);

    scene.attackTile = scene.add
      .image(player.x + dx, player.y + dy, "attack")
      .setOrigin(0.5)
      .setDepth(player.depth - 1);

    // Helper: reposition both sprites anchored to the current player position
    const syncPositions = (t) => {
      swordSprite.setPosition(player.x + dx * t, player.y + dy * t);
      if (scene.attackTile) {
        scene.attackTile.setPosition(player.x + dx, player.y + dy);
      }
    };

    // Thrust outward
    const attackX = player.x + dx;
    const attackY = player.y + dy;
    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: 100,
      ease: "Linear",
      onUpdate: () => syncPositions(progress.t),
      onComplete: () => {
        if (enemy && this.checkHit(attackX, attackY, enemy.hitbox || enemy)) {
          enemy.health = Math.max(0, (enemy.health || 3) - (weapon.damage || 1));
          scene.cameras.main.shake(100, 0.003);

          // Impact effect
          const impactFrames = ["impact0", "impact1", "impact2", "impact3", "impact4", "impact5"];
          let frameIndex = 0;
          const impact = scene.add.image(attackX, attackY, "impact0");
          impact.setOrigin(0.5);
          impact.setDepth(enemy.depth + 5);
          impact.setScale(0.2);
          scene.time.addEvent({
            delay: 50,
            repeat: 5,
            callback: () => {
              if (frameIndex < impactFrames.length) {
                impact.setTexture(impactFrames[frameIndex]);
                frameIndex++;
              }
              if (frameIndex >= impactFrames.length) {
                impact.destroy();
              }
            },
          });

          if (enemy.hitbox) {
            const knockDirX = dx / range;
            const knockDirY = dy / range;
            const knockSpeed = 400;
            const knockDuration = 180; // ms until velocity fades

            // Unlock physics, apply a strong initial burst
            enemy.hitbox.body.setImmovable(false);
            enemy.hitbox.body.setVelocity(knockDirX * knockSpeed, knockDirY * knockSpeed);

            // Smoothly decelerate the knockback over time
            const knockStart = scene.time.now;
            const knockUpdate = scene.time.addEvent({
              delay: 16,
              repeat: Math.ceil(knockDuration / 16),
              callback: () => {
                if (!enemy.hitbox) return;
                const elapsed = scene.time.now - knockStart;
                const factor = Math.max(0, 1 - elapsed / knockDuration);
                // Ease-out: decelerate quickly, then settle
                enemy.hitbox.body.setVelocity(
                  knockDirX * knockSpeed * factor * factor,
                  knockDirY * knockSpeed * factor * factor
                );
                if (factor <= 0) {
                  enemy.hitbox.body.setVelocity(0, 0);
                  enemy.hitbox.body.setImmovable(true);
                  knockUpdate.remove();
                }
              },
            });

            // Hit-flash: rapidly blink the enemy sprite white
            const flashEnemy = () => {
              if (enemy && enemy.active) enemy.setTint(0xffffff);
            };
            const clearFlash = () => {
              if (enemy && enemy.active) enemy.clearTint();
            };
            flashEnemy();
            scene.time.delayedCall(80, clearFlash);
            scene.time.delayedCall(160, flashEnemy);
            scene.time.delayedCall(240, clearFlash);
            scene.time.delayedCall(320, () => {
              if (enemy && enemy.active) enemy.clearTint();
            });

            // Stop enemy attack if hit
            enemy.isStunned = true;
            scene.enemyAttacking = false;
            setTimeout(() => {
              if (enemy) enemy.isStunned = false;
            }, 500);
          }
        }
        scene.time.delayedCall(80, () => {
          // Retract back
          scene.tweens.add({
            targets: progress,
            t: 0,
            duration: 100,
            ease: "Linear",
            onUpdate: () => syncPositions(progress.t),
            onComplete: () => {
              swordSprite.destroy();
              if (scene.attackTile) {
                scene.attackTile.destroy();
                scene.attackTile = null;
              }
              if (equippedSword) equippedSword.setVisible(true);
              scene.isAttacking = false;
            },
          });
        });
      },
    });
  }
}