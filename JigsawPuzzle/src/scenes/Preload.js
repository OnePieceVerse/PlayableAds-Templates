// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preload extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    init() {
        // Initialize scene
    }

    preload() {
        // Create loading bar
        this.add.rectangle(300, 400, 600, 800, 0x1a1a2e);

        this.add.text(300, 300, 'LOADING...', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Loading bar background
        const progressBg = this.add.rectangle(300, 400, 300, 20, 0x333333);
        const progressBar = this.add.rectangle(300, 400, 0, 20, 0x4a4a8a);

        // Update loading bar
        this.load.on('progress', (value) => {
            progressBar.width = 300 * value;
        });

        // Load complete puzzle image
        this.load.image('puzzleImage', './assets/complete-image.png');

        // Load all puzzle pieces (3x3 grid)
        for (let row = 1; row <= 3; row++) {
            for (let col = 1; col <= 3; col++) {
                this.load.image(`piece-${row}-${col}`, `./assets/row-${row}-column-${col}.png`);
            }
        }
    }

    create() {
        // Wait a moment then start the game
        this.time.delayedCall(500, () => {
            this.scene.start('Game');
        });
    }
}
