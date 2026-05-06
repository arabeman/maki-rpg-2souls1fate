export class PlayerController {
  static create(scene, x, y, name) {
    const player = scene.physics.add.sprite(x, y, name);
    player.setDepth(100);
    player.setDisplaySize(14, 14);
    player.animOffset = Math.random() * 1000;
    return player;
  }

  static setupInput(scene) {
    const keys = scene.input.keyboard.createCursorKeys();
    keys.e = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    keys.space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    keys.a = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.d = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keys.w = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    return keys;
  }

  static handleMovement(player, keys, speed = 160) {
    player.setVelocity(0);

    const movements = [
      { key: "left", vel: { x: -speed, y: 0 }, anim: "left" },
      { key: "right", vel: { x: speed, y: 0 }, anim: "right" },
      { key: "up", vel: { x: 0, y: -speed }, anim: "up" },
      { key: "down", vel: { x: 0, y: speed }, anim: "down" },
    ];

    const isLeft = keys.left.isDown || keys.a.isDown;
    const isRight = keys.right.isDown || keys.d.isDown;
    const isUp = keys.up.isDown || keys.w.isDown;
    const isDown = keys.down.isDown || keys.s.isDown;

    if (isLeft) {
      player.setVelocity(-speed, 0);
      player.setFlipX(true);
      player.anims.play("player-left", true);
      return;
    }
    if (isRight) {
      player.setVelocity(speed, 0);
      player.setFlipX(false);
      player.anims.play("player-right", true);
      return;
    }
    if (isUp) {
      player.setVelocity(0, -speed);
      player.anims.play("player-up", true);
      return;
    }
    if (isDown) {
      player.setVelocity(0, speed);
      player.anims.play("player-down", true);
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
    const widthPulse = Math.sin((time + player.animOffset) / 110);
    const heightPulse = Math.sin((time + player.animOffset) / 80);

    const width = 16 + widthPulse * 0.6;
    const height = 14 + heightPulse * 0.5;

    player.setDisplaySize(width, height);
  }

  static handleWalking(player, time) {
    const widthPulse = Math.sin((time + player.animOffset) / 110);
    const heightPulse = Math.sin((time + player.animOffset) / 80);

    const width = 14 + widthPulse * 0.6;
    const height = 15 + heightPulse * 0.5;

    player.setDisplaySize(width, height);
  }
}
