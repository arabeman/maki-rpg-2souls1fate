import { Act1Scene, Act2Scene, Act3Scene, BeginScene } from "./scenes/index.js";

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
    arcade: { debug: false },
  },
  scene: [BeginScene, Act1Scene, Act2Scene, Act3Scene],
  render: {
    pixelArt: true,
  },
});
