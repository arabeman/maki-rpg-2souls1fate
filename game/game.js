import GameScene from './scenes/GameScene.js'
import Phaser from 'phaser'

new Phaser.Game({
    type: Phaser.AUTO,
    width: 288,
    height: 288,
    scale: {
        zoom: 2
    },
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [GameScene]
})
