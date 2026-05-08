import Phaser from "phaser";

export class BattleController {
  static setup(scene, player) {
    scene.attackSprite = null;

    scene.attackKeys = {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  static attack(scene, player, keys) {
    const isLeft = scene.attackKeys.left.isDown;
    const isRight = scene.attackKeys.right.isDown;
    const isUp = scene.attackKeys.up.isDown;
    const isDown = scene.attackKeys.down.isDown;

    if (!isLeft && !isRight && !isUp && !isDown) {
      return;
    }

    if (scene.attackSprite) {
      return;
    }

    let offsetX = 0;
    let offsetY = 0;

    if (isLeft) {
      offsetX = -16;
    } else if (isRight) {
      offsetX = 16;
    } else if (isUp) {
      offsetY = -16;
    } else if (isDown) {
      offsetY = 16;
    }

    scene.attackSprite = scene.add
      .image(player.x + offsetX, player.y + offsetY, "attack")
      .setOrigin(0.5)
      .setDepth(100);

    scene.time.delayedCall(200, () => {
      if (scene.attackSprite) {
        scene.attackSprite.destroy();
        scene.attackSprite = null;
      }
    });
  }
}