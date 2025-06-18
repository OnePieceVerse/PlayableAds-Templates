export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.score = data.score || 0;
    }

    preload() {
        this.load.image('bg', './assets/flappy_penguin/bg.png');

    }

    create() {

        this.background = this.add.tileSprite(190, 340, 380, 680, 'bg');


        // 添加游戏结束标题
        this.add.text(190, 200, 'Game Over', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 显示最终分数
        this.add.text(190, 280, `Score: ${this.score}`, {
            fontSize: '36px',
            fill: '#fff'
        }).setOrigin(0.5);

        // 创建重新开始按钮
        const restartButton = this.add.container(190, 400);

        // 按钮背景
        const buttonBg = this.add.rectangle(0, 0, 260, 60, 0x4CAF50);
        buttonBg.setOrigin(0.5);
        buttonBg.setInteractive({ useHandCursor: true });

        // 按钮文字
        const buttonText = this.add.text(0, 0, 'Click to download', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 将背景和文字添加到容器
        restartButton.add([buttonBg, buttonText]);

        // 添加按钮悬停效果
        buttonBg.on('pointerover', () => {
            buttonBg.fillColor = 0x45a049;
        });

        buttonBg.on('pointerout', () => {
            buttonBg.fillColor = 0x4CAF50;
        });

        // 添加点击事件
        buttonBg.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // // 添加提示文字
        // this.add.text(190, 500, '点击按钮重新开始游戏', {
        //     fontSize: '20px',
        //     fill: '#fff',
        //     fontStyle: 'italic'
        // }).setOrigin(0.5);
    }
} 