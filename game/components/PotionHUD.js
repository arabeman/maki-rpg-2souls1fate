import { Inventory } from "../core/Inventory.js";

export class PotionHUD {
  static unlocked = false;
  static lastCountText = null;
  static wasVisible = false;

  static init() {
    this._injectStyles();
    this._buildDOM();
  }

  static _injectStyles() {
    if (document.getElementById("potion-hud-styles")) return;

    const style = document.createElement("style");
    style.id = "potion-hud-styles";
    style.textContent = `
      :root {
        --dialog-primary: #db9764;
        --dialog-text: #c3bcbc;
        --dialog-muted: #60687f;
        --dialog-bg: #161010;
      }
      
      .potion-hud {
        position: absolute;
        top: 12px;
        right: 18px;
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

      .potion-hud.visible {
        opacity: 1;
      }

      .potion-hud-panel {
        position: absolute;
        inset: 0;
        border-image-slice: 6 6 6 6 fill;
        border-image-width: 6px;
        border-style: solid;
        border-image-source: url('assets/ui_kenney/PNG/Default/Panel/panel-010.png');
        background-color: #161010;
        opacity: 1;
        pointer-events: none;
      }

      .potion-hud img {
        position: relative;
        width: 30px;
        height: 30px;
        image-rendering: pixelated;
        z-index: 1;
      }

      .potion-hud-count {
        position: absolute;
        left: 50%;
        bottom: -28px;
        transform: translateX(-50%);
        min-width: 24px;
        width: 24px;
        height: 24px;
        padding: 4px 4px;
        color: #ff4d4d;
        background: var(--dialog-bg);
        border-radius: 4px;
        font-family: 'Monocraft', monospace;
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        text-align: center;
        z-index: 2;
      }

      .potion-hud.shake {
        animation: potion-hud-shake 180ms linear 1;
      }

      @keyframes potion-hud-shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        50% { transform: translateX(3px); }
        75% { transform: translateX(-2px); }
        100% { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  static _buildDOM() {
    this.container = document.createElement("div");
    this.container.className = "potion-hud";

    this.panel = document.createElement("div");
    this.panel.className = "potion-hud-panel";
    this.container.appendChild(this.panel);

    this.icon = document.createElement("img");
    this.icon.src = "assets/tiles_kenney/potion.png";
    this.icon.alt = "Potion";
    this.container.appendChild(this.icon);

    this.count = document.createElement("div");
    this.count.className = "potion-hud-count";
    this.count.textContent = "0";
    this.container.appendChild(this.count);

    document.body.appendChild(this.container);
  }

  static update() {
    if (!this.container) return;

    const potionCount = Inventory.count("potion");
    let shouldBeVisible = false;
    let countText = "x0";

    if (potionCount > 0) {
      this.unlocked = true;
      shouldBeVisible = true;
      countText = `x${potionCount}`;
    } else {
      shouldBeVisible = this.unlocked;
    }

    if (shouldBeVisible !== this.wasVisible) {
      this.container.classList.toggle("visible", shouldBeVisible);
      this.wasVisible = shouldBeVisible;
    }

    if (countText !== this.lastCountText) {
      this.count.textContent = countText;
      this.lastCountText = countText;
    }
  }

  static shake() {
    if (!this.container || !this.unlocked) return;
    this.container.classList.remove("shake");
    // Force reflow so repeated shakes retrigger animation.
    void this.container.offsetWidth;
    this.container.classList.add("shake");
  }
}
