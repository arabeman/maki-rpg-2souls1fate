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
        left: 50%;
        transform: translateX(-180%);
        width: 90px;
        height: 24px;
        z-index: 9998;
        display: flex;
        gap: 5px;
        opacity: 0;
        transition: opacity 0.2s ease-out;
      }

      .health-hud.visible {
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
    document.body.appendChild(this.container);
  }

  static update() {
    if (!this.container) return;

    const maxHealth = 3;
    const currentHealth = GameState.playerHealth || maxHealth;

    this.container.innerHTML = "";
    for (let i = 0; i < maxHealth; i++) {
      const heart = document.createElement("img");
      if (i < currentHealth) {
        heart.src = "assets/heart_kenney/heart_full.png";
      } else {
        heart.src = "assets/heart_kenney/heart_empty.png";
      }
      this.container.appendChild(heart);
    }

    this.container.classList.add("visible");
  }
}