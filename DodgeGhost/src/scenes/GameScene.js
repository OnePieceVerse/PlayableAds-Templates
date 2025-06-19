export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.ghosts = null;
        this.platforms = null;
        this.cursors = null;
        this.gameTime = 0;
        this.timeText = null;
        this.spawnTimer = null;
        this.isGameOver = false;
        this.isGameStarted = false; // 新增：游戏是否已开始
        this.playerSpeed = 250; // 玩家移动速度
        this.fenceConfig = {
            width: 380, // 游戏屏幕宽度
            height: 680, // 游戏屏幕高度
            x: 0, // 从屏幕左上角开始
            y: 0, // 从屏幕左上角开始
            wallHeight: 25 // 边界高度参数
        };
        this.canTeleport = true; // 穿墙冷却标志
    }

    preload() {
        this.load.image('rowborder', './assets/row_border.png');
        this.load.image('colborder', './assets/column_border.png');

        // 加载游戏资源
        this.load.image('bg', './assets/bg.png');
        this.load.image('ghost', './assets/bomb.png');
        this.load.spritesheet('player', './assets/flying.png', { frameWidth: 640, frameHeight: 360 });
    }

    create() {
        this.gameTime = 0;
        this.isGameOver = false;
        this.isGameStarted = false; // 游戏开始时设置为未开始状态

        // 添加背景
        this.add.image(0, 0, 'bg').setOrigin(0, 0);

        // 创建围栏
        this.platforms = this.physics.add.staticGroup();
        this.createFence(this.fenceConfig);

        // 创建玩家
        this.player = this.physics.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'player'
        );
        // 创建动画
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 23 }),
            frameRate: 24,
            repeat: -1
        });
        // 创建静止动画（使用第一帧）
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: 0
        });
        this.player.setCollideWorldBounds(false);
        this.player.setBounce(0);
        this.player.setDamping(false);
        this.player.setDrag(0);
        this.player.setGravity(0);
        this.player.setVelocity(0, 0);
        // 指定玩家的大小
        this.player.setScale(0.1);
        // 调整碰撞体大小和位置（按照精灵的原尺寸设置）
        this.player.setSize(560, 340);
        // 设置默认朝向（向右）
        this.player.setFlipX(false);
        // 播放静止动画
        this.player.play('idle');

        // 创建鬼群组
        this.ghosts = this.physics.add.group();

        // 添加第一个鬼
        this.spawnGhost();

        // 设置碰撞
        this.physics.add.collider(this.player, this.platforms, this.handleWallCollision, null, this);
        this.physics.add.collider(this.ghosts, this.platforms);

        // 添加鬼和玩家的碰撞检测
        this.physics.add.overlap(this.player, this.ghosts, this.handleCollision, null, this);

        // 添加计时器文本 
        this.timeText = this.add.text(0, 0, 'Survival time: 0s', { fontSize: '26px', fill: '#ff0000' });

        // 设置定时生成鬼（但先不启动）
        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnGhost,
            callbackScope: this,
            loop: true,
            paused: true // 初始时暂停
        });

        // 设置键盘控制
        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // 创建开始游戏蒙版
        this.createStartOverlay();

        // 开启debug
        this.physics.world.createDebugGraphic();
    }

    createStartOverlay() {
        // 创建半透明黑色蒙版
        this.startOverlay = this.add.rectangle(0, 0, 380, 680, 0x000000, 0.7);
        this.startOverlay.setOrigin(0, 0);

        // 游戏标题
        this.startTitle = this.add.text(190, 200, 'Dodge Ghosts', {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.startTitle.setOrigin(0.5);

        // 游戏说明
        this.startInstruction = this.add.text(190, 280, 'Survive as long as possible \n and dodge the ghosts!', {
            fontSize: '20px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.startInstruction.setOrigin(0.5);

        // 点击开始提示
        this.startText = this.add.text(190, 400, 'Click to start game', {
            fontSize: '25px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.startText.setOrigin(0.5);

        // 添加闪烁动画效果
        this.tweens.add({
            targets: this.startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // 添加点击事件监听器
        this.input.on('pointerdown', this.startGame, this);

        // 添加键盘事件监听器（按任意键开始）
        this.input.keyboard.on('keydown', this.startGame, this);
    }

    startGame() {
        if (this.isGameStarted) return; // 防止重复启动

        this.isGameStarted = true;

        // 移除开始蒙版
        this.startOverlay.destroy();
        this.startTitle.destroy();
        this.startInstruction.destroy();
        this.startText.destroy();

        // 移除事件监听器
        this.input.off('pointerdown', this.startGame, this);
        this.input.keyboard.off('keydown', this.startGame, this);

        // 启动游戏计时器和鬼魂生成
        this.spawnTimer.paused = false;
    }

    createFence(config) {
        const { width, height, x, y, wallHeight } = config;

        // 创建四个边的围栏
        // 上边 - 使用屏幕宽度，高度为wallHeight
        const topWall = this.platforms.create(x + width / 2, y + wallHeight / 2, 'rowborder');
        topWall.setDisplaySize(width, wallHeight);
        topWall.refreshBody();

        // 下边 - 使用屏幕宽度，高度为wallHeight
        const bottomWall = this.platforms.create(x + width / 2, y + height - wallHeight / 2, 'rowborder');
        bottomWall.setDisplaySize(width, wallHeight);
        bottomWall.refreshBody();

        // 左边 - 使用wallHeight宽度，高度为屏幕高度
        const leftWall = this.platforms.create(x + wallHeight / 2, y + height / 2, 'colborder');
        leftWall.setDisplaySize(wallHeight, height);
        leftWall.refreshBody();

        // 右边 - 使用wallHeight宽度，高度为屏幕高度
        const rightWall = this.platforms.create(x + width - wallHeight / 2, y + height / 2, 'colborder');
        rightWall.setDisplaySize(wallHeight, height);
        rightWall.refreshBody();
    }

    handleCollision(player, ghost) {
        if (this.isGameOver) return;

        this.isGameOver = true;
        // 立即暂停物理引擎，停止所有运动
        this.physics.pause();
        // 玩家变红
        player.setTint(0xff0000);

        // 0.5秒后跳转到游戏结束场景
        this.time.delayedCall(500, () => {
            this.scene.start('GameOverScene', { time: this.gameTime });
        });
    }

    handleWallCollision(player, wall) {
        if (!this.canTeleport) return; // 如果正在冷却中，直接返回

        const { width, height, x, y, wallHeight } = this.fenceConfig;

        // 获取碰撞的墙的位置
        const wallX = wall.x;
        const wallY = wall.y;

        // 判断是哪个方向的墙
        if (Math.abs(wallX - x) < wallHeight) {
            // 左墙
            player.x = x + width - wallHeight - player.displayWidth / 2 - 1;
        } else if (Math.abs(wallX - (x + width)) < wallHeight) {
            // 右墙
            player.x = x + wallHeight + player.displayWidth / 2 + 1;
        } else if (Math.abs(wallY - y) < wallHeight) {
            // 上墙
            player.y = y + height - wallHeight - player.displayHeight / 2 - 1;
        } else if (Math.abs(wallY - (y + height)) < wallHeight) {
            // 下墙
            player.y = y + wallHeight + player.displayHeight / 2 + 1;
        }

        // 限制玩家在围栏内
        player.x = Phaser.Math.Clamp(player.x, x + wallHeight + player.displayWidth / 2, x + width - wallHeight - player.displayWidth / 2);
        player.y = Phaser.Math.Clamp(player.y, y + wallHeight + player.displayHeight / 2, y + height - wallHeight - player.displayHeight / 2);

        // 设置穿墙冷却
        this.canTeleport = false;
        this.time.delayedCall(800, () => {
            this.canTeleport = true;
        });
    }

    handlePlayerMovement() {
        if (this.isGameOver || !this.isGameStarted) return;

        // 计算水平和垂直方向的移动
        let moveX = 0;
        let moveY = 0;

        // 处理WASD移动
        if (this.keys.w.isDown) {
            moveY -= 1;
        }
        if (this.keys.s.isDown) {
            moveY += 1;
        }
        if (this.keys.a.isDown) {
            moveX -= 1;
        }
        if (this.keys.d.isDown) {
            moveX += 1;
        }

        // 如果有对角线移动，标准化移动向量
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }

        // 只有在没有移动输入时才重置速度，避免与穿墙逻辑冲突
        if (moveX === 0 && moveY === 0) {
            this.player.setVelocity(0, 0);
        } else {
            // 应用移动速度
            this.player.setVelocity(
                moveX * this.playerSpeed,
                moveY * this.playerSpeed
            );
        }

        // 更新动画和方向
        if (moveX !== 0 || moveY !== 0) {
            // 玩家在移动，播放飞行动画
            this.player.play('fly', true);
            // 根据水平移动方向翻转玩家
            if (moveX < 0) {
                this.player.setFlipX(true);
            } else if (moveX > 0) {
                this.player.setFlipX(false);
            }
        } else {
            // 玩家静止，播放静止动画
            this.player.play('idle', true);
        }
    }

    update() {
        if (this.isGameOver || !this.isGameStarted) return;

        // 更新游戏时间
        this.gameTime += this.game.loop.delta;
        this.timeText.setText('Survival time: ' + (this.gameTime / 1000).toFixed(3) + 's');

        // 处理玩家移动
        this.handlePlayerMovement();

        // 更新鬼的移动
        this.ghosts.getChildren().forEach(ghost => {
            const angle = Phaser.Math.Angle.Between(ghost.x, ghost.y, this.player.x, this.player.y);
            const speed = 150;
            ghost.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        });

        // 处理穿墙
        this.handleWrapping();
    }

    handleWrapping() {
        const { width, height, x, y, wallHeight } = this.fenceConfig;

        // 处理鬼穿墙
        this.ghosts.getChildren().forEach(ghost => {
            if (ghost.x < x + wallHeight) {
                ghost.x = x + width - wallHeight;
            } else if (ghost.x > x + width - wallHeight) {
                ghost.x = x + wallHeight;
            }

            if (ghost.y < y + wallHeight) {
                ghost.y = y + height - wallHeight;
            } else if (ghost.y > y + height - wallHeight) {
                ghost.y = y + wallHeight;
            }
        });
    }

    spawnGhost() {
        // 使用与构造函数相同的fenceConfig
        const fenceConfig = this.fenceConfig;

        // 计算安全生成位置（远离玩家）
        let x, y;
        do {
            // 在围栏内随机生成x坐标（避开边界50像素）
            x = Phaser.Math.Between(fenceConfig.x + fenceConfig.wallHeight + 50, fenceConfig.x + fenceConfig.width - fenceConfig.wallHeight - 50);
            // 在围栏内随机生成y坐标（避开边界50像素）
            y = Phaser.Math.Between(fenceConfig.y + fenceConfig.wallHeight + 50, fenceConfig.y + fenceConfig.height - fenceConfig.wallHeight - 50);
        } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200); // 确保生成位置与玩家距离不小于200像素

        const ghost = this.ghosts.create(x, y, 'ghost');
        ghost.setBounce(0.2);
        ghost.setCollideWorldBounds(false);
    }
} 