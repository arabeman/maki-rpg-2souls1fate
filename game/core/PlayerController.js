import {
  PlayerConfig,
  createCharacter,
  handleIdle,
  handleWalking,
} from "./CharacterAnimation.js";

export class PlayerController {
  static create(scene, x, y, name) {
    return createCharacter(scene, x, y, name);
  }

  static setupInput(scene) {
    const keys = scene.input.keyboard.createCursorKeys();
    keys.space = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    keys.a = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.d = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keys.w = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    return keys;
  }

  static handleMovement(player, keys, speed = PlayerConfig.defaultSpeed) {
    player.setVelocity(0);

    const isLeft = keys.left.isDown || keys.a.isDown;
    const isRight = keys.right.isDown || keys.d.isDown;
    const isUp = keys.up.isDown || keys.w.isDown;
    const isDown = keys.down.isDown || keys.s.isDown;

    if (isLeft) {
      player.setVelocity(-speed, 0);
      player.setFlipX(true);
      player.anims.play(`${PlayerConfig.animPrefix}left`, true);
      return;
    }
    if (isRight) {
      player.setVelocity(speed, 0);
      player.setFlipX(false);
      player.anims.play(`${PlayerConfig.animPrefix}right`, true);
      return;
    }
    if (isUp) {
      player.setVelocity(0, -speed);
      player.anims.play(`${PlayerConfig.animPrefix}up`, true);
      return;
    }
    if (isDown) {
      player.setVelocity(0, speed);
      player.anims.play(`${PlayerConfig.animPrefix}down`, true);
      return;
    }

    player.anims.stop();
  }

  static handleAnimation(player, keys, time) {
    const isLeft = keys.left.isDown || keys.a.isDown;
    const isRight = keys.right.isDown || keys.d.isDown;
    const isUp = keys.up.isDown || keys.w.isDown;
    const isDown = keys.down.isDown || keys.s.isDown;

    if (isLeft || isRight || isUp || isDown) {
      this.handleWalking(player, time);
    } else {
      this.handleIdle(player, time);
    }
  }

  static handleIdle(player, time) {
    handleIdle(player, time, PlayerConfig);
  }

  static handleWalking(player, time) {
    handleWalking(player, time, PlayerConfig);
  }
}
