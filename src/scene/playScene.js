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
var baseDamage = 1;
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
        // this.load.image('yans',yans);
        this.load.spritesheet('yans',yans, {frameWidth: 48, frameHeight: 48})
        this.load.image('wall',wall);
        // this.load.image('hunter',hunter);
        this.load.spritesheet('hunter', hunter, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('eliteHunter', eliteHunter, { frameWidth: 64, frameHeight: 64 });
        this.load.image('ji',ji);
        this.load.image('map1',map1);
        this.load.image('map2',map2);
        this.load.image('health',health);
        this.load.image('dagger',dagger);
    }

    create ()
    {
        //随机选取地图
        var mapProbability =  Phaser.Math.Between(0,1)
        if (mapProbability === 0) {
            this.add.image(450,400,'map1').setScale(1.05)
        } else if (mapProbability === 1) {
            this.add.image(450,430,'map2').setScale(2.35)
        }
        //游戏小提示文本
        this.add.text(40,1050,'Tips: 当前仍处于早期开发阶段,如有好的建议和想法欢迎提出',{fontSize: '30px'})
        //墙
        wallGroups = this.physics.add.staticGroup();
        //墙组
        wallGroups.create(400,1020,'wall').setScale(1.2)
        //玩家
        player = this.physics.add.sprite(450,450,'yans').setScale(1.7,1.7)
        player.setBounce(0.1)
        player.setCollideWorldBounds(true)
        //剑
        // arms = this.physics.add.sprite(player.x + 60,player.y,'dagger').setScale(0.3,0.3);
        //怪物
        hunters = this.physics.add.group()
        eliteHunters = this.physics.add.group()
        //加血道具
        healthProps = this.physics.add.group()
        //创建动画
        this.createAnim()
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
            //锁定初速度为200，去除加速度的过程
            if (force !== 0) {
                force = 200;
            }
            //转化为弧度
            var radian = Phaser.Math.DegToRad(angle);
            // console.log('弧度：' + radian)
            //根据不同的摇杆方向加载不同的人物动画
            if (radian >= -2.5 && radian <= -0.5) {
                player.anims.play('playerUp')
            } else if (radian > -0.5 && radian <= 0.5 && radian !== 0) {
                player.anims.play('playerRight')
            } else if (radian >= 2.5 || radian < -2.5) {
                player.anims.play('playerLeft')
            } else {
                player.anims.play('playerDown')
            }
            //三角函数
            var forceX = Math.cos(radian) * force;
            var forceY = Math.sin(radian) * force;
            //方向加速度
            player.setVelocityX(forceX * speed);
            player.setVelocityY(forceY * speed);
        });


    }

    /**
     * 更新
     * @param time
     * @param delta
     */
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
            //防止重叠算法
            hunters.getChildren().forEach(function (hunter2) {
                var b = Phaser.Geom.Intersects.RectangleToRectangle(hunter.getBounds(),hunter2.getBounds());
                if (hunter2 !== hunter && b) {
                    if (hunter.x > hunter2.x) {
                        hunter.x = hunter.x + 0.1;
                    } else  {
                        hunter.x = hunter.x - 0.1;
                    }
                    if (hunter.y > hunter2.y) {
                        hunter.y = hunter.y + 0.1;
                    } else  {
                        hunter.y = hunter.y - 0.1;
                    }
                }
            })
        })
        //精英怪物追逐行为
        eliteHunters.getChildren().forEach(function (eliteHunter) {
            // 计算怪物与角色之间的方向向量
            var direction = new Phaser.Math.Vector2(player.x - eliteHunter.x, player.y - eliteHunter.y);
            direction.normalize(); // 归一化向量，使其长度为 1
            var speed = 0.15; // 设置怪物的移动速度
            // 根据方向向量和速度更新怪物的位置
            eliteHunter.x += direction.x * speed * delta;
            eliteHunter.y += direction.y * speed * delta;
        })
        // arms.x = player.x + 50;
        // arms.y = player.y;
    }

    /**
     * 随时间推移生成怪物
     */
    createHunter(){
        //限定最大怪物数量100
        if (hunters.getLength() <= 100) {
            //随机概率使得从四个方向随机位置刷怪
            var probability = Phaser.Math.Between(0,3);
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
                hunter = eliteHunters.create(x,y, 'eliteHunter').setScale(1.7);
                hunter.anims.play('eliteHunterAnims')
                hunter.setSize(15,29)
            } else {
                hunter = hunters.create(x,y, 'hunter').setScale(1.7);
                hunter.anims.play('hunterAnims')
                hunter.setSize(15,29)

            }
            //怪物反弹量
            // hunter.setBounce(0.2)
            //怪物边界碰撞
            hunter.setCollideWorldBounds(true);
            // hunter.setVelocity(Phaser.Math.Between(-200, 200), 30);
            //怪物重力关
            hunter.allowGravity = false;
        }
    }

    /**
     * 生存时间
     */
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

    /**
     * 碰到怪物扣血，或者死亡逻辑判定
     * @param player
     * @param hunter
     */
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
            var restart = this.add.text(320, 800,'重新开始',{fontSize: '64px'})
                .setInteractive()
                .on('pointerdown',() => {
                    hp = 5
                    this.scene.restart()
                })
        } else {
            //停活被碰撞怪物
            hunter.disableBody(true,true)
            hunters.remove(hunter,true)
            eliteHunters.remove(hunter,true)
            hp = hp - baseDamage;
            hpText.setText('生命: ' + hp)
            //设置血量显示颜色
            hpText.setColor('#ff0000');
            this.time.delayedCall(1500,function (){
                //恢复原来颜色
                hpText.setColor('#62ff62')
            })
        }
    }

    /**
     * 加血道具判定
     * @param player
     * @param health
     */
    healthUp(player,health) {
        //停活被碰撞道具
        // health.disableBody(true,true)
        healthProps.remove(health,true)
        hp = hp + 3;
        hpText.setText('生命: ' + hp)
        //设置血量显示颜色
        hpText.setColor('#ffda2c');
        this.time.delayedCall(1500,function (){
            //恢复原来颜色
            hpText.setColor('#62ff62')
        })
    }

    /**
     * 随机生成加血道具
     */
    createHealthProp() {
        var x = Phaser.Math.Between(20,880);
        var y = Phaser.Math.Between(20,980);
        var healths = healthProps.create(x,y, 'health').setScale(0.2);
        healths.setBounce(0);
    }

    /**
     * 创建动画
     */
    createAnim() {
        //人物动画
        this.anims.create({
            key: 'playerDown',
            frames: this.anims.generateFrameNumbers('yans',{start: 0,end: 2}),
            frameRate: 30,
            repeat: 0
        })
        this.anims.create({
            key: 'playerLeft',
            frames: this.anims.generateFrameNumbers('yans',{start: 3,end: 5}),
            frameRate: 30,
            repeat: -1
        })
        this.anims.create({
            key: 'playerRight',
            frames: this.anims.generateFrameNumbers('yans',{start: 6,end: 8}),
            frameRate: 30,
            repeat: -1
        })
        this.anims.create({
            key: 'playerUp',
            frames: this.anims.generateFrameNumbers('yans',{start: 9,end: 11}),
            frameRate: 30,
            repeat: -1
        })
        //怪物动画
        this.anims.create({
            key: 'hunterAnims',
            frames: this.anims.generateFrameNumbers('hunter',{start: 0,end: 4}),
            frameRate: 16,
            repeat: -1
        })
        //精英怪物动画
        this.anims.create({
            key: 'eliteHunterAnims',
            frames: this.anims.generateFrameNumbers('eliteHunter',{start: 0,end: 3}),
            frameRate: 16,
            repeat: -1
        })
    }

}
