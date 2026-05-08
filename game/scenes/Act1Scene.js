import { Scene, manager } from "@tialops/maki";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";
import { Dialog } from "../components/Dialog.js";

class Act1Scene extends Scene {
  constructor() {
    super({ key: "Act1Scene" });
  }

  init() {
    this.scale.resize(640, 448);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    manager.map(this, "act_1");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.player = PlayerController.create(this, 16, 128, "player");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");

    this.physics.add.collider(this.player, manager.getWallGroup(this, "act_1"));

    this.cameras.main.fadeIn(500);
  }

  update(time) {
    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
    }
    console.log(`Player position: x=${this.player.x.toFixed(1)}, y=${this.player.y.toFixed(1)}`);
    Dialog.update(time);
  }
}

export { Act1Scene };