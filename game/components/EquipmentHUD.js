import { Equipment } from "../core/Equipment.js";

export class EquipmentHUD {
  static init() {
    this._injectStyles();
    this._buildDOM();
  }

static _injectStyles() {
    if (document.getElementById("equipment-hud-styles")) return;

    const style = document.createElement("style");
    style.id = "equipment-hud-styles";
    style.textContent = `
      :root {
        --dialog-primary: #db9764;
        --dialog-text: #c3bcbc;
        --dialog-muted: #60687f;
        --dialog-bg: #161010;
      }

      .equipment-hud {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: 44px;
        height: 44px;
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      }

      .equipment-hud-panel {
        position: absolute;
        inset: 0;
        border-image-slice: 6 6 6 6 fill;
        border-image-width: 6px;
        border-style: solid;
        border-image-source: url('assets/ui_kenney/PNG/Default/Panel/panel-010.png');
        background-color: var(--dialog-bg);
        opacity: 0.5;
        pointer-events: none;
      }

      .equipment-hud img {
        position: relative;
        width: 34px;
        height: 34px;
        image-rendering: pixelated;
        z-index: 1;
      }

      .equipment-hud-img {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .equipment-hud-empty {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  static _buildDOM() {
    this.container = document.createElement("div");
    this.container.className = "equipment-hud";

    this.panel = document.createElement("div");
    this.panel.className = "equipment-hud-panel";
    this.container.appendChild(this.panel);

    this.slot = document.createElement("div");
    this.slot.className = "equipment-hud-empty";
    this.container.appendChild(this.slot);
    document.body.appendChild(this.container);
  }

  static _getItemImage(texture) {
    const map = {
      "sword_pickup": "sword1.png",
    };
    return map[texture] || "sword1.png";
  }

  static update() {
    if (!this.slot) return;

    if (Equipment.slots.mainHand) {
      const item = Equipment.slots.mainHand.item;
      this.slot.className = "equipment-hud-img";
      this.slot.innerHTML = "";
      const img = document.createElement("img");
      img.src = `assets/tiles_kenney/${this._getItemImage(item.texture)}`;
      this.slot.appendChild(img);
    } else {
      this.slot.className = "equipment-hud-empty";
      this.slot.innerHTML = "";
    }
  }
}