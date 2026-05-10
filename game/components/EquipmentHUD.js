import { Equipment } from "../core/Equipment.js";
import { GameState } from "../data/dialogs.js";

export class EquipmentHUD {
  static lastTexture = null;
  static wasVisible = false;

  static init() {
    this._injectStyles();
    this._buildDOM();
    this.lastTexture = null;
    this.wasVisible = false;
    this.update();
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
        opacity: 0;
        transition: opacity 0.2s ease-out;
      }

      .equipment-hud.visible {
        opacity: 1;
      }

      .equipment-hud-panel {
        position: absolute;
        inset: 0;
        border-image-slice: 6 6 6 6 fill;
        border-image-width: 6px;
        border-style: solid;
        border-image-source: url('assets/ui_kenney/PNG/Default/Panel/panel-010.png');
        background-color: var(--dialog-bg);
        opacity: 1;
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
    const existing = document.querySelector(".equipment-hud");
    if (existing) {
      this.container = existing;
      this.slot = existing.querySelector(".equipment-hud-img, .equipment-hud-empty");
      this.img = existing.querySelector("img");
      return;
    }

    this.container = document.createElement("div");
    this.container.className = "equipment-hud";

    this.panel = document.createElement("div");
    this.panel.className = "equipment-hud-panel";
    this.container.appendChild(this.panel);

    this.slot = document.createElement("div");
    this.slot.className = "equipment-hud-empty";
    this.img = document.createElement("img");
    this.container.appendChild(this.slot);
    document.body.appendChild(this.container);
  }

  static _getItemImage(texture) {
    return `${texture}.png`;
  }

  static update() {
    if (!this.slot) return;

    const mainHand = Equipment.slots.mainHand;
    const isVisible = Boolean(mainHand) || Boolean(GameState.hasWeapon);
    const texture = mainHand?.item?.texture || null;

    if (isVisible !== this.wasVisible) {
      this.container.classList.toggle("visible", isVisible);
      this.slot.className = isVisible ? "equipment-hud-img" : "equipment-hud-empty";
      this.wasVisible = isVisible;
    }

    if (isVisible && texture !== this.lastTexture) {
      this.img.src = `assets/tiles_kenney/${texture}.png`;
      if (!this.img.parentNode) this.slot.appendChild(this.img);
      this.lastTexture = texture;
    }

    if (!isVisible) {
      this.lastTexture = null;
      if (this.img.parentNode) this.img.remove();
    }
  }
}
