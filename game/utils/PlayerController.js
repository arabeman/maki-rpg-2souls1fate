export class PlayerController {
    static create(scene, x, y, name) {
        const player = scene.physics.add.sprite(x, y, name)
        player.setDepth(100)
        return player
    }

    static setupInput(scene) {
        return scene.input.keyboard.createCursorKeys()
    }

    static handleMovement(player, keys, speed = 160) {
        player.setVelocity(0)

        const movements = [
            { key: 'left',  vel: { x: -speed, y: 0 }, anim: 'left' },
            { key: 'right', vel: { x: speed, y: 0 },  anim: 'right' },
            { key: 'up',    vel: { x: 0, y: -speed }, anim: 'up' },
            { key: 'down', vel: { x: 0, y: speed },  anim: 'down' }
        ]

        for (const { key, vel, anim } of movements) {
            if (keys[key].isDown) {
                player.setVelocity(vel.x, vel.y)
                player.anims.play(`player-${anim}`, true)
                return
            }
        }

        player.anims.stop()
    }
}