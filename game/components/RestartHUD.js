import { Persistence } from "../core/Persistence.js";

export class RestartHUD {
  static init() {
    this._injectStyles();
    this._buildDOM();
  }

  static _injectStyles() {
    if (document.getElementById("restart-hud-styles")) return;

    const style = document.createElement("style");
    style.id = "restart-hud-styles";
    style.textContent = `
      :root {
        --dialog-bg: #161010;
      }

      .restart-hud {
        position: absolute;
        bottom: 12px;
        left: 18px;
        width: 44px;
        height: 44px;
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        cursor: pointer;
        user-select: none;
        opacity: 0.2;
        transition: opacity 0.2s;
      }

      .restart-hud:hover {
        opacity: 1;
      }

      .restart-hud-panel {
        position: absolute;
        inset: 0;
        border-image-slice: 6 6 6 6 fill;
        border-image-width: 6px;
        border-style: solid;
        border-image-source: url('assets/ui_kenney/PNG/Default/Panel/panel-014.png');
        background-color: var(--dialog-bg);
        opacity: 1;
        pointer-events: none;
      }

.restart-hud img {
        position: relative;
        width: 21px;
        height: 21px;
        image-rendering: pixelated;
        z-index: 1;
        left: 1px;
      }

      .restart-hud:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }

  static _buildDOM() {
    if (this.container && this.container.isConnected) return;

    this.container = document.createElement("button");
    this.container.className = "restart-hud";
    this.container.type = "button";
    this.container.setAttribute("aria-label", "Restart game");
    this.container.title = "Restart";

    this.panel = document.createElement("div");
    this.panel.className = "restart-hud-panel";
    this.container.appendChild(this.panel);

    this.icon = document.createElement("img");
    this.icon.src = "assets/kenney/restart.png";
    this.icon.alt = "Restart";
    this.container.appendChild(this.icon);

    this.container.addEventListener("click", () => {
      Persistence.clearAll();
      const url = new URL(window.location.href);
      url.searchParams.set("newGame", "1");
      window.location.href = url.toString();
    });

    document.body.appendChild(this.container);
  }
}
