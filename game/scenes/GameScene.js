import { Scene, manager } from "@tialops/maki";

import { PlayerController } from "../utils/PlayerController.js";
import { SpriteLoader } from "../utils/SpriteLoader.js";

export default class GameScene extends Scene {
  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    manager.map(this, "begin");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.player = PlayerController.create(this, 152, 152, "player");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    this.physics.add.collider(this.player, manager.getWallGroup(this, "begin"));
  }

  update(time) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
  }
}
