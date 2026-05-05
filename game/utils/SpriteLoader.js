import config from '../maki.config.js'

export class SpriteLoader {
    static load(scene, name, configName) {
        const spriteConfig = config.sprites.find(s => s && s.name === configName)
        if (!spriteConfig) return

        scene.load.spritesheet(name, `assets/${spriteConfig.file}`, {
            frameWidth: spriteConfig.frameWidth,
            frameHeight: spriteConfig.frameHeight
        })
    }

    static createAnims(scene, name, configName) {
        const spriteConfig = config.sprites.find(s => s && s.name === configName)
        if (!spriteConfig) return

        Object.entries(spriteConfig.directions).forEach(([dir, { start, end }]) => {
            scene.anims.create({
                key: `${name}-${dir}`,
                frames: scene.anims.generateFrameNumbers(name, { start, end }),
                frameRate: 8,
                repeat: -1
            })
        })
    }
}