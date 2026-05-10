import {
  PlayerConfig,
  createCharacter,
  handleIdle,
  handleWalking,
  syncSpriteToHitbox,
} from "./CharacterAnimation.js";
import { Equipment } from "./Equipment.js";
import { Inventory } from "./Inventory.js";
import { Dialog } from "../components/Dialog.js";

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
    keys.tab = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.TAB,
    );
    scene.input.keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.TAB);

    return keys;
  }

  static handleWeaponSwitch(scene, player, keys) {
    if (!keys?.tab || !Phaser.Input.Keyboard.JustDown(keys.tab)) return;

    const weapons = Inventory.getBySlot("mainHand");
    if (weapons.length < 2) return;

    const currentWeaponId = Equipment.getMainHand()?.item?.id;
    const currentIndex = weapons.findIndex((weapon) => weapon.id === currentWeaponId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % weapons.length : 0;
    Equipment.equip(scene, player, weapons[nextIndex]);
  }

  static handleMovement(player, keys, speed = PlayerConfig.defaultSpeed) {
    // Prevent movement when dialog is open
    if (Dialog.isOpen()) {
      return;
    }

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
