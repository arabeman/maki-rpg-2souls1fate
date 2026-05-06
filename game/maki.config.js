// maki.config.js — developer's single config file
export default {
  width: 800, // game canvas width in px — editor canvas matches this
  height: 600, // game canvas height in px — editor canvas matches this
  maps: ["begin"],
  // add dad.png inside the sprites
  sprites: [
    {
      name: "player",
      file: "tiles_kenney/player.png",
      frameWidth: 16,
      frameHeight: 16,
      directions: {
        down: { start: 0, end: 0 },
        left: { start: 0, end: 0 },
        right: { start: 0, end: 0 },
        up: { start: 0, end: 0 },
      },
    },
    {
      name: "dad",
      file: "tiles_kenney/dad.png",
      frameWidth: 16,
      frameHeight: 16,
      directions: {
        down: { start: 0, end: 0 },
        left: { start: 0, end: 0 },
        right: { start: 0, end: 0 },
        up: { start: 0, end: 0 },
      },
    },
    "tilemap_packed",
  ],
};
