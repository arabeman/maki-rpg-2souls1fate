import { Scene, manager } from "@tialops/maki";

import { NPCController } from "../utils/NPCController.js";
import { PlayerController } from "../utils/PlayerController.js";
import { SpriteLoader } from "../utils/SpriteLoader.js";

// add dad in the map
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
    this.dad = NPCController.create(this, 16*4.5, 16*5.5, "dad");
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    SpriteLoader.createAnims(this, "dad", "dad");
    this.physics.add.collider(this.player, manager.getWallGroup(this, "begin"));
    this.physics.add.collider(this.dad, manager.getWallGroup(this, "begin"));
  }

  update(time) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
    NPCController.handleAnimation(this.dad, time);
  }
}
