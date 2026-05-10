export class Inventory {
  static items = [];

  static add(item) {
    this.items.push(item);
    this._updateUI();
  }

  static has(itemId) {
    return this.items.some(i => i.id === itemId);
  }

  static count(itemId) {
    return this.items.filter((i) => i.id === itemId).length;
  }

  static removeOne(itemId) {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) return null;
    const [removed] = this.items.splice(index, 1);
    this._updateUI();
    return removed;
  }

  static getLastBySlot(slot) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i]?.slot === slot) return this.items[i];
    }
    return null;
  }

  static getBySlot(slot) {
    return this.items.filter((item) => item?.slot === slot);
  }

  static _updateUI() {
  }
}
