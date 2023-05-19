import Phaser from 'phaser';

import logoImg from '../assets/logo.png';
import sky from '../assets/sky.png';
import yans from '../assets/yans.png';
import wall from '../assets/wall.png';
import hunter from '../assets/hunter.png';
import ji from '../assets/ji.png';
import map1 from '../assets/map1.png';
import map2 from '../assets/map2.png';
import health from '../assets/health.png';
import eliteHunter from '../assets/eliteHunter.png';
import dagger from '../assets/dagger.png';
var player;
var joystick;
var hunters;
var eliteHunters;
var healthProps;
var wallGroups;
var liveTime = 0;
var liveTimeText;
var hp = 5;
var hpText;
var hunterTimer;
var liveTimer;
var hunterSpeed = 0.06;
var arms;
var container;
export default class playScene extends Phaser.Scene
{
    constructor ()
    {
        super();
    }
    preload ()
    {
        console.log('PlayScene')
        this.load.image('logo', logoImg);
        this.load.image('sky',sky);
        this.load.image('yans',yans);
        // this.load.spritesheet('yans','./assets/yans.png', {frameWidth: 32, frameHeight: 32})
        this.load.image('wall',wall);
        this.load.image('hunter',hunter);
        this.load.image('ji',ji);
        this.load.image('map1',map1);
        this.load.image('map2',map2);
        this.load.image('eliteHunter',eliteHunter);
        this.load.image('health',health);
        this.load.image('dagger',dagger);
    }

    create ()
    {
        var mapProbability =  Phaser.Math.Between(0,1)
        if (mapProbability === 0) {
            this.add.image(450,400,'map1').setScale(1.05)
        } else if (mapProbability === 1) {
            this.add.image(450,430,'map2').setScale(2.35)
        }
        //游戏小提示
        this.add.text(40,1050,'Tips: 撞到怪物后,怪物会反弹一秒,注意躲避!',{fontSize: '30px'})
        //墙
        wallGroups = this.physics.add.staticGroup();
        //墙组
        wallGroups.create(400,1020,'wall').setScale(1.2)
        //玩家
        player = this.physics.add.sprite(450,450,'yans').setScale(0.05,0.05)
        player.setBounce(0.1)
        player.setCollideWorldBounds(true)
        //剑
        arms = this.physics.add.sprite(player.x + 60,player.y,'dagger').setScale(0.3,0.3);

        //怪物
        hunters = this.physics.add.group()
        eliteHunters = this.physics.add.group()
        healthProps = this.physics.add.group()
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
        this.physics.add.collider(eliteHunters,hunters)
        this.physics.add.collider(eliteHunters,eliteHunters)
        //生存时间计时
        liveTimer = this.time.addEvent({
            delay: 1000,
            callback: this.liveTime,
            loop: true
        })
        //生存时间文本
        liveTimeText = this.add.text(40,900,'生存时间: 0',{fontSize: '32px', fill: '#000'})
        liveTimeText.setColor('#FF9900')
        //血量文本
        hpText = this.add.text(40,110,'生命: ' + hp,{fontSize: '36px', fill: '#000'})
        hpText.setColor('#62ff62')
        //生成道具计时器
        liveTimer = this.time.addEvent({
            delay: 25000,
            callback: this.createHealthProp,
            loop: true
        })
        //判断人物与怪物的接触
        this.physics.add.collider(player,hunters,this.playerDead,null,this)
        this.physics.add.collider(player,eliteHunters,this.playerDead,null,this)
        //判断人物与回血道具的接触
        this.physics.add.overlap(player,healthProps,this.healthUp,null,this)
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
        //普通怪物追逐行为
        hunters.getChildren().forEach(function (hunter) {
            // 计算怪物与角色之间的方向向量
            var direction = new Phaser.Math.Vector2(player.x - hunter.x, player.y - hunter.y);
            direction.normalize(); // 归一化向量，使其长度为 1
            var speed = hunterSpeed; // 设置怪物的移动速度
            // 根据方向向量和速度更新怪物的位置
            hunter.x += direction.x * speed * delta;
            hunter.y += direction.y * speed * delta;
        })
        //精英怪物追逐行为
        eliteHunters.getChildren().forEach(function (eliteHunter) {
            // 计算怪物与角色之间的方向向量
            var direction = new Phaser.Math.Vector2(player.x - eliteHunter.x, player.y - eliteHunter.y);
            direction.normalize(); // 归一化向量，使其长度为 1
            var speed = 0.10; // 设置怪物的移动速度
            // 根据方向向量和速度更新怪物的位置
            eliteHunter.x += direction.x * speed * delta;
            eliteHunter.y += direction.y * speed * delta;
        })
        arms.x = player.x + 50;
        arms.y = player.y;
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
        var hunter;
        //隔20秒生成一个精英怪
        if ((liveTime >= 21 && liveTime <= 25) ||
            (liveTime >= 42 && liveTime <= 46) ||
            (liveTime >= 63 && liveTime <= 67) ||
            (liveTime >= 84 && liveTime <= 88) ||
            (liveTime >= 105 && liveTime <= 109)){
            hunter = eliteHunters.create(x,y, 'eliteHunter').setScale(0.2);
        } else {
            hunter = hunters.create(x,y, 'hunter').setScale(0.06);
        }
        //怪物反弹量
        hunter.setBounce(0.2)
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
        if (liveTimer === 50) {
            hunterSpeed += 0.05;
        } else if (liveTimer === 100) {
            hunterSpeed += 0.05;
        }
    }

    playerDead(player,hunter) {
        if (hp <= 1) {
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
            var endText = this.add.text(320, 600,'生存时间： ' + liveTime + ' !!',{fontSize: '32px', fill: '#000'});
            endText.setColor('#ff1d1d')
            liveTime = 0;
        } else {
            //停活被碰撞怪物
            hunter.disableBody(true,true)
            hp = hp - 1;
            hpText.setText('生命: ' + hp)
            //设置血量显示颜色
            hpText.setColor('#ff0000');
            this.time.delayedCall(1500,function (){
                //恢复原来颜色
                hpText.setColor('#62ff62')
            })
        }
    }

    healthUp(player,health) {
        //停活被碰撞道具
        health.disableBody(true,true)
        hp = hp + 3;
        hpText.setText('生命: ' + hp)
        //设置血量显示颜色
        hpText.setColor('#ffda2c');
        this.time.delayedCall(1500,function (){
            //恢复原来颜色
            hpText.setColor('#62ff62')
        })
    }

    createHealthProp() {
        var x = Phaser.Math.Between(20,880);
        var y = Phaser.Math.Between(20,980);
        var healths = healthProps.create(x,y, 'health').setScale(0.2);
        healths.setBounce(0);
    }

}
