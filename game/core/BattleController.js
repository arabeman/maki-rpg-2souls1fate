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

  static checkHit(attackX, attackY, target, range = 20) {
    if (!target) return false;
    const dx = attackX - target.x;
    const dy = attackY - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < range;
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
        if (enemy && this.checkHit(attackX, attackY, enemy.hitbox || enemy, 20)) {
          enemy.health = Math.max(0, (enemy.health || 3) - (weapon.damage || 1));
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