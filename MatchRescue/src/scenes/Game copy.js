export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.boardSize = 8; // 8x8 grid
        this.tileSize = 60; // Size of each tile
        this.tileSpacing = 5; // Spacing between tiles
        this.selectedTile = null; // Currently selected tile
        this.canMove = false; // Whether player can make moves
        this.score = 0; // Player's score
        this.colors = [
            0xff0000, // Red
            0x00ff00, // Green
            0x0000ff, // Blue
            0xffff00, // Yellow
            0xff00ff, // Magenta
            0x00ffff  // Cyan
        ];
    }

    init() {
        this.canMove = false;
        this.score = 0;
    }

    preload() {
        // We'll use graphics objects instead of images
    }

    create() {
        // Create background using the background image
        this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(this.game.config.width, this.game.config.height);

        // Add title
        this.add.text(this.game.config.width / 2, 50, 'Match Rescue', {
            fontFamily: 'Arial',
            fontSize: 40,
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add score text
        this.scoreText = this.add.text(this.game.config.width / 2, 100, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);

        // Calculate board position to center it
        this.boardWidth = this.boardSize * (this.tileSize + this.tileSpacing) - this.tileSpacing;
        this.boardHeight = this.boardSize * (this.tileSize + this.tileSpacing) - this.tileSpacing;
        this.boardX = (this.game.config.width - this.boardWidth) / 2;
        this.boardY = 150;

        // Create board container
        this.board = this.add.container(this.boardX, this.boardY);

        // Add board background
        const boardBg = this.add.rectangle(
            0, 0,
            this.boardWidth + this.tileSpacing * 2,
            this.boardHeight + this.tileSpacing * 2,
            0x333333
        ).setOrigin(0);
        boardBg.x = -this.tileSpacing;
        boardBg.y = -this.tileSpacing;
        this.board.add(boardBg);

        // Create tiles array
        this.tiles = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.createTile(row, col);
            }
        }

        // Check and remove initial matches
        this.checkAllMatches();

        // Enable player moves after a short delay
        this.time.delayedCall(500, () => {
            this.canMove = true;
        });
    }

    createTile(row, col) {
        // Get random color (avoid creating matches)
        let colorIndex;
        let attempts = 0;
        do {
            colorIndex = Phaser.Math.Between(0, this.colors.length - 1);
            attempts++;
        } while (this.wouldCreateMatch(row, col, colorIndex) && attempts < 10);

        const color = this.colors[colorIndex];

        // Calculate position
        const x = col * (this.tileSize + this.tileSpacing);
        const y = row * (this.tileSize + this.tileSpacing);

        // Create tile graphics
        const tile = this.add.rectangle(x, y, this.tileSize, this.tileSize, color).setOrigin(0);

        // Store tile data
        const tileData = {
            sprite: tile,
            row: row,
            col: col,
            colorIndex: colorIndex,
            color: color,
            isMatched: false
        };

        // Make tile interactive
        tile.setInteractive();
        tile.on('pointerdown', () => this.selectTile(tileData));

        // Add to board container
        this.board.add(tile);

        // Store in tiles array
        this.tiles[row][col] = tileData;

        return tileData;
    }

    wouldCreateMatch(row, col, colorIndex) {
        // Check horizontally
        if (col >= 2) {
            if (this.tiles[row][col-1]?.colorIndex === colorIndex &&
                this.tiles[row][col-2]?.colorIndex === colorIndex) {
                return true;
            }
        }

        // Check vertically
        if (row >= 2) {
            if (this.tiles[row-1][col]?.colorIndex === colorIndex &&
                this.tiles[row-2][col]?.colorIndex === colorIndex) {
                return true;
            }
        }

        return false;
    }

    selectTile(tile) {
        // Ignore if player can't move
        if (!this.canMove) return;

        // If no tile is selected, select this one
        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.sprite.setStrokeStyle(4, 0xffffff);
            return;
        }

        // If this is the same tile, deselect it
        if (this.selectedTile === tile) {
            this.selectedTile.sprite.setStrokeStyle(0);
            this.selectedTile = null;
            return;
        }

        // Check if tiles are adjacent
        const rowDiff = Math.abs(this.selectedTile.row - tile.row);
        const colDiff = Math.abs(this.selectedTile.col - tile.col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // Swap tiles
            this.swapTiles(this.selectedTile, tile);
        } else {
            // Not adjacent, deselect and select new tile
            this.selectedTile.sprite.setStrokeStyle(0);
            this.selectedTile = tile;
            tile.sprite.setStrokeStyle(4, 0xffffff);
        }
    }

    swapTiles(tile1, tile2) {
        // Prevent further moves during swap
        this.canMove = false;

        // Clear selection
        tile1.sprite.setStrokeStyle(0);
        this.selectedTile = null;

        // Swap tile data
        const tempRow = tile1.row;
        const tempCol = tile1.col;

        // Update array positions
        this.tiles[tile1.row][tile1.col] = tile2;
        this.tiles[tile2.row][tile2.col] = tile1;

        // Update tile properties
        tile1.row = tile2.row;
        tile1.col = tile2.col;
        tile2.row = tempRow;
        tile2.col = tempCol;

        // Animate the swap
        const tile1X = tile1.col * (this.tileSize + this.tileSpacing);
        const tile1Y = tile1.row * (this.tileSize + this.tileSpacing);
        const tile2X = tile2.col * (this.tileSize + this.tileSpacing);
        const tile2Y = tile2.row * (this.tileSize + this.tileSpacing);

        this.tweens.add({
            targets: tile1.sprite,
            x: tile1X,
            y: tile1Y,
            duration: 200,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: tile2.sprite,
            x: tile2X,
            y: tile2Y,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Check for matches after swap
                const hasMatches = this.checkAllMatches();

                if (!hasMatches) {
                    // If no matches, swap back
                    this.swapTilesBack(tile1, tile2);
                } else {
                    // Process matches and allow next move
                    this.processMatches();
                }
            }
        });
    }

    swapTilesBack(tile1, tile2) {
        // Swap tile data back
        const tempRow = tile1.row;
        const tempCol = tile1.col;

        // Update array positions
        this.tiles[tile1.row][tile1.col] = tile2;
        this.tiles[tile2.row][tile2.col] = tile1;

        // Update tile properties
        tile1.row = tile2.row;
        tile1.col = tile2.col;
        tile2.row = tempRow;
        tile2.col = tempCol;

        // Animate the swap back
        const tile1X = tile1.col * (this.tileSize + this.tileSpacing);
        const tile1Y = tile1.row * (this.tileSize + this.tileSpacing);
        const tile2X = tile2.col * (this.tileSize + this.tileSpacing);
        const tile2Y = tile2.row * (this.tileSize + this.tileSpacing);

        this.tweens.add({
            targets: tile1.sprite,
            x: tile1X,
            y: tile1Y,
            duration: 200,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: tile2.sprite,
            x: tile2X,
            y: tile2Y,
            duration: 200,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Allow next move
                this.canMove = true;
            }
        });
    }

    checkAllMatches() {
        let hasMatches = false;

        // Reset all matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.tiles[row][col]) {
                    this.tiles[row][col].isMatched = false;
                }
            }
        }

        // Check horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const tile1 = this.tiles[row][col];
                const tile2 = this.tiles[row][col + 1];
                const tile3 = this.tiles[row][col + 2];

                if (tile1 && tile2 && tile3 &&
                    tile1.colorIndex === tile2.colorIndex &&
                    tile2.colorIndex === tile3.colorIndex) {
                    tile1.isMatched = true;
                    tile2.isMatched = true;
                    tile3.isMatched = true;
                    hasMatches = true;
                }
            }
        }

        // Check vertical matches
        for (let row = 0; row < this.boardSize - 2; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile1 = this.tiles[row][col];
                const tile2 = this.tiles[row + 1][col];
                const tile3 = this.tiles[row + 2][col];

                if (tile1 && tile2 && tile3 &&
                    tile1.colorIndex === tile2.colorIndex &&
                    tile2.colorIndex === tile3.colorIndex) {
                    tile1.isMatched = true;
                    tile2.isMatched = true;
                    tile3.isMatched = true;
                    hasMatches = true;
                }
            }
        }

        return hasMatches;
    }

    processMatches() {
        // Count matched tiles for score
        let matchCount = 0;

        // Fade out matched tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.tiles[row][col];
                if (tile && tile.isMatched) {
                    matchCount++;

                    this.tweens.add({
                        targets: tile.sprite,
                        alpha: 0,
                        scale: 0.8,
                        duration: 300,
                        ease: 'Quad.easeOut',
                        onComplete: () => {
                            // Remove sprite
                            tile.sprite.destroy();
                        }
                    });

                    // Clear tile from array
                    this.tiles[row][col] = null;
                }
            }
        }

        // Update score (10 points per tile)
        this.score += matchCount * 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Wait for animations to complete, then drop tiles
        this.time.delayedCall(350, () => {
            this.dropTiles();
        });
    }

    dropTiles() {
        let movesMade = false;

        // Start from the bottom row and move up
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = this.boardSize - 1; row >= 0; row--) {
                // If this position is empty, find a tile above to drop down
                if (!this.tiles[row][col]) {
                    // Look for the closest tile above
                    for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                        if (this.tiles[aboveRow][col]) {
                            // Move this tile down
                            const tile = this.tiles[aboveRow][col];

                            // Update array
                            this.tiles[row][col] = tile;
                            this.tiles[aboveRow][col] = null;

                            // Update tile properties
                            tile.row = row;
                            tile.col = col;

                            // Animate the drop
                            const tileY = tile.row * (this.tileSize + this.tileSpacing);

                            this.tweens.add({
                                targets: tile.sprite,
                                y: tileY,
                                duration: 300,
                                ease: 'Bounce.easeOut'
                            });

                            movesMade = true;
                            break;
                        }
                    }
                }
            }
        }

        // No longer adding new tiles to fill empty spaces
        // Just check for new matches after all animations complete
        this.time.delayedCall(400, () => {
            if (this.checkAllMatches()) {
                // If new matches were created, process them
                this.processMatches();
            } else {
                // No new matches, allow next move
                this.canMove = true;

                // Check if the game is over (no more possible matches)
                this.checkGameOver();
            }
        });
    }

    update() {
        // Game loop updates
    }

    checkGameOver() {
        // Check if there are any possible moves left
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.tiles[row][col];
                if (!tile) continue; // Skip empty spaces

                // Check if swapping with right neighbor would create a match
                if (col < this.boardSize - 1) {
                    const rightTile = this.tiles[row][col + 1];
                    if (rightTile) {
                        // Temporarily swap
                        this.tiles[row][col] = rightTile;
                        this.tiles[row][col + 1] = tile;

                        // Check for matches
                        const hasMatch = this.checkAllMatches();

                        // Swap back
                        this.tiles[row][col] = tile;
                        this.tiles[row][col + 1] = rightTile;

                        if (hasMatch) return; // Found a possible move
                    }
                }

                // Check if swapping with bottom neighbor would create a match
                if (row < this.boardSize - 1) {
                    const bottomTile = this.tiles[row + 1][col];
                    if (bottomTile) {
                        // Temporarily swap
                        this.tiles[row][col] = bottomTile;
                        this.tiles[row + 1][col] = tile;

                        // Check for matches
                        const hasMatch = this.checkAllMatches();

                        // Swap back
                        this.tiles[row][col] = tile;
                        this.tiles[row + 1][col] = bottomTile;

                        if (hasMatch) return; // Found a possible move
                    }
                }
            }
        }

        // If we get here, no possible moves were found
        this.gameOver();
    }

    gameOver() {
        // Disable player moves
        this.canMove = false;

        // Display game over message
        const gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Game Over', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add final score
        this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 60, `Final Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Optional: Add a restart button
        const restartButton = this.add.rectangle(
            this.game.config.width / 2,
            this.game.config.height / 2 + 130,
            200, 60, 0x00aa00
        ).setInteractive();

        const restartText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 130, 'Restart', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5);

        restartButton.on('pointerdown', () => {
            // Restart the game
            this.scene.restart();
        });
    }
}
