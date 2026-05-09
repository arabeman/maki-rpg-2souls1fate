import {
  PlayerConfig,
  createCharacter,
  handleIdle,
  handleWalking,
  syncSpriteToHitbox,
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
    keys.e = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    return keys;
  }

  static handleMovement(player, keys, speed = PlayerConfig.defaultSpeed) {
    const hitbox = player.hitbox;
    hitbox.body.setVelocity(0);

    const isLeft = keys.left.isDown;
    const isRight = keys.right.isDown;
    const isUp = keys.up.isDown;
    const isDown = keys.down.isDown;

    if (isLeft) {
      hitbox.body.setVelocity(-speed, 0);
      player.setFlipX(true);
      player.anims.play(`${PlayerConfig.animPrefix}left`, true);
      return;
    }
    if (isRight) {
      hitbox.body.setVelocity(speed, 0);
      player.setFlipX(false);
      player.anims.play(`${PlayerConfig.animPrefix}right`, true);
      return;
    }
    if (isUp) {
      hitbox.body.setVelocity(0, -speed);
      player.anims.play(`${PlayerConfig.animPrefix}up`, true);
      return;
    }
    if (isDown) {
      hitbox.body.setVelocity(0, speed);
      player.anims.play(`${PlayerConfig.animPrefix}down`, true);
      return;
    }

    player.anims.stop();
  }

  static handleAnimation(player, keys, time) {
    syncSpriteToHitbox(player);

    const isLeft = keys.left.isDown;
    const isRight = keys.right.isDown;
    const isUp = keys.up.isDown;
    const isDown = keys.down.isDown;

    if (isLeft || isRight || isUp || isDown) {
      let direction = null;
      if (isUp) direction = "up";
      else if (isDown) direction = "down";
      else if (isLeft) direction = "left";
      else if (isRight) direction = "right";
      this.handleWalking(player, time, direction);
    } else {
      this.handleIdle(player, time);
    }
  }

  static handleIdle(player, time) {
    handleIdle(player, time, PlayerConfig);
  }

  static handleWalking(player, time, direction = null) {
    handleWalking(player, time, PlayerConfig, direction);
  }
}
