export class Dialog {
  static open(scene, dialogData) {
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

    if (this.container) this.container.destroy();

    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setVisible(true);

    this.bg = scene.add.rectangle(400, 520, 760, 140, 0x000000, 0.9);
    this.bg.setStrokeStyle(2, 0xffffff);
    this.container.add(this.bg);

    this.textObj = scene.add.text(30, 470, "", {
      fontFamily: '"Press Start 2P"',
      fontSize: 12,
      color: "#ffffff",
      wordWrap: { width: 740 },
    });
    this.container.add(this.textObj);

    this.skipHint = scene.add.text(650, 540, "PRESS SPACE", {
      fontFamily: '"Press Start 2P"',
      fontSize: 8,
      color: "#888888",
    });
    this.container.add(this.skipHint);

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
        this.textObj.setText(this.displayedText);
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
      this.textObj.setText(this.displayedText);
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
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isActive = false;
    this.scene = null;
    this.data = null;
  }

  static isOpen() {
    return this.isActive === true;
  }
}