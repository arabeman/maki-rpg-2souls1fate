export class PlayerController {
  static create(scene, x, y, name) {
    const player = scene.physics.add.sprite(x, y, name);
    player.setDepth(100);
    player.setDisplaySize(14, 14);
    player.animOffset = Math.random() * 1000;
    return player;
  }

  static setupInput(scene) {
    return scene.input.keyboard.createCursorKeys();
  }

  static handleMovement(player, keys, speed = 160) {
    player.setVelocity(0);

    const movements = [
      { key: "left", vel: { x: -speed, y: 0 }, anim: "left" },
      { key: "right", vel: { x: speed, y: 0 }, anim: "right" },
      { key: "up", vel: { x: 0, y: -speed }, anim: "up" },
      { key: "down", vel: { x: 0, y: speed }, anim: "down" },
    ];

    for (const { key, vel, anim } of movements) {
      if (keys[key].isDown) {
        player.setVelocity(vel.x, vel.y);
        if (key === "left") player.setFlipX(true);
        if (key === "right") player.setFlipX(false);
        player.anims.play(`player-${anim}`, true);
        return;
      }
    }

    player.anims.stop();
  }

  static handleAnimation(player, keys, time) {
    if (
      keys.left.isDown ||
      keys.right.isDown ||
      keys.up.isDown ||
      keys.down.isDown
    ) {
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
