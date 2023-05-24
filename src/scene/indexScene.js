import Phaser from 'phaser';
import playScene from "./playScene";
import start from '../assets/start.png'
import backGround from '../assets/indexBackGround.png'

var startGames = false;
export default class indexScene extends Phaser.Scene
{
    constructor ()
    {
        super();
    }
    preload ()
    {
        console.log('indexScene')
        this.load.image('backGround',backGround);
        this.load.spritesheet('start', start, { frameWidth: 64, frameHeight: 64 });
        this.scene.add('playScene', playScene,false)
    }

    create ()
    {
        //背景
        this.add.image(450,500,'backGround').setScale(3)
        //游戏名称
        var gameName = this.add.text(150,250,'To Live On', { fontFamily: 'Arial', fontSize: '128px'})
        var authorName = this.add.text(720,20,'Author:Yans', { fontFamily: 'Arial', fontSize: '32px'})
        //开始按钮动画
        this.anims.create({
            key: 'startAnims',
            frames: this.anims.generateFrameNumbers('start',{start: 0,end: 3}),
            frameRate: 20,
            repeat: -1
        })
        //开始按钮
        var startButton = this.physics.add.sprite(450,1240,'start')
            .setScale(4)
            .setInteractive()
            .on('pointerdown',() => {
                this.startGames()
            })
        startButton.anims.play('startAnims',true)
        //文本
        var inputText = this.add.text(450,1000,'点击这里输入你的昵称,加入排行榜', { fontFamily: 'Arial', fontSize: '38px'})
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', function () {
                // var input = prompt('输入你的昵称(请不要输入恶意,包含政治,等不当词汇,若违反则封禁设备ID)');
                var input = prompt('暂未开启排行榜功能！可以直接开始游戏,排行榜后续会开放');
                if (input !== null) {
                    inputText.text = '欢迎你: ' + input;
            }
        });
        var inputText2 = this.add.text(170,1080,'或者,直接开始游戏👇', { fontFamily: 'Arial', fontSize: '38px'})
        inputText.setColor('#000000')
        inputText2.setColor('#000000')
    }

    startGames () {
        console.log('开始')
        this.scene.start('playScene')
    }

}