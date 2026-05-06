import {
  NPCConfig,
  createCharacter,
  handleIdle,
  handleWalking,
} from "./CharacterAnimation.js";

export class NPCController {
  static create(scene, x, y, name) {
    return createCharacter(scene, x, y, name);
  }

  static createWithDialog(scene, x, y, name, dialogId) {
    const npc = this.create(scene, x, y, name);
    npc.dialogId = dialogId;
    return npc;
  }

  static handleMovement(npc, targetX, targetY, speed = NPCConfig.defaultSpeed) {
    const dx = targetX - npc.x;
    const dy = targetY - npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < NPCConfig.stopDistance) {
      npc.setVelocity(0);
      npc.anims.stop();
      return true;
    }

    npc.setVelocity((dx / distance) * speed, (dy / distance) * speed);

    if (Math.abs(dx) > Math.abs(dy)) {
      npc.setFlipX(dx < 0);
      npc.anims.play(
        `${NPCConfig.animPrefix}${dx < 0 ? "left" : "right"}`,
        true,
      );
    } else {
      npc.anims.play(`${NPCConfig.animPrefix}${dy < 0 ? "up" : "down"}`, true);
    }

    return false;
  }

  static handleAnimation(npc, time) {
    const isMoving = npc.body.velocity.x !== 0 || npc.body.velocity.y !== 0;

    if (isMoving) {
      this.handleWalking(npc, time);
    } else {
      this.handleIdle(npc, time);
    }
  }

  static handleIdle(npc, time) {
    handleIdle(npc, time, NPCConfig);
  }

  static handleWalking(npc, time) {
    handleWalking(npc, time, NPCConfig);
  }
}
