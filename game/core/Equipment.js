export class Equipment {
  static slots = {
    mainHand: null,
    offHand: null,
  };

  static equip(scene, player, item) {
    const slot = item.slot || "mainHand";

    if (this.slots[slot]) {
      this.unequip(slot);
    }

    const sprite = scene.add.sprite(
      player.x + 4,
      player.y + 8,
      item.texture,
    );
    sprite.setOrigin(1.5, 0.7);
    sprite.setFlipX(player.flipX);

    this.slots[slot] = {
      item,
      sprite,
    };

    return sprite;
  }

  static unequip(slot) {
    if (this.slots[slot]) {
      this.slots[slot].sprite.destroy();
      this.slots[slot] = null;
    }
  }

  static update(scene, player) {
    for (const [slotName, slotData] of Object.entries(this.slots)) {
      if (slotData) {
        slotData.sprite.setPosition(player.x + 8, player.y + 4);
        const depthOffset = player.flipX ? -1 : 1;
        slotData.sprite.setDepth(player.depth + depthOffset);
      }
    }
  }

  static has(itemId) {
    return Object.values(this.slots).some(
      slot => slot && slot.item.id === itemId
    );
  }

  static getMainHand() {
    return this.slots.mainHand;
  }
}