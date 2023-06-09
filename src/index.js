import Phaser from 'phaser';
import indexScene from './scene/indexScene.js'
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'
class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }
    preload ()
    {
        this.scene.add('indexScene', indexScene,false)
    }
    create ()
    {

        console.log('MyGame')
        this.scene.start('indexScene')
    }
    update(time, delta) {

    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 900,
    height: 1400,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
        global: [{
            key: 'rexVirtualJoyStick',
            plugin: VirtualJoyStickPlugin,
            start: true
        }]
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
