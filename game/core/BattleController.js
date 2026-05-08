import { Equipment } from "./Equipment.js";
import Phaser from "phaser";

export class BattleController {
  static setup(scene, player) {
    scene.attackKeys = {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  static attack(scene, player, keys) {
    const isRight = scene.attackKeys.right.isDown;

    if (!isRight) return;

    const mainHand = Equipment.getMainHand();
    if (!mainHand) return;

    if (scene.isAttacking) return;

    scene.isAttacking = true;

    // Sword starts at player position
    const startX = player.x;
    const startY = player.y;

    // Target position: 16px to the right (where the attack tile used to appear)
    const targetX = player.x + 16;
    const targetY = player.y;

    // Create the sword sprite at the player's position, rotated 90° and above the player
    const swordSprite = scene.add
      .image(startX, startY, mainHand.textureKey ?? "sword")
      .setOrigin(0.5)
      .setAngle(90)
      .setDepth(player.depth + 2);

    // Attack tile visual at the hit position
    scene.attackTile = scene.add
      .image(targetX, targetY, "attack")
      .setOrigin(0.5)
      .setDepth(player.depth + 1);

    // Slide the sword outward to the attack position
    scene.tweens.add({
      targets: swordSprite,
      x: targetX,
      y: targetY,
      duration: 100,
      ease: "Linear",
      onComplete: () => {
        // Brief pause at the hit position, then retract
        scene.time.delayedCall(80, () => {
          scene.tweens.add({
            targets: swordSprite,
            x: startX,
            y: startY,
            duration: 100,
            ease: "Linear",
            onComplete: () => {
              swordSprite.destroy();
              if (scene.attackTile) {
                scene.attackTile.destroy();
                scene.attackTile = null;
              }
              scene.isAttacking = false;
            },
          });
        });
      },
    });
  }
}