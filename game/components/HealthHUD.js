import { GameState } from "../data/dialogs.js";

export class HealthHUD {
  static init() {
    this._injectStyles();
    this._buildDOM();
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
    this.container = document.createElement("div");
    this.container.className = "health-hud";
    this.container.innerHTML = `
      <img src="assets/heart_kenney/heart_full.png" />
      <img src="assets/heart_kenney/heart_full.png" />
      <img src="assets/heart_kenney/heart_full.png" />
    `;
    document.body.appendChild(this.container);
  }

  static update() {
    if (!this.container) return;

    const currentHealth = GameState.playerHealth || 3;
    const imgs = this.container.querySelectorAll("img");

    imgs.forEach((img, i) => {
      if (i < currentHealth) {
        img.src = "assets/heart_kenney/heart_full.png";
      } else {
        img.src = "assets/heart_kenney/heart_empty.png";
      }
    });
  }
}