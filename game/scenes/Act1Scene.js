import { Scene } from "@tialops/maki";

export default class Act1Scene extends Scene {
  preload() {
    super.preload();
  }

  create() {
    super.create();
    this.cameras.main.fadeIn(1000);
  }

  update(time) {
  }
}