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

  static attack(scene, player, keys) {
    const { left, right, up, down } = scene.attackKeys;

    let dx = 0, dy = 0, angle = 0;
    if      (right.isDown) { dx =  16; dy =   0; angle =  90; }
    else if (left.isDown)  { dx = -16; dy =   0; angle = -90; }
    else if (up.isDown)    { dx =   0; dy = -16; angle =   0; }
    else if (down.isDown)  { dx =   0; dy =  16; angle = 180; }
    else return;

    const mainHand = Equipment.getMainHand();
    if (!mainHand) return;
    if (scene.isAttacking) return;

    scene.isAttacking = true;

    const equippedSword = mainHand.sprite;
    if (equippedSword) equippedSword.setVisible(false);

    // Track how far along the thrust we are (0 = at player, 1 = full extension)
    const progress = { t: 0 };

    const swordSprite = scene.add
      .image(player.x, player.y, mainHand.textureKey ?? "sword")
      .setOrigin(0.5)
      .setAngle(angle)
      .setDepth(player.depth + 2);

    scene.attackTile = scene.add
      .image(player.x + dx, player.y + dy, "attack")
      .setOrigin(0.5)
      .setDepth(player.depth + 1);

    // Helper: reposition both sprites anchored to the current player position
    const syncPositions = (t) => {
      swordSprite.setPosition(player.x + dx * t, player.y + dy * t);
      if (scene.attackTile) {
        scene.attackTile.setPosition(player.x + dx, player.y + dy);
      }
    };

    // Thrust outward
    scene.tweens.add({
      targets: progress,
      t: 1,
      duration: 100,
      ease: "Linear",
      onUpdate: () => syncPositions(progress.t),
      onComplete: () => {
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