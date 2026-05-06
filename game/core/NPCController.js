export class NPCController {
  static create(scene, x, y, name) {
    const npc = scene.physics.add.sprite(x, y, name);
    npc.setDepth(100);
    npc.setDisplaySize(14, 14);
    npc.animOffset = Math.random() * 1000;
    return npc;
  }

  static createWithDialog(scene, x, y, name, dialogId) {
    const npc = this.create(scene, x, y, name);
    npc.dialogId = dialogId;
    return npc;
  }

  static handleMovement(npc, targetX, targetY, speed = 160) {
    const dx = targetX - npc.x;
    const dy = targetY - npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 4) {
      npc.setVelocity(0);
      npc.anims.stop();
      return true;
    }

    npc.setVelocity((dx / distance) * speed, (dy / distance) * speed);

    if (Math.abs(dx) > Math.abs(dy)) {
      npc.setFlipX(dx < 0);
      npc.anims.play(`npc-${dx < 0 ? "left" : "right"}`, true);
    } else {
      npc.anims.play(`npc-${dy < 0 ? "up" : "down"}`, true);
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
    const widthPulse = Math.sin((time + npc.animOffset) / 110);
    const heightPulse = Math.sin((time + npc.animOffset) / 80);

    const width = 16 + widthPulse * 0.6;
    const height = 14 + heightPulse * 0.5;

    npc.setDisplaySize(width, height);
  }

  static handleWalking(npc, time) {
    const widthPulse = Math.sin((time + npc.animOffset) / 110);
    const heightPulse = Math.sin((time + npc.animOffset) / 80);

    const width = 14 + widthPulse * 0.6;
    const height = 15 + heightPulse * 0.5;

    npc.setDisplaySize(width, height);
  }
}