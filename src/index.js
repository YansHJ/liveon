import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import sky from './assets/sky.png';
import yans from './assets/yans.png';
import wall from './assets/wall.png';
import hunter from './assets/hunter.png';
import ji from './assets/ji.png';
import map from './assets/map.png';
import VirtualJoyStickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'

var player;
var joystick;
var hunters;
var wallGroups;
var liveTime = 0;
var liveTimeText;
var hunterTimer;
var liveTimer;
var hunterSpeed = 0.05;
class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('logo', logoImg);
        this.load.image('sky',sky);
        this.load.image('yans',yans);
        // this.load.spritesheet('yans','./assets/yans.png', {frameWidth: 32, frameHeight: 32})
        this.load.image('wall',wall);
        this.load.image('hunter',hunter);
        this.load.image('ji',ji);
        this.load.image('map',map);
    }

    create ()
    {

        this.add.image(400,400,'map').setScale(1.05)
        wallGroups = this.physics.add.staticGroup();
        //墙组
        wallGroups.create(400,1020,'wall')
        //玩家
        player = this.physics.add.sprite(450,450,'yans').setScale(0.05,0.05)
        player.setBounce(0.1)
        player.setCollideWorldBounds(true)
        //怪物
        hunters = this.physics.add.group()
        //添加下墙碰撞
        this.physics.add.collider(player,wallGroups)
        //生成怪物的计时器
        hunterTimer = this.time.addEvent({
            delay: 3000,
            callback: this.createHunter,
            loop: true
        })
        //怪物与墙的碰撞，怪物与怪物的碰撞
        this.physics.add.collider(hunters,wallGroups)
        this.physics.add.collider(hunters,hunters)
        //生存时间计时
        liveTimer = this.time.addEvent({
            delay: 1000,
            callback: this.liveTime,
            loop: true
        })
        //生存时间文本
        liveTimeText = this.add.text(40,700,'生存时间: 0',{fontSize: '32px', fill: '#000', color: '#0xff0000'})
        //判断人物与怪物的接触
        this.physics.add.collider(player,hunters,this.playerDead,null,this)
        //摇杆
        joystick = this.plugins.get("rexVirtualJoyStick").add(this,{
            x: 450,
            y: 1200,
            radius: 100,
            base: this.add.circle(0, 0, 50, 0x888888),    // 摇杆的底座图形
            thumb: this.add.circle(0, 0, 25, 0xcccccc),   // 摇杆的拇指图形
            dir: '8dir',
            forceMin: 5,  // 摇杆的最小力量值
            enable: true   // 启用摇杆
        })
        // 监听摇杆的事件
        joystick.on('update', function () {
            // 设置角色的移动速度和方向 (根据力度大小)
            var speed = 1; // 设置适当的速度值
            //角度
            var angle = joystick.angle;
            //力度
            var force = joystick.force;
            //锁定初速度为200，去除加速的过程
            if (force !== 0) {
                force = 200;
            }
            //弧度
            var radian = Phaser.Math.DegToRad(angle);
            //三角
            var forceX = Math.cos(radian) * force;
            var forceY = Math.sin(radian) * force;
            //方向加速度
            player.setVelocityX(forceX * speed);
            player.setVelocityY(forceY * speed);

            // var speed = 1; // 设置角色的移动速度
            //
            // // 获取虚拟摇杆的角度（或弧度）
            // var angle = joystick.angle;
            // console.log(angle)
            //
            // // 根据角度计算角色在 x 和 y 轴上的移动分量
            // var moveX = Math.cos(Phaser.Math.DegToRad(angle));
            // var moveY = Math.sin(Phaser.Math.DegToRad(angle));
            //
            // // 根据移动分量和速度更新角色的位置
            // player.x += moveX * speed;
            // player.y += moveY * speed;
            // console.log('moveX : ' + moveX )
            // console.log('moveY : ' + moveY )
        });


    }
    update(time, delta) {
        super.update(time, delta);
        //怪物追逐行为
        hunters.getChildren().forEach(function (hunter) {
            // 计算怪物与角色之间的方向向量
            var direction = new Phaser.Math.Vector2(player.x - hunter.x, player.y - hunter.y);
            direction.normalize(); // 归一化向量，使其长度为 1
            var speed = hunterSpeed; // 设置怪物的移动速度
            // 根据方向向量和速度更新怪物的位置
            hunter.x += direction.x * speed * delta;
            hunter.y += direction.y * speed * delta;
        })
    }

    createHunter(){
        //随机概率使得从四个方向随机位置刷怪
        var probability = Phaser.Math.Between(0,3);
        console.log(probability)
        var x = 0;
        var y = 0
        if (probability === 0) {
            x = Phaser.Math.Between(0, 900)
            y = 20;
        } else if (probability === 1){
            x = Phaser.Math.Between(0, 900)
            y = 1000;
        } else if (probability === 2){
            y = Phaser.Math.Between(0, 1000)
            x = 20;
        } else if (probability === 3){
            y = Phaser.Math.Between(0, 1000)
            x = 900;
        }
        //初始化怪物
        var hunter = hunters.create(x,y, 'hunter').setScale(0.06);
        //怪物反弹量
        hunter.setBounce(1)
        //怪物边界碰撞
        hunter.setCollideWorldBounds(true);
        // hunter.setVelocity(Phaser.Math.Between(-200, 200), 30);
        //怪物重力关
        hunter.allowGravity = false;
    }

    liveTime() {
        //生存时间
        liveTime += 1;
        liveTimeText.setText('生存时间: ' + liveTime);
        //随生存时间，怪物移动速度增加
        if (liveTimer >= 50) {
            hunterSpeed += 0.05;
        } else if (liveTimer >= 100) {
            hunterSpeed += 0.05;
        }
    }

    playerDead() {
        //人物死亡暂停游戏
        this.physics.pause();
        //设置人物色调：红
        player.setTint(0xff0000);
        //创建结束标语
        this.add.image(450,450,'ji').setScale(1.3)
        //停止刷怪，生存计时器
        hunterTimer.paused = true;
        liveTimer.paused = true;
        //创建结束统计
        this.add.text(320, 600,'生存时间： ' + liveTime + ' !!',{fontSize: '32px', fill: '#000', color: '#0xff0000'});
        liveTime = 0;
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
    scene: MyGame,
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
    }
};

const game = new Phaser.Game(config);
