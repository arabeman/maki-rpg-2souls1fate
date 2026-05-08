import { Scene, manager } from "@tialops/maki";

class Act1Scene extends Scene {
  constructor() {
    super({ key: "Act1Scene" });
  }

  init() {
    this.scale.resize(640, 448);
  }

  preload() {
    super.preload();
    manager.map(this, "act_1");
    manager.preload(this);
  }

  create() {
    super.create();
    manager.create(this);
  }

  update(time) {
  }
}

export { Act1Scene };