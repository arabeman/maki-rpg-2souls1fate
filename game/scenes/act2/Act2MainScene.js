import { Scene, manager } from "@tialops/maki";
import { Equipment } from "../../core/Equipment.js";
import { GameState } from "../../data/dialogs.js";
import { Inventory } from "../../core/Inventory.js";
import { PlayerController } from "../../core/PlayerController.js";
import { SpriteLoader } from "../../core/SpriteLoader.js";

const ACT2_TILE_SIZE = 16;
const ACT2_MAP_WIDTH_TILES = 45;
const ACT2_MAP_HEIGHT_TILES = 34;
const ACT2_MAP_WIDTH = ACT2_MAP_WIDTH_TILES * ACT2_TILE_SIZE;
const ACT2_MAP_HEIGHT = ACT2_MAP_HEIGHT_TILES * ACT2_TILE_SIZE;
const ACT2_VIEWPORT_WIDTH = 640;
const ACT2_VIEWPORT_HEIGHT = 448;

class Act2Scene extends Scene {
  constructor() {
    super({ key: "Act2Scene" });
  }

  init() {
    this.scale.resize(ACT2_VIEWPORT_WIDTH, ACT2_VIEWPORT_HEIGHT);
    this.cameras.main.setZoom(1.4);
  }

  preload() {
    super.preload();
    SpriteLoader.load(this, "player", "player");
    manager.map(this, "act_2");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.player = PlayerController.create(
      this,
      8,
      440,
      "player",
    );
    this.keys = PlayerController.setupInput(this);
    SpriteLoader.createAnims(this, "player", "player");
    this.physics.add.collider(this.player.hitbox, manager.getWallGroup(this, "act_2"));
    if (GameState.hasWeapon) {
      const weaponItem = Inventory.getLastBySlot("mainHand");
      if (weaponItem) {
        Equipment.equip(this, this.player, weaponItem);
      }
    }

    this.physics.world.setBounds(0, 0, ACT2_MAP_WIDTH, ACT2_MAP_HEIGHT);
    this.cameras.main.setBounds(0, 0, ACT2_MAP_WIDTH, ACT2_MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.03, 0.03);
    this.cameras.main.fadeIn(500);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        console.log(
          "Player pos:",
          Math.round(this.player.x),
          Math.round(this.player.y),
        );
      },
    });
  }

  update(time) {
    PlayerController.handleMovement(this.player, this.keys);
    PlayerController.handleAnimation(this.player, this.keys, time);
    Equipment.update(this, this.player);
  }
}

export { Act2Scene };
