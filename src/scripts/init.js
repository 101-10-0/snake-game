let gameStarted = false;

window.onload = function() {
    setupGame();
};

function setupGame() {
    const modal = document.getElementById('instructionModal');
    modal.style.display = 'flex';
}

function startGame() {
    if (gameStarted) return;
    
    const modal = document.getElementById('instructionModal');
    modal.style.display = 'none';
    gameStarted = true;
    
    // Initialize your game here
    if (typeof initGame === 'function') {
        initGame();
    }
}

// Make startGame available globally
window.startGame = startGame;
