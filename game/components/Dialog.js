/**
 * Dialog - HTML-based dialog system with typewriter effect
 *
 * Creates an absolute positioned dialog box overlay on the webpage.
 * Styled to match the Kenney UI panel aesthetic:
 * dark background, decorative corner borders, gold title accent.
 *
 * Long text scrolls automatically within the fixed-height box.
 * Press [E] to skip typing or advance to the next dialog entry.
 *
 * Uses Kenney panel-border assets from:
 *   assets/ui_kenney/PNG/Default/Border/panel-border-NNN.png
 *
 * Adjust KENNEY_UI_PATH below if your asset folder is located elsewhere.
 */

const KENNEY_UI_PATH = "../assets/ui_kenney/PNG/Default/Border";

export class Dialog {
  /**
   * Open dialog with given data
   * @param {Phaser.Scene} scene - Game scene reference
   * @param {Array} dialogData - Array of { text, speaker?, isEndOfDialog? }
   * @param {boolean} debug - If true, keeps dialog open for debugging
   */
  static open(scene, dialogData, debug = false) {
    if (!dialogData || !dialogData.length) return;

    if (this.isActive && !this.debug) this.close();

    this.scene = scene;
    this.data = dialogData;
    this.currentIndex = 0;
    this.isTyping = false;
    this.currentText = "";
    this.displayedText = "";
    this.charIndex = 0;
    this.lastCharTime = 0;
    this.charDelay = 30;
    this.isActive = true;
    this.debug = debug;

    this._injectStyles();
    this._buildDOM();
    this.showCurrentLine();
  }

  /**
   * Set callback to run when dialog closes
   * @param {Function} callback
   */
  static onCloseCallback(callback) {
    this.onCloseCallback = callback;
  }

  /**
   * Inject shared CSS (once per page load)
   */
  static _injectStyles() {
    if (document.getElementById("dialog-kenney-styles")) return;

    const style = document.createElement("style");
    style.id = "dialog-kenney-styles";
    style.textContent = `
      @font-face {
        font-family: 'Monocraft';
        src: url('../assets/fonts/Monocraft-ttf/Monocraft.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }

      @font-face {
        font-family: 'Monocraft';
        src: url('../assets/fonts/Monocraft-ttf/weights/Monocraft-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }

      @font-face {
        font-family: 'Monocraft';
        src: url('../assets/fonts/Monocraft-ttf/weights/Monocraft-SemiBold.ttf') format('truetype');
        font-weight: 600;
        font-style: normal;
      }

      .dialog-kenney-wrap {
        position: absolute;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        width: 680px;
        height: 110px;
        z-index: 9999;
        border-image-slice: 18 18 18 18 fill;
        border-image-width: 18px;
        border-style: solid;
        border-image-source: url('${KENNEY_UI_PATH}/panel-border-010.png');
        background-color: rgba(10, 12, 18, 0.97);
        padding: 14px 20px 12px 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow: hidden;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(180,180,160,0.08);
      }

      .dialog-kenney-speaker {
        font-family: 'Monocraft', monospace;
        font-size: 14px;
        font-weight: 600;
        color: #d4b84a;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-align: left;
        line-height: 1;
        flex-shrink: 0;
      }

      .dialog-kenney-text {
        font-family: 'Monocraft', monospace;
        font-size: 14px;
        font-weight: 600;
        color: #ddd8cc;
        line-height: 1.5;
        text-align: left;
        flex: 1;
        overflow-y: auto;
        word-break: break-word;
        white-space: pre-wrap;
        max-height: 90px;
        scrollbar-width: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-smooth: always;
      }

      .dialog-kenney-text::-webkit-scrollbar {
        display: none;
      }

      .dialog-kenney-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-shrink: 0;
      }

      .dialog-kenney-hint {
        font-family: 'Monocraft', monospace;
        font-size: 10px;
        color: #888070;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dialog-kenney-hint::before {
        content: '';
        display: inline-block;
        width: 7px;
        height: 12px;
        background: #888070;
        animation: dialog-blink 1s step-end infinite;
      }

      .dialog-kenney-hint.typing::before {
        animation: none;
        opacity: 0;
      }

      @keyframes dialog-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Build the DOM elements
   */
  static _buildDOM() {
    this.bg = document.createElement("div");
    this.bg.className = "dialog-kenney-wrap";

    // Speaker / title row (hidden when no speaker)
    this.speakerObj = document.createElement("div");
    this.speakerObj.className = "dialog-kenney-speaker";
    this.speakerObj.style.display = "none";
    this.bg.appendChild(this.speakerObj);

    // Main text area
    this.textObj = document.createElement("div");
    this.textObj.className = "dialog-kenney-text";
    this.bg.appendChild(this.textObj);

    // Footer with skip/continue hint
    const footer = document.createElement("div");
    footer.className = "dialog-kenney-footer";

    this.skipHint = document.createElement("div");
    this.skipHint.className = "dialog-kenney-hint typing";
    this.skipHint.textContent = "E to skip";
    footer.appendChild(this.skipHint);

    this.bg.appendChild(footer);
    document.body.appendChild(this.bg);
  }

  /**
   * Display current dialog entry: start typing.
   */
  static showCurrentLine() {
    if (this.currentIndex >= this.data.length) {
      this.close();
      return;
    }

    const line = this.data[this.currentIndex];

    // Speaker label
    if (line.speaker && this.speakerObj) {
      this.speakerObj.textContent = line.speaker;
      this.speakerObj.style.display = "block";
    } else if (this.speakerObj) {
      this.speakerObj.style.display = "none";
    }

    this.currentText = line.text;
    this.displayedText = "";
    this.charIndex = 0;
    this.isTyping = true;

    if (this.textObj) this.textObj.textContent = "";

    if (this.skipHint) {
      this.skipHint.classList.add("typing");
      this.skipHint.textContent = "E to skip";
    }
  }

  /**
   * Update typewriter effect — call every frame in scene.update()
   * @param {number} time - Current game time from scene.update()
   */
  static update(time) {
    if (!this.isOpen() || !this.isTyping) return;

    if (time - this.lastCharTime > this.charDelay) {
      if (this.charIndex < this.currentText.length) {
        this.displayedText += this.currentText[this.charIndex];
        if (this.textObj) {
          this.textObj.textContent = this.displayedText;
          this.textObj.scrollTop = this.textObj.scrollHeight;
        }
        this.charIndex++;
        this.lastCharTime = time;
      } else {
        this.isTyping = false;
        if (this.skipHint) {
          this.skipHint.classList.remove("typing");
          this.skipHint.textContent = "E to continue";
        }
      }
    }
  }

  /**
   * Skip typing or advance to next dialog entry.
   * @param {number} time - Current game time
   */
  static skip(time) {
    if (!this.isOpen()) return;

    if (this.isTyping) {
      this.displayedText = this.currentText;
      if (this.textObj) {
        this.textObj.textContent = this.displayedText;
        this.textObj.scrollTop = this.textObj.scrollHeight;
      }
      this.isTyping = false;
      if (this.skipHint) {
        this.skipHint.classList.remove("typing");
        this.skipHint.textContent = "E to continue";
      }
    } else {
      this.next();
    }
  }

  /**
   * Advance to next dialog entry.
   */
  static next() {
    if (!this.isOpen()) return;

    this.currentIndex++;

    if (this.currentIndex >= this.data.length) {
      if (this.debug) {
        this.currentIndex = 0;
      } else {
        this.close();
      }
      return;
    }

    if (this.data[this.currentIndex].isEndOfDialog) {
      if (!this.debug) {
        this.close();
      } else {
        this.currentIndex = 0;
      }
      return;
    }

    this.showCurrentLine();
  }

  /**
   * Close dialog and clean up DOM elements
   */
  static close() {
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }

    if (this.bg && this.bg.parentNode) {
      this.bg.parentNode.removeChild(this.bg);
    }

    this.bg = null;
    this.textObj = null;
    this.speakerObj = null;
    this.skipHint = null;
    this.isActive = false;
    this.debug = false;
    this.scene = null;
    this.data = null;
  }

  /**
   * Check if dialog is currently open
   * @returns {boolean}
   */
  static isOpen() {
    return this.isActive === true;
  }
}
