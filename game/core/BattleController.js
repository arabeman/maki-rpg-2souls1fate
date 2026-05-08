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

    // Determine which direction is pressed (priority: right > left > up > down)
    let dx = 0, dy = 0, angle = 0;
    if      (right.isDown) { dx =  16; dy =   0; angle =  90; }
    else if (left.isDown)  { dx = -16; dy =   0; angle = -90; }
    else if (up.isDown)    { dx =   0; dy = -16; angle =   0; }
    else if (down.isDown)  { dx =   0; dy =  16; angle = 180; }
    else return; // no direction key held

    const mainHand = Equipment.getMainHand();
    if (!mainHand) return;
    if (scene.isAttacking) return;

    scene.isAttacking = true;

    const equippedSword = mainHand.sprite;
    if (equippedSword) equippedSword.setVisible(false);

    const startX  = player.x;
    const startY  = player.y;
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    const swordSprite = scene.add
      .image(startX, startY, mainHand.textureKey ?? "sword")
      .setOrigin(0.5)
      .setAngle(angle)
      .setDepth(player.depth + 2);

    scene.attackTile = scene.add
      .image(targetX, targetY, "attack")
      .setOrigin(0.5)
      .setDepth(player.depth + 1);

    scene.tweens.add({
      targets: swordSprite,
      x: targetX,
      y: targetY,
      duration: 100,
      ease: "Linear",
      onComplete: () => {
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
              if (equippedSword) equippedSword.setVisible(true);
              scene.isAttacking = false;
            },
          });
        });
      },
    });
  }
}