import { Scene, manager } from "@tialops/maki";

class Act2Scene extends Scene {
  constructor() {
    super({ key: "Act2Scene" });
  }

  init() {
    this.scale.resize(640, 448);
    this.cameras.main.setZoom(1.4);
  }

  preload() {
    super.preload();
    manager.map(this, "act_2");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);

    this.physics.world.setBounds(0, 0, 640, 448);
    this.cameras.main.setBounds(0, 0, 640, 448);
    this.cameras.main.fadeIn(500);
  }
}

export { Act2Scene };
