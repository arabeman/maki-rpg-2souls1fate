export class Dialog {
  static open(scene, dialogData) {
    if (!dialogData || !dialogData.length) return;

    if (this.isActive) {
      this.close();
    }

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

    this.bg = document.createElement("div");
    this.bg.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 700px;
      height: 100px;
      background: #222;
      border: 4px solid #0f0;
      font-family: "Courier New", monospace;
      font-size: 20px;
      color: #fff;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      z-index: 9999;
    `;
    document.body.appendChild(this.bg);

    this.textObj = document.createElement("div");
    this.textObj.style.cssText = `
      color: #fff;
      font-size: 18px;
      line-height: 1.4;
    `;
    this.bg.appendChild(this.textObj);

    this.skipHint = document.createElement("div");
    this.skipHint.textContent = "[E] NEXT";
    this.skipHint.style.cssText = `
      color: #0f0;
      font-size: 14px;
    `;
    this.bg.appendChild(this.skipHint);

    this.showCurrentLine();
  }

  static showCurrentLine() {
    if (this.currentIndex >= this.data.length) {
      this.close();
      return;
    }

    const line = this.data[this.currentIndex];
    this.currentText = line.text;
    this.displayedText = "";
    this.charIndex = 0;
    this.isTyping = true;
  }

  static update(time) {
    if (!this.isOpen() || !this.isTyping) return;

    if (time - this.lastCharTime > this.charDelay) {
      if (this.charIndex < this.currentText.length) {
        this.displayedText += this.currentText[this.charIndex];
        if (this.textObj) this.textObj.textContent = this.displayedText;
        this.charIndex++;
        this.lastCharTime = time;
      } else {
        this.isTyping = false;
      }
    }
  }

  static skip(time) {
    if (!this.isOpen()) return;

    if (this.isTyping) {
      this.displayedText = this.currentText;
      if (this.textObj) this.textObj.textContent = this.displayedText;
      this.isTyping = false;
    } else {
      this.next();
    }
  }

  static next() {
    if (!this.isOpen()) return;

    this.currentIndex++;

    if (this.currentIndex >= this.data.length) {
      this.close();
      return;
    }

    if (this.data[this.currentIndex].isEndOfDialog) {
      this.close();
      return;
    }

    this.showCurrentLine();
  }

  static close() {
    if (this.bg && this.bg.parentNode) {
      this.bg.parentNode.removeChild(this.bg);
    }
    this.bg = null;
    this.textObj = null;
    this.skipHint = null;
    this.isActive = false;
    this.scene = null;
    this.data = null;
  }

  static isOpen() {
    return this.isActive === true;
  }
}