import config from "../maki.config.js";

/**
 * SpriteLoader - Handles loading and animating sprites from configuration
 *
 * Load sprites from maki.config.js sprites array and create animations
 * based on direction config.
 */
export class SpriteLoader {
  /**
   * Load a spritesheet for a sprite
   * @param {Phaser.Scene} scene - The scene to load into
   * @param {string} name - Asset key name
   * @param {string} configName - Name in maki.config sprites array
   */
  static load(scene, name, configName) {
    const spriteConfig = config.sprites.find((s) => s && s.name === configName);
    if (!spriteConfig) return;

    scene.load.spritesheet(name, `assets/${spriteConfig.file}`, {
      frameWidth: spriteConfig.frameWidth,
      frameHeight: spriteConfig.frameHeight,
    });
  }

  /**
   * Load a single image
   * @param {Phaser.Scene} scene - The scene to load into
   * @param {string} name - Asset key name (use in scene.add.image)
   * @param {string} configName - Name in maki.config emotes array
   */
  static loadImage(scene, name, configName) {
    const emoteConfig = config.emotes.find((e) => e && e.name === configName);
    if (!emoteConfig) return;

    scene.load.image(name, `assets/${emoteConfig.file}`);
  }

  /**
   * Create animations for a sprite based on config directions
   * @param {Phaser.Scene} scene - The scene to create anims in
   * @param {string} name - Sprite name for animation keys
   * @param {string} configName - Name in maki.config sprites array
   */
  static createAnims(scene, name, configName) {
    const spriteConfig = config.sprites.find((s) => s && s.name === configName);
    if (!spriteConfig) return;

    Object.entries(spriteConfig.directions).forEach(([dir, { start, end }]) => {
      const animKey = `${name}-${dir}`;
      if (scene.anims.exists(animKey)) return;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(name, { start, end }),
        frameRate: 8,
        repeat: -1,
      });
    });
  }
}
