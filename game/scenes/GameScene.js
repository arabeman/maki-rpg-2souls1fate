import { Scene, manager } from "@tialops/maki";

import { NPCController } from "../utils/NPCController.js";
import { PlayerController } from "../utils/PlayerController.js";
import { SpriteLoader } from "../utils/SpriteLoader.js";
import { Dialog } from "../utils/Dialog.js";

const dadDialog = [
  { text: "Hello world!", isEndOfDialog: true },
];

export default class GameScene extends Scene {
  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.load(this, "dad", "dad");
    manager.map(this, "begin");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.player = PlayerController.create(this, 152, 152, "player");
    this.dad = NPCController.create(this, 16*16.5, 16*9, "dad");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "dad", "dad");
    this.physics.add.collider(this.player, manager.getWallGroup(this, "begin"));
    this.physics.add.collider(this.dad, manager.getWallGroup(this, "begin"));
    this.dad.body.setImmovable(true);
    this.physics.add.collider(this.player, this.dad);
  }

  update(time) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
    NPCController.handleAnimation(this.dad, time);
    Dialog.update(time);

    if (!this.ePressed && this.keys.e.isDown) {
      this.ePressed = true;
      this.handleNPCTalk();
    }
    if (!this.keys.e.isDown) {
      this.ePressed = false;
    }
  }

  handleNPCTalk() {
    const dx = this.player.x - this.dad.x;
    const dy = this.player.y - this.dad.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      if (Dialog.isOpen()) {
        Dialog.next();
      } else {
        Dialog.open(this, dadDialog);
      }
    }
  }
}
