import { Scene, manager } from "@tialops/maki";

import { BattleController } from "../core/BattleController.js";
import { Dialog } from "../components/Dialog.js";
import { Equipment } from "../core/Equipment.js";
import { GameState } from "../data/dialogs.js";
import { Inventory } from "../core/Inventory.js";
import { PlayerController } from "../core/PlayerController.js";
import { SpriteLoader } from "../core/SpriteLoader.js";

class Act1Scene extends Scene {
  constructor() {
    super({ key: "Act1Scene" });
  }

  init() {
    this.scale.resize(640, 448);
    this.cameras.main.setZoom(1.5);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    SpriteLoader.loadImage(this, "sword_pickup", "sword1");
    SpriteLoader.loadImage(this, "attack", "attack");
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

    if (GameState.hasSword) {
      const swordItem = Inventory.items.find(i => i.id === "sword");
      if (swordItem) {
        Equipment.equip(this, this.player, swordItem);
      }
    }

    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.setBounds(0, 0, 640, 448);

    this.cameras.main.fadeIn(500);

    BattleController.setup(this, this.player);
  }

  update(time) {
    if (!Dialog.isOpen()) {
      PlayerController.handleMovement(this.player, this.keys);
      PlayerController.handleAnimation(this.player, this.keys, time);
      BattleController.attack(this, this.player, this.keys);
    }
    Equipment.update(this, this.player);
    Dialog.update(time);
  }
}

export { Act1Scene };