// maki.config.js — developer's single config file
export default {
  width: 800, // game canvas width in px — editor canvas matches this
  height: 600, // game canvas height in px — editor canvas matches this
  maps: ["begin"],
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
    {
      name: "sword",
      file: "tiles_kenney/sword1.png",
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
  emotes: [
    { name: "exclamation", file: "emotes_kenney/emote_exclamation.png" },
    { name: "question", file: "emotes_kenney/emote_question.png" },
    { name: "heart", file: "emotes_kenney/emote_heart.png" },
    { name: "stars", file: "emotes_kenney/emote_stars.png" },
    { name: "drop", file: "emotes_kenney/emote_drop.png" },
    { name: "music", file: "emotes_kenney/emote_music.png" },
    { name: "anger", file: "emotes_kenney/emote_anger.png" },
    { name: "dots", file: "emotes_kenney/emote_dots1.png" },
    { name: "sword1", file: "tiles_kenney/sword1.png" },
    { name: "attack", file: "tiles_kenney/tile_0060.png" },
  ],
};
