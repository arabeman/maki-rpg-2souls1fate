import { EnemyController } from "./EnemyController.js";
import { Equipment } from "./Equipment.js";
import Phaser from "phaser";

export class BattleController {
  static setup(scene, player) {
    // Reset transient combat state so restart/respawn never leaves attack locked.
    scene.isAttacking = false;
    if (scene.attackTile) {
      scene.attackTile.destroy();
      scene.attackTile = null;
    }

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

  // FIX: accepts a single enemy OR an array of enemies
  static attack(scene, player, keys, enemies = null) {
    const { left, right, up, down } = scene.attackKeys;

    const mainHand = Equipment.getMainHand();
    if (!mainHand) return;
    if (scene.isAttacking) return;

    const weapon = mainHand.item;
    const range = weapon.range || 16;
    const damage = Number.isFinite(weapon.damage) ? weapon.damage : 1;
    const weaponDelay = Number.isFinite(weapon.delay) ? weapon.delay : 100;
    const attackAnimDuration = weaponDelay;

    const now = scene.time.now;
    const lastAttackTime = scene.lastPlayerAttackTime || 0;
    if (now - lastAttackTime < weaponDelay) return;

    let dx = 0, dy = 0, angle = 0;
    if      (right.isDown) { dx =  range; dy =      0; angle =  90; }
    else if (left.isDown)  { dx = -range; dy =      0; angle = -90; }
    else if (up.isDown)    { dx =      0; dy = -range; angle =   0; }
    else if (down.isDown)  { dx =      0; dy =  range; angle = 180; }
    else return;

    scene.lastPlayerAttackTime = now;
    scene.isAttacking = true;

    const equippedSword = mainHand.sprite;
    if (equippedSword) equippedSword.setVisible(false);

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

    const syncPositions = (t) => {
      swordSprite.setPosition(player.x + dx * t, player.y + dy * t);
      if (scene.attackTile) {
        scene.attackTile.setPosition(player.x + dx, player.y + dy);
      }
    };

    const attackX = player.x + dx;
    const attackY = player.y + dy;

    // Normalise to array so the rest of the logic is identical regardless
    // of whether one enemy or several were passed in
    const enemyList = enemies
      ? Array.isArray(enemies) ? enemies : [enemies]
      : [];

    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: attackAnimDuration,
      ease: "Linear",
      onUpdate: () => syncPositions(progress.t),
      onComplete: () => {

        // Check every living enemy for a hit
        for (const enemy of enemyList) {
          if (!enemy || !enemy.active || enemy.isDying) continue;

          if (this.checkHit(attackX, attackY, enemy.hitbox || enemy)) {
            enemy.health = Math.max(0, (enemy.health ?? 3) - damage);
            EnemyController.updateHealth(enemy, enemy.health);
            EnemyController.showHealthBar(enemy);
            scene.cameras.main.shake(100, 0.003);

            // Impact effect
            const impactFrames = ["impact0","impact1","impact2","impact3","impact4","impact5"];
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
              const knockDuration = 180;

              enemy.hitbox.body.setImmovable(false);
              enemy.hitbox.body.setVelocity(knockDirX * knockSpeed, knockDirY * knockSpeed);

              const knockStart = scene.time.now;
              const knockUpdate = scene.time.addEvent({
                delay: 16,
                repeat: Math.ceil(knockDuration / 16),
                callback: () => {
                  if (!enemy.hitbox) return;
                  const elapsed = scene.time.now - knockStart;
                  const factor = Math.max(0, 1 - elapsed / knockDuration);
                  enemy.hitbox.body.setVelocity(
                    knockDirX * knockSpeed * factor * factor,
                    knockDirY * knockSpeed * factor * factor,
                  );
                  if (factor <= 0) {
                    enemy.hitbox.body.setVelocity(0, 0);
                    enemy.hitbox.body.setImmovable(true);
                    knockUpdate.remove();
                  }
                },
              });

              // Hit-flash per enemy (each one tracks its own tint)
              const flashEnemy = () => { if (enemy?.active) enemy.setTint(0xffffff); };
              const clearFlash = () => { if (enemy?.active) enemy.clearTint(); };
              flashEnemy();
              scene.time.delayedCall(80,  clearFlash);
              scene.time.delayedCall(160, flashEnemy);
              scene.time.delayedCall(240, clearFlash);
              scene.time.delayedCall(320, () => { if (enemy?.active) enemy.clearTint(); });

              // Stun this specific enemy, not a shared scene flag
              enemy.isStunned = true;
              scene.time.delayedCall(500, () => {
                if (enemy) enemy.isStunned = false;
              });
            }
          }
        }

        scene.time.delayedCall(Math.max(30, Math.round(weaponDelay * 0.25)), () => {
          scene.tweens.add({
            targets: progress,
            t: 0,
            duration: attackAnimDuration,
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
