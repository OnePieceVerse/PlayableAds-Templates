export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Game configuration
        this.boardWidth = 8;
        this.boardHeight = 8;
        this.gemSize = 60;
        this.gemTypes = ['star', 'heart', 'crystal'];
        this.selectedGem = null;
        this.canMove = false;
        this.score = 0;
        
        // Debug graphics
        this.debugGraphics = null;
        this.debugText = null;
    }

    preload() {
        // Assets are preloaded in PreloaderScene
    }

    create() {
        // Add background
        this.add.image(300, 400, 'background').setScale(0.5);
        
        // Add score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', { 
            fontSize: '32px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        
        // Draw grid for debugging
        this.drawGrid();
        
        // Create board
        this.gems = [];
        this.createBoard();
        
        // Add input handlers
        this.input.on('pointerdown', this.onPointerDown, this);
        
        // Allow moves after initial board setup and matches cleared
        this.time.delayedCall(600, () => {
            this.checkAllMatches();
            this.time.delayedCall(600, () => {
                this.canMove = true;
            });
        });
    }

    update() {
        // Game loop updates
    }
    
    createBoard() {
        // Calculate the starting position to center the board
        const startX = (this.cameras.main.width - (this.boardWidth * this.gemSize)) / 2 + this.gemSize / 2;
        const startY = (this.cameras.main.height - (this.boardHeight * this.gemSize)) / 2 + this.gemSize / 2 + 50; // Offset for score
        
        // Create a 2D array to store gems
        for (let y = 0; y < this.boardHeight; y++) {
            this.gems[y] = [];
            for (let x = 0; x < this.boardWidth; x++) {
                // Create a gem at this position
                const gemType = this.gemTypes[Phaser.Math.Between(0, this.gemTypes.length - 1)];
                const gem = this.createGem(x, y, gemType);
                
                // Store in our array
                this.gems[y][x] = gem;
                
                // Avoid initial matches by checking and changing if needed
                let attempts = 0;
                while (this.checkInitialMatches(x, y) && attempts < 5) {
                    // Change to a different gem type
                    const newType = this.gemTypes[Phaser.Math.Between(0, this.gemTypes.length - 1)];
                    gem.setTexture(newType);
                    gem.gemType = newType;
                    attempts++;
                }
            }
        }
    }
    
    createGem(x, y, gemType) {
        // Calculate board position (consistent with drawGrid and onPointerDown)
        const boardStartX = (this.cameras.main.width - (this.boardWidth * this.gemSize)) / 2;
        const boardStartY = (this.cameras.main.height - (this.boardHeight * this.gemSize)) / 2 + 50;
        
        // Calculate position (center of the cell)
        const posX = boardStartX + (x * this.gemSize) + (this.gemSize / 2);
        const posY = boardStartY + (y * this.gemSize) + (this.gemSize / 2);
        
        // Create the gem sprite
        const gem = this.add.sprite(posX, posY, gemType);
        
        // Scale to fit our gem size
        gem.setScale(this.gemSize / gem.width * 0.85); // 85% of cell size
        
        // Add properties to track position and type
        gem.gemType = gemType;
        gem.boardX = x;
        gem.boardY = y;
        
        // Make interactive
        gem.setInteractive();
        
        return gem;
    }
    
    checkInitialMatches(x, y) {
        // Check for horizontal matches (need at least 2 previous gems)
        if (x >= 2) {
            const gem1 = this.gems[y][x - 2];
            const gem2 = this.gems[y][x - 1];
            const currentGem = this.gems[y][x];
            
            if (gem1.gemType === currentGem.gemType && gem2.gemType === currentGem.gemType) {
                return true;
            }
        }
        
        // Check for vertical matches (need at least 2 previous gems)
        if (y >= 2) {
            const gem1 = this.gems[y - 2][x];
            const gem2 = this.gems[y - 1][x];
            const currentGem = this.gems[y][x];
            
            if (gem1.gemType === currentGem.gemType && gem2.gemType === currentGem.gemType) {
                return true;
            }
        }
        
        return false;
    }
    
    drawGrid() {
        // Create graphics object for debugging
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        
        // Calculate board position
        const boardStartX = (this.cameras.main.width - (this.boardWidth * this.gemSize)) / 2;
        const boardStartY = (this.cameras.main.height - (this.boardHeight * this.gemSize)) / 2 + 50;
        
        // Draw grid cells
        for (let x = 0; x <= this.boardWidth; x++) {
            this.debugGraphics.moveTo(boardStartX + x * this.gemSize, boardStartY);
            this.debugGraphics.lineTo(boardStartX + x * this.gemSize, boardStartY + this.boardHeight * this.gemSize);
        }
        
        for (let y = 0; y <= this.boardHeight; y++) {
            this.debugGraphics.moveTo(boardStartX, boardStartY + y * this.gemSize);
            this.debugGraphics.lineTo(boardStartX + this.boardWidth * this.gemSize, boardStartY + y * this.gemSize);
        }
        
        this.debugGraphics.strokePath();
        
        // Add debug text
        this.debugText = this.add.text(10, this.cameras.main.height - 30, '', { 
            fontSize: '16px', 
            fill: '#fff',
            backgroundColor: '#000'
        });
    }
    
    onPointerDown(pointer) {
        if (!this.canMove) return;
        
        // Calculate board position
        const boardStartX = (this.cameras.main.width - (this.boardWidth * this.gemSize)) / 2;
        const boardStartY = (this.cameras.main.height - (this.boardHeight * this.gemSize)) / 2 + 50;
        
        // Convert pointer position to board coordinates
        const relativeX = pointer.x - boardStartX;
        const relativeY = pointer.y - boardStartY;
        const x = Math.floor(relativeX / this.gemSize);
        const y = Math.floor(relativeY / this.gemSize);
        
        // Update debug text
        if (this.debugText) {
            this.debugText.setText(`Click: (${Math.round(pointer.x)},${Math.round(pointer.y)}) | Board: (${x},${y})`)
        }
        
        // Highlight clicked cell for debugging
        if (this.debugGraphics) {
            this.debugGraphics.clear();
            this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
            
            // Redraw grid
            for (let gx = 0; gx <= this.boardWidth; gx++) {
                this.debugGraphics.moveTo(boardStartX + gx * this.gemSize, boardStartY);
                this.debugGraphics.lineTo(boardStartX + gx * this.gemSize, boardStartY + this.boardHeight * this.gemSize);
            }
            
            for (let gy = 0; gy <= this.boardHeight; gy++) {
                this.debugGraphics.moveTo(boardStartX, boardStartY + gy * this.gemSize);
                this.debugGraphics.lineTo(boardStartX + this.boardWidth * this.gemSize, boardStartY + gy * this.gemSize);
            }
            
            // Highlight clicked cell
            if (x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight) {
                this.debugGraphics.fillStyle(0x00ff00, 0.3);
                this.debugGraphics.fillRect(
                    boardStartX + x * this.gemSize,
                    boardStartY + y * this.gemSize,
                    this.gemSize,
                    this.gemSize
                );
            }
            
            this.debugGraphics.strokePath();
        }
        
        // Check if coordinates are valid
        if (x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight) {
            const gem = this.gems[y][x];
            
            // Skip if the gem is null
            if (!gem) return;
            
            // If no gem is selected, select this one
            if (!this.selectedGem) {
                this.selectedGem = gem;
                // Visual indication of selection
                gem.setTint(0x00ff00);
            } else {
                // If the same gem is clicked, deselect it
                if (this.selectedGem === gem) {
                    if (this.selectedGem) {
                        this.selectedGem.clearTint();
                    }
                    this.selectedGem = null;
                } else {
                    // Check if the gems are adjacent
                    const dx = Math.abs(this.selectedGem.boardX - gem.boardX);
                    const dy = Math.abs(this.selectedGem.boardY - gem.boardY);
                    
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        // Swap the gems
                        this.swapGems(this.selectedGem, gem);
                    } else {
                        // Not adjacent, deselect first and select new
                        if (this.selectedGem) {
                            this.selectedGem.clearTint();
                        }
                        this.selectedGem = gem;
                        gem.setTint(0x00ff00);
                    }
                }
            }
        }
    }
    
    swapGems(gem1, gem2) {
        // Ensure both gems exist
        if (!gem1 || !gem2) {
            console.error('Attempted to swap with a null gem');
            this.selectedGem = null;
            this.canMove = true;
            return;
        }
        
        // Disable input during swap
        this.canMove = false;
        
        // Clear selection tint
        if (gem1) {
            gem1.clearTint();
        }
        this.selectedGem = null;
        
        // Store original positions
        const gem1X = gem1.boardX;
        const gem1Y = gem1.boardY;
        const gem2X = gem2.boardX;
        const gem2Y = gem2.boardY;
        
        // Swap board coordinates
        gem1.boardX = gem2X;
        gem1.boardY = gem2Y;
        gem2.boardX = gem1X;
        gem2.boardY = gem1Y;
        
        // Update array (only do this once)
        this.gems[gem1.boardY][gem1.boardX] = gem1;
        this.gems[gem2.boardY][gem2.boardX] = gem2;
        
        // Animate the swap
        this.tweens.add({
            targets: gem1,
            x: gem2.x,
            y: gem2.y,
            duration: 200,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: gem2,
            x: gem1.x,
            y: gem1.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Check for matches after the swap
                const hasMatches = this.checkAllMatches();
                
                if (!hasMatches) {
                    // If no matches, swap back
                    this.swapBack(gem1, gem2);
                } else {
                    // Allow moves after the board has settled
                    this.time.delayedCall(600, () => {
                        this.canMove = true;
                    });
                }
            }
        });
    }
    
    swapBack(gem1, gem2) {
        // Swap board positions back
        const tempX = gem1.boardX;
        const tempY = gem1.boardY;
        
        gem1.boardX = gem2.boardX;
        gem1.boardY = gem2.boardY;
        gem2.boardX = tempX;
        gem2.boardY = tempY;
        
        // Update array
        this.gems[gem1.boardY][gem1.boardX] = gem1;
        this.gems[gem2.boardY][gem2.boardX] = gem2;
        
        // Animate the swap back
        this.tweens.add({
            targets: gem1,
            x: gem2.x,
            y: gem2.y,
            duration: 200,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: gem2,
            x: gem1.x,
            y: gem1.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Re-enable moves
                this.canMove = true;
            }
        });
    }
    
    checkAllMatches() {
        let hasMatches = false;
        
        // Check horizontal matches
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth - 2; x++) {
                const gem1 = this.gems[y][x];
                const gem2 = this.gems[y][x + 1];
                const gem3 = this.gems[y][x + 2];
                
                // Skip if any gem is null
                if (!gem1 || !gem2 || !gem3) continue;
                
                if (gem1.gemType === gem2.gemType && gem2.gemType === gem3.gemType) {
                    // Mark gems for removal
                    gem1.toRemove = true;
                    gem2.toRemove = true;
                    gem3.toRemove = true;
                    hasMatches = true;
                    
                    // Check for longer matches (4 or 5 in a row)
                    if (x + 3 < this.boardWidth && this.gems[y][x + 3] && this.gems[y][x + 3].gemType === gem1.gemType) {
                        this.gems[y][x + 3].toRemove = true;
                        if (x + 4 < this.boardWidth && this.gems[y][x + 4] && this.gems[y][x + 4].gemType === gem1.gemType) {
                            this.gems[y][x + 4].toRemove = true;
                        }
                    }
                }
            }
        }
        
        // Check vertical matches
        for (let x = 0; x < this.boardWidth; x++) {
            for (let y = 0; y < this.boardHeight - 2; y++) {
                const gem1 = this.gems[y][x];
                const gem2 = this.gems[y + 1][x];
                const gem3 = this.gems[y + 2][x];
                
                // Skip if any gem is null
                if (!gem1 || !gem2 || !gem3) continue;
                
                if (gem1.gemType === gem2.gemType && gem2.gemType === gem3.gemType) {
                    // Mark gems for removal
                    gem1.toRemove = true;
                    gem2.toRemove = true;
                    gem3.toRemove = true;
                    hasMatches = true;
                    
                    // Check for longer matches (4 or 5 in a row)
                    if (y + 3 < this.boardHeight && this.gems[y + 3][x] && this.gems[y + 3][x].gemType === gem1.gemType) {
                        this.gems[y + 3][x].toRemove = true;
                        if (y + 4 < this.boardHeight && this.gems[y + 4][x] && this.gems[y + 4][x].gemType === gem1.gemType) {
                            this.gems[y + 4][x].toRemove = true;
                        }
                    }
                }
            }
        }
        
        // If we have matches, remove them and refill
        if (hasMatches) {
            this.removeMatches();
        }
        
        return hasMatches;
    }
    
    removeMatches() {
        let matchCount = 0;
        
        // Remove all gems marked for removal
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const gem = this.gems[y][x];
                if (gem && gem.toRemove) {
                    matchCount++;
                    
                    // Animate removal
                    this.tweens.add({
                        targets: gem,
                        alpha: 0,
                        scale: 0.5,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            gem.destroy();
                        }
                    });
                    
                    // Mark position as empty
                    this.gems[y][x] = null;
                }
            }
        }
        
        // Update score (10 points per gem)
        this.score += matchCount * 10;
        this.scoreText.setText('Score: ' + this.score);
        
        // After a delay, only make gems fall but don't refill the board
        this.time.delayedCall(400, () => {
            this.fallGems();
            this.time.delayedCall(400, () => {
                // Re-enable moves after gems have fallen
                this.canMove = true;
                
                // Check if the board is cleared
                this.checkBoardCleared();
            });
        });
    }
    
    fallGems() {
        // For each column
        for (let x = 0; x < this.boardWidth; x++) {
            // Start from the bottom and work up
            let fallDistance = 0;
            
            for (let y = this.boardHeight - 1; y >= 0; y--) {
                // If this position is empty
                if (this.gems[y][x] === null) {
                    fallDistance++;
                } else if (fallDistance > 0) {
                    // This gem needs to fall
                    const gem = this.gems[y][x];
                    
                    // Update board position
                    gem.boardY += fallDistance;
                    this.gems[gem.boardY][x] = gem;
                    this.gems[y][x] = null;
                    
                    // Animate the fall
                    const newY = gem.y + (fallDistance * this.gemSize);
                    this.tweens.add({
                        targets: gem,
                        y: newY,
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            }
        }
    }
    
    refillBoard() {
        // For each column, fill empty spaces at the top
        for (let x = 0; x < this.boardWidth; x++) {
            for (let y = 0; y < this.boardHeight; y++) {
                if (this.gems[y][x] === null) {
                    // Calculate board position (consistent with other methods)
                    const boardStartX = (this.cameras.main.width - (this.boardWidth * this.gemSize)) / 2;
                    const boardStartY = (this.cameras.main.height - (this.boardHeight * this.gemSize)) / 2 + 50;
                    
                    // Calculate position for new gem (start above the board)
                    const posX = boardStartX + (x * this.gemSize) + (this.gemSize / 2);
                    const startY = boardStartY - (this.gemSize * (y + 1)) + (this.gemSize / 2);
                    const endY = boardStartY + (y * this.gemSize) + (this.gemSize / 2);
                    
                    // Create a new gem
                    const gemType = this.gemTypes[Phaser.Math.Between(0, this.gemTypes.length - 1)];
                    const gem = this.add.sprite(posX, startY, gemType);
                    
                    // Scale to fit our gem size
                    gem.setScale(this.gemSize / gem.width * 0.85);
                    
                    // Add properties
                    gem.gemType = gemType;
                    gem.boardX = x;
                    gem.boardY = y;
                    gem.setInteractive();
                    
                    // Store in our array
                    this.gems[y][x] = gem;
                    
                    // Animate falling into place
                    this.tweens.add({
                        targets: gem,
                        y: endY,
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            }
        }
    }
    
    checkBoardCleared() {
        // Check if all gems have been cleared from the board
        let gemsRemaining = 0;
        
        // Count remaining gems on the board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.gems[y][x] !== null) {
                    gemsRemaining++;
                }
            }
        }
        
        // If no gems remain, the player has won
        if (gemsRemaining === 0) {
            // Display victory message
            const victoryText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '恭喜通关!', { 
                fontSize: '64px', 
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 6
            }).setOrigin(0.5);
            
            // Add some visual effects for victory
            this.tweens.add({
                targets: victoryText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: 2
            });
            
            // Transition to success scene after a delay
            this.time.delayedCall(3000, () => {
                this.scene.start('GamesuccessScene');
            });
        } else {
            // Check if there are any possible matches left
            if (!this.hasPossibleMatches()) {
                // If no possible matches and gems still remain, game over
                const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '无法继续!', { 
                    fontSize: '64px', 
                    fill: '#fff',
                    stroke: '#000',
                    strokeThickness: 6
                }).setOrigin(0.5);
                
                // Transition to game over scene after a delay
                this.time.delayedCall(3000, () => {
                    this.scene.start('GameoverScene');
                });
            }
        }
    }
    
    hasPossibleMatches() {
        // Check if there are any possible matches on the board
        
        // Check horizontal swaps
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth - 1; x++) {
                // Skip empty positions
                if (!this.gems[y] || !this.gems[y][x] || !this.gems[y][x+1]) continue;
                
                // Temporarily swap
                const temp = this.gems[y][x].gemType;
                this.gems[y][x].gemType = this.gems[y][x+1].gemType;
                this.gems[y][x+1].gemType = temp;
                
                // Check if this creates a match
                const hasMatch = this.checkMatchesAt(x, y) || this.checkMatchesAt(x+1, y);
                
                // Swap back
                this.gems[y][x+1].gemType = this.gems[y][x].gemType;
                this.gems[y][x].gemType = temp;
                
                if (hasMatch) return true;
            }
        }
        
        // Check vertical swaps
        for (let x = 0; x < this.boardWidth; x++) {
            for (let y = 0; y < this.boardHeight - 1; y++) {
                // Skip empty positions
                if (!this.gems[y] || !this.gems[y+1] || !this.gems[y][x] || !this.gems[y+1][x]) continue;
                
                // Temporarily swap
                const temp = this.gems[y][x].gemType;
                this.gems[y][x].gemType = this.gems[y+1][x].gemType;
                this.gems[y+1][x].gemType = temp;
                
                // Check if this creates a match
                const hasMatch = this.checkMatchesAt(x, y) || this.checkMatchesAt(x, y+1);
                
                // Swap back
                this.gems[y+1][x].gemType = this.gems[y][x].gemType;
                this.gems[y][x].gemType = temp;
                
                if (hasMatch) return true;
            }
        }
        
        return false;
    }
    
    checkMatchesAt(x, y) {
        // Check if coordinates are valid
        if (y < 0 || y >= this.boardHeight || x < 0 || x >= this.boardWidth) return false;
        
        // Skip if position is empty or row doesn't exist
        if (!this.gems[y] || !this.gems[y][x]) return false;
        
        const gemType = this.gems[y][x].gemType;
        
        // Check horizontal match (need at least 3 in a row)
        let horizontalCount = 1;
        
        // Check left
        for (let i = x - 1; i >= 0 && i >= x - 2; i--) {
            if (this.gems[y] && this.gems[y][i] && this.gems[y][i].gemType === gemType) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        // Check right
        for (let i = x + 1; i < this.boardWidth && i <= x + 2; i++) {
            if (this.gems[y] && this.gems[y][i] && this.gems[y][i].gemType === gemType) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        if (horizontalCount >= 3) return true;
        
        // Check vertical match (need at least 3 in a row)
        let verticalCount = 1;
        
        // Check up
        for (let j = y - 1; j >= 0 && j >= y - 2; j--) {
            if (this.gems[j] && this.gems[j][x] && this.gems[j][x].gemType === gemType) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        // Check down
        for (let j = y + 1; j < this.boardHeight && j <= y + 2; j++) {
            if (this.gems[j] && this.gems[j][x] && this.gems[j][x].gemType === gemType) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        return verticalCount >= 3;
    }
}
