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

    // Snake object definition
    const Snake = {
        body: [
            { x: 10, y: 10 } // head only, no initial body segments
        ],
        
        reset: function() {
            this.body = [
                { x: 10, y: 10 } // reset to head only
            ];
            currentDirection = 'right';
            nextDirection = 'right';
        },

        move: function(food) {
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
        },

        changeDirection: function(newDirection) {
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
        },

        checkCollision: function(gridSize) {
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
    };

    // Load castle image for snake head
    const headImage = new Image();
    headImage.src = './images/castle.png';  // Updated path to be relative to HTML file location

    let imageLoaded = false;
    headImage.onload = () => {
        console.log('Image loaded successfully');
        imageLoaded = true;
        startButton.disabled = false;
        // Do initial draw after image loads
        draw();
    };
    
    headImage.onerror = (err) => {
        console.error('Failed to load castle image:', err);
        imageLoaded = false;
        startButton.disabled = false;
        // Do initial draw even if image fails to load
        draw();
    };

    // Initialize Food
    const Food = {
        position: { x: 15, y: 15 },
        gridSize: GRID_SIZE,
        
        init: function() {
            this.position = this.getRandomPosition();
        },
        
        getRandomPosition: function() {
            return {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        },
        
        respawn: function() {
            this.position = this.getRandomPosition();
        }
    };

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        Snake.body.forEach((segment, index) => {
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

        // Draw food
        ctx.fillStyle = 'Hotpink';
        ctx.fillRect(
            Food.position.x * CELL_SIZE,
            Food.position.y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
        );

        if (isGameOver) {
            ctx.fillStyle = 'Purple';
            ctx.font = 'bold 30px Cinzel, serif';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        }
    }

    function update() {
        if (isGameOver) return;

        if (Snake.move(Food)) {
            Food.respawn();
        }

        if (Snake.checkCollision(GRID_SIZE)) {
            isGameOver = true;
            clearInterval(gameLoop);
            startButton.style.display = 'block';
        }
    }

    function startGame() {
        // Reset game state
        isGameOver = false;
        Snake.reset();
        Food.init();
        
        // Hide start button
        startButton.style.display = 'none';
        
        // Clear any existing game loop
        if (gameLoop) clearInterval(gameLoop);
        
        // Start new game loop
        gameLoop = setInterval(() => {
            update();
            draw();
        }, GAME_SPEED);
    }

    // Create and handle start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.className = 'start-button';
    startButton.style.fontFamily = 'Cinzel, serif';
    startButton.style.fontSize = '20px';
    startButton.style.fontWeight = 'bold';
    startButton.disabled = true; // Disable until image loads
    canvas.parentNode.insertBefore(startButton, canvas.nextSibling);
    startButton.addEventListener('click', startGame);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': Snake.changeDirection('up'); break;
            case 'ArrowDown': Snake.changeDirection('down'); break;
            case 'ArrowLeft': Snake.changeDirection('left'); break;
            case 'ArrowRight': Snake.changeDirection('right'); break;
        }
    });

    // Remove the immediate initial draw and replace with a debounced draw
    setTimeout(draw, 100); // Debounced initial draw in case image loads very quickly
});