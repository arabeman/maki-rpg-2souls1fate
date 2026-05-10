import { Act1Scene, Act2Scene, Act3Scene, BeginScene } from "./scenes/index.js";
import { Persistence } from "./core/Persistence.js";

import Phaser from "phaser";

Persistence.hydrateRuntimeState();

const sceneByKey = {
  BeginScene,
  Act1Scene,
  Act2Scene,
  Act3Scene,
};

const savedSceneKey = Persistence.getSavedSceneKey();
const initialScene = sceneByKey[savedSceneKey] || BeginScene;
const sceneOrder = [initialScene, BeginScene, Act1Scene, Act2Scene, Act3Scene].filter(
  (scene, index, arr) => arr.indexOf(scene) === index,
);

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
  scene: sceneOrder,
  render: {
    pixelArt: true,
  },
});
