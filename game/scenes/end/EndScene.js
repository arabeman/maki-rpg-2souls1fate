import { Scene, manager } from "@tialops/maki";
import { Dialog } from "../../components/Dialog.js";
import { heroChoiceMadeDialog } from "../../data/dialogs.js";

class EndScene extends Scene {
  constructor() {
    super({ key: "EndScene" });
    
    // Set window reference for dialog callbacks
    window.currentEndScene = this;
  }

  preload() {
    super.preload();
  }

  create() {
    super.create();
    manager.create(this);

    // Fade in
    this.cameras.main.fadeIn(500);

    // Show dialog after fade in
    this.time.delayedCall(1000, () => {
      Dialog.open(this, heroChoiceMadeDialog);
    });
  }

  update() {
    Dialog.update();
  }
}

export { EndScene };
