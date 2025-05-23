document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const GRID_SIZE = 20;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    const GAME_SPEED = 200;

    let isGameOver = false;
    let gameLoop = null;
    let currentDirection = 'right';
    let nextDirection = 'right';
    let gameStarted = false;
    let snake;
    let food;

    // Snake object definition
    class Snake {
        constructor() {
            this.body = [
                { x: 10, y: 10 } // head only, no initial body segments
            ];
        }

        reset() {
            this.body = [
                { x: 10, y: 10 } // reset to head only
            ];
            currentDirection = 'right';
            nextDirection = 'right';
        }

        move(food) {
            // Get next head position
            const head = { ...this.body[0] };
            switch(nextDirection) {
                case 'up': head.y--; break;
                case 'down': head.y++; break;
                case 'left': head.x--; break;
                case 'right': head.x++; break;
            }
            currentDirection = nextDirection;

            // Check if food is eaten
            const ate = head.x === food.position.x && head.y === food.position.y;
            
            // Add new head
            this.body.unshift(head);
            
            // Remove tail if no food eaten
            if (!ate) {
                this.body.pop();
            }
            
            return ate;
        }

        changeDirection(newDirection) {
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            
            // Prevent reversing
            if (opposites[newDirection] !== currentDirection) {
                nextDirection = newDirection;
            }
        }

        checkCollision(gridSize) {
            const head = this.body[0];
            
            // Check wall collision
            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                return true;
            }
            
            // Check self collision
            return this.body.slice(1).some(segment => 
                segment.x === head.x && segment.y === head.y
            );
        }

        eat(food) {
            const head = this.body[0];
            return head.x === food.position.x && head.y === food.position.y;
        }

        update() {
            if (isGameOver) return;

            if (this.move(food)) {
                food.respawn();
            }

            if (this.checkCollision(GRID_SIZE)) {
                isGameOver = true;
                clearInterval(gameLoop);
                // Show modal on game over
                const modal = document.getElementById('instructionModal');
                modal.style.display = 'block';
            }
        }

        draw() {
            // Draw snake
            this.body.forEach((segment, index) => {
                if (index === 0) {
                    // Always use fallback rectangle for head until image is fully loaded
                    if (imageLoaded && headImage.complete && headImage.naturalWidth > 0) {
                        try {
                            // Draw head using castle image
                            ctx.save();
                            // Calculate rotation based on direction
                            const rotation = {
                                'up': -Math.PI/2,
                                'down': Math.PI/2,
                                'left': Math.PI,
                                'right': 0
                            }[currentDirection] || 0;
                            
                            // Center of the cell
                            const x = segment.x * CELL_SIZE + CELL_SIZE/2;
                            const y = segment.y * CELL_SIZE + CELL_SIZE/2;
                            
                            // Rotate around center point
                            ctx.translate(x, y);
                            ctx.rotate(rotation);
                            ctx.translate(-x, -y);
                            
                            // Draw the castle image
                            ctx.drawImage(
                                headImage,
                                segment.x * CELL_SIZE,
                                segment.y * CELL_SIZE,
                                CELL_SIZE,
                                CELL_SIZE
                            );
                            ctx.restore();
                        } catch (error) {
                            console.error('Error drawing image:', error);
                            // Fallback if drawing fails
                            ctx.fillStyle = '#4A235A';
                            ctx.fillRect(
                                segment.x * CELL_SIZE,
                                segment.y * CELL_SIZE,
                                CELL_SIZE - 1,
                                CELL_SIZE - 1
                            );
                        }
                    } else {
                        // Fallback - draw rectangle if image not loaded
                        ctx.fillStyle = '#4A235A';
                        ctx.fillRect(
                            segment.x * CELL_SIZE,
                            segment.y * CELL_SIZE,
                            CELL_SIZE - 1,
                            CELL_SIZE - 1
                        );
                    }
                } else {
                    // Draw body segments as before
                    ctx.fillStyle = '#8E44AD';
                    ctx.fillRect(
                        segment.x * CELL_SIZE,
                        segment.y * CELL_SIZE,
                        CELL_SIZE - 1,
                        CELL_SIZE - 1
                    );
                }
            });
        }
    }

    // Load castle image for snake head
    const headImage = new Image();
    headImage.src = './images/castle.png';  // Updated path to be relative to HTML file location

    let imageLoaded = false;
    headImage.onload = () => {
        console.log('Image loaded successfully');
        imageLoaded = true;
        if (snake) {
            snake.draw();
        }
    };
    
    headImage.onerror = (err) => {
        console.error('Failed to load castle image:', err);
        imageLoaded = false;
    };

    // Initialize Food
    class Food {
        constructor() {
            this.position = { x: 15, y: 15 };
            this.gridSize = GRID_SIZE;
        }
        
        init() {
            this.position = this.getRandomPosition();
        }
        
        getRandomPosition() {
            return {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        }
        
        respawn() {
            this.position = this.getRandomPosition();
        }

        draw() {
            // Draw food
            ctx.fillStyle = 'Hotpink';
            ctx.fillRect(
                this.position.x * CELL_SIZE,
                this.position.y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1
            );
        }
    }

    function checkGameOver() {
        if (snake.checkCollision(GRID_SIZE)) {
            isGameOver = true;
            clearInterval(gameLoop);
            const gameOverModal = document.getElementById('gameOverModal');
            gameOverModal.style.display = 'flex';
            return true;
        }
        return false;
    }

    function startFirstGame() {
        const instructionModal = document.getElementById('instructionModal');
        instructionModal.style.display = 'none';
        initGame();
        setupControls();
    }

    function restartGame() {
        const gameOverModal = document.getElementById('gameOverModal');
        gameOverModal.style.display = 'none';
        initGame();
    }

    function setupControls() {
        document.addEventListener('keydown', function(e) {
            if (!gameStarted || isGameOver) return;
            
            switch(e.key) {
                case 'ArrowUp': snake.changeDirection('up'); break;
                case 'ArrowDown': snake.changeDirection('down'); break;
                case 'ArrowLeft': snake.changeDirection('left'); break;
                case 'ArrowRight': snake.changeDirection('right'); break;
            }
        });
    }

    function initGame() {
        snake = new Snake();
        food = new Food();
        food.init();
        isGameOver = false;
        gameStarted = true;

        if (gameLoop) {
            clearInterval(gameLoop);
        }

        gameLoop = setInterval(() => {
            if (!isGameOver) {
                if (checkGameOver()) return;

                if (snake.eat(food)) {
                    snake.move(food);
                    food.respawn();
                } else {
                    snake.move(food);
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                food.draw();
                snake.draw();
            }
        }, GAME_SPEED);
    }

    // Make functions globally available
    window.startFirstGame = startFirstGame;
    window.restartGame = restartGame;

    // Show instruction modal only on first load
    window.onload = function() {
        const instructionModal = document.getElementById('instructionModal');
        instructionModal.style.display = 'flex';
    };
});