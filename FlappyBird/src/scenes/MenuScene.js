export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('bg', './assets/bg.png');
    }

    create() {
        // 添加背景
        this.add.tileSprite(190, 340, 380, 680, 'bg');

        // 添加标题
        this.add.text(190, 200, 'Flappy Penguin', {
            fontSize: '40px',
            fill: '#fff'
        }).setOrigin(0.5);

        // 添加开始按钮
        const startButton = this.add.text(190, 340, 'Start Game', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            fontStyle: 'bold',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 添加说明
        this.add.text(190, 440, 'Click to start\nAvoid mountains and bombs', {
            fontSize: '20px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);
    }
} 