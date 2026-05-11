import { GameState } from "../data/dialogs.js";

export class HealthHUD {
  static lastHealth = null;

  static init() {
    this._injectStyles();
    this._buildDOM();
    this.lastHealth = null;
    this.update();
  }

  static _injectStyles() {
    if (document.getElementById("health-hud-styles")) return;

    const style = document.createElement("style");
    style.id = "health-hud-styles";
    style.textContent = `
      .health-hud {
        position: absolute;
        top: 18px;
        left: 18px;
        z-index: 9998;
        display: flex;
        gap: 4px;
        opacity: 1;
        transition: opacity 0.5s ease-out;
      }

      .health-hud.hidden {
        opacity: 0;
      }

      .health-hud img {
        width: 32px;
        height: 32px;
        image-rendering: pixelated;
      }
    `;
    document.head.appendChild(style);
  }

  static _buildDOM() {
    const existing = document.querySelector(".health-hud");
    if (existing) {
      this.container = existing;
      this.heartImgs = Array.from(existing.querySelectorAll("img"));
      return;
    }

    this.container = document.createElement("div");
    this.container.className = "health-hud";
    this.container.style.flexDirection = "row-reverse";
    this.container.innerHTML = `
      <img src="assets/heart_kenney/heart_full.png" />
      <img src="assets/heart_kenney/heart_full.png" />
      <img src="assets/heart_kenney/heart_full.png" />
    `;
    this.heartImgs = Array.from(this.container.querySelectorAll("img"));
    document.body.appendChild(this.container);
  }

  static update() {
    if (!this.container) return;

    const currentHealth = GameState.playerHealth ?? 3;
    if (currentHealth === this.lastHealth) return;

    this.lastHealth = currentHealth;
    const maxHealth = 3;
    const imgs = this.heartImgs || [];

    imgs.forEach((img, i) => {
      const reversedI = maxHealth - 1 - i;
      const slotValue = (reversedI + 1) * 2;
      const healthSlots = Math.ceil(currentHealth * 2);

      if (slotValue <= healthSlots) {
        img.src = "assets/heart_kenney/heart_full.png";
      } else if (slotValue - 1 <= healthSlots) {
        img.src = "assets/heart_kenney/heart_half.png";
      } else {
        img.src = "assets/heart_kenney/heart_empty.png";
      }
    });
  }
  static hide() {
    if (!this.container) return;
    this.container.classList.add("hidden");
  }
}
