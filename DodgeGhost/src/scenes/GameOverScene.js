export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalTime = data.time || 0;
    }

    preload() {
        this.load.image('bg', './assets/bg.png');
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(0, 0, 'bg').setOrigin(0, 0);

        // 显示游戏结束文本
        this.add.text(width / 2, height / 2 - 50, 'Game Over', {
            fontSize: '48px',
            fill: '#000'
        }).setOrigin(0.5);

        // 显示存活时间，小数点后三位数
        this.add.text(width / 2, height / 2 + 20, `Survival time: ${(this.finalTime / 1000).toFixed(3)} seconds`, {
            fontSize: '20px',
            fill: '#000'
        }).setOrigin(0.5);

        // 添加重新开始按钮
        const restartButton = this.add.text(width / 2, height / 2 + 100, 'Download!', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
} 