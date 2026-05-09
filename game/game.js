import { Act1Scene, BeginScene } from "./scenes/index.js";

import Phaser from "phaser";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 288,
  height: 288,
  scale: {
    zoom: 2,
  },
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { debug: true },
  },
  scene: [BeginScene, Act1Scene],
  render: {
    pixelArt: true,
  },
});
