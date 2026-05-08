import Phaser from "phaser";
import { Equipment } from "./Equipment.js";

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

    if (!isRight) {
      return;
    }

    const mainHand = Equipment.getMainHand();
    if (!mainHand) {
      return;
    }

    const swordSprite = mainHand.sprite;

    if (scene.isAttacking) {
      return;
    }

    scene.isAttacking = true;

    scene.attackTile = scene.add
      .image(player.x + 16, player.y, "attack")
      .setOrigin(0.5)
      .setDepth(99);

    scene.tweens.add({
      targets: swordSprite,
      angle: 90,
      duration: 100,
      onComplete: () => {
        scene.time.delayedCall(100, () => {
          scene.tweens.add({
            targets: swordSprite,
            angle: 0,
            duration: 100,
            onComplete: () => {
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