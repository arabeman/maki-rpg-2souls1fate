export class Inventory {
  static items = [];

  static add(item) {
    this.items.push(item);
    this._updateUI();
  }

  static has(itemId) {
    return this.items.some(i => i.id === itemId);
  }

  static _updateUI() {
    console.log("Inventory:", this.items);
  }
}