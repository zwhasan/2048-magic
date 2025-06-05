let board = JSON.parse(localStorage.getItem('gameBoard')) || [];
let currentScore = parseInt(localStorage.getItem('currentScore')) || 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

// Undo functionality
let historyStack = JSON.parse(localStorage.getItem('historyStack')) || [];

// Cheat code sequence detection
const cheatCode = ['left', 'left', 'right', 'right', 'right', 'right', 'left', 'left'];
let inputSequence = [];

// Cheat mode state
let isCheatMode = false;

// Initialize board
function initBoard() {
    const board = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile(board);
    addRandomTile(board);
    return board;
}

// Add random tile
function addRandomTile(board) {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    if (emptyCells.length) {
        const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

// Move logic
function moveBoard(board, direction) {
    const newBoard = board.map(row => [...row]);
    const merged = Array(4).fill().map(() => Array(4).fill(false));

    if (direction === 'up') {
        for (let col = 0; col < 4; col++) {
            for (let row = 1; row < 4; row++) {
                if (newBoard[row][col] !== 0) {
                    let currentRow = row;
                    while (currentRow > 0 && newBoard[currentRow - 1][col] === 0) {
                        newBoard[currentRow - 1][col] = newBoard[currentRow][col];
                        newBoard[currentRow][col] = 0;
                        currentRow--;
                    }
                    if (currentRow > 0 && newBoard[currentRow - 1][col] === newBoard[currentRow][col] && !merged[currentRow - 1][col]) {
                        newBoard[currentRow - 1][col] *= 2;
                        newBoard[currentRow][col] = 0;
                        merged[currentRow - 1][col] = true;
                    }
                }
            }
        }
    } else if (direction === 'down') {
        for (let col = 0; col < 4; col++) {
            for (let row = 2; row >= 0; row--) {
                if (newBoard[row][col] !== 0) {
                    let currentRow = row;
                    while (currentRow < 3 && newBoard[currentRow + 1][col] === 0) {
                        newBoard[currentRow + 1][col] = newBoard[currentRow][col];
                        newBoard[currentRow][col] = 0;
                        currentRow++;
                    }
                    if (currentRow < 3 && newBoard[currentRow + 1][col] === newBoard[currentRow][col] && !merged[currentRow + 1][col]) {
                        newBoard[currentRow + 1][col] *= 2;
                        newBoard[currentRow][col] = 0;
                        merged[currentRow + 1][col] = true;
                    }
                }
            }
        }
    } else if (direction === 'left') {
        for (let row = 0; row < 4; row++) {
            for (let col = 1; col < 4; col++) {
                if (newBoard[row][col] !== 0) {
                    let currentCol = col;
                    while (currentCol > 0 && newBoard[row][currentCol - 1] === 0) {
                        newBoard[row][currentCol - 1] = newBoard[row][currentCol];
                        newBoard[row][currentCol] = 0;
                        currentCol--;
                    }
                    if (currentCol > 0 && newBoard[row][currentCol - 1] === newBoard[row][currentCol] && !merged[row][currentCol - 1]) {
                        newBoard[row][currentCol - 1] *= 2;
                        newBoard[row][currentCol] = 0;
                        merged[row][currentCol - 1] = true;
                    }
                }
            }
        }
    } else if (direction === 'right') {
        for (let row = 0; row < 4; row++) {
            for (let col = 2; col >= 0; col--) {
                if (newBoard[row][col] !== 0) {
                    let currentCol = col;
                    while (currentCol < 3 && newBoard[row][currentCol + 1] === 0) {
                        newBoard[row][currentCol + 1] = newBoard[row][currentCol];
                        newBoard[row][currentCol] = 0;
                        currentCol++;
                    }
                    if (currentCol < 3 && newBoard[row][currentCol + 1] === newBoard[row][currentCol] && !merged[row][currentCol + 1]) {
                        newBoard[row][currentCol + 1] *= 2;
                        newBoard[row][currentCol] = 0;
                        merged[row][currentCol + 1] = true;
                    }
                }
            }
        }
    }

    const hasChanged = JSON.stringify(newBoard) !== JSON.stringify(board);
    if (hasChanged) {
        addRandomTile(newBoard);
    }
    return newBoard;
}

// Check if game is over
function isGameOver(board) {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return false;
        }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (
                (j < 3 && board[i][j] === board[i][j + 1]) ||
                (i < 3 && board[i][j] === board[i + 1][j])
            ) {
                return false;
            }
        }
    }
    return true;
}

// Initialize game
async function initGame() {
    board = initBoard();
    currentScore = 0;
    
    const cookieBestScore = parseInt(document.getElementById('best-score').textContent) || 0;
    bestScore = Math.max(parseInt(localStorage.getItem('bestScore') || 0), cookieBestScore);
    localStorage.setItem('bestScore', bestScore);
    
    historyStack = [];

    updateUI();
    
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('best-score').textContent = bestScore;
    
    saveGameState();
}

// Update UI
function updateUI() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (board[i][j] !== 0) {
                cell.textContent = board[i][j];
                cell.classList.add(`tile-${board[i][j]}`);
            }
            gridContainer.appendChild(cell);
        }
    }
    
    adjustFontSize();
}

// Adjust font size based on board size
function adjustFontSize() {
    const cells = document.querySelectorAll('.cell');
    const gridContainer = document.getElementById('grid-container');
    const cellWidth = gridContainer.offsetWidth / 4 * 0.9;
    
    cells.forEach(cell => {
        if (cell.textContent) {
            if (cell.textContent.length <= 2) {
                cell.style.fontSize = `${cellWidth * 0.5}px`;
            } else if (cell.textContent.length === 3) {
                cell.style.fontSize = `${cellWidth * 0.4}px`;
            } else {
                cell.style.fontSize = `${cellWidth * 0.3}px`;
            }
        }
    });
}

// Save game state
function saveGameState() {
    localStorage.setItem('gameBoard', JSON.stringify(board));
    localStorage.setItem('currentScore', currentScore);
    localStorage.setItem('bestScore', bestScore);
    localStorage.setItem('historyStack', JSON.stringify(historyStack));
}

// Detect merges
function detectMerges(oldBoard, newBoard, direction) {
    const merged = Array(4).fill().map(() => Array(4).fill(false));
    
    const rows = direction === 'down' ? [3, 2, 1, 0] : [0, 1, 2, 3];
    const cols = direction === 'right' ? [3, 2, 1, 0] : [0, 1, 2, 3];
    
    if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < 4; i++) {
            for (let j of cols) {
                if (newBoard[i][j] !== 0 && newBoard[i][j] === oldBoard[i][j] * 2) {
                    const oldValue = oldBoard[i][j];
                    const newValue = newBoard[i][j];
                    if (oldValue !== 0 && newValue === oldValue * 2) {
                        merged[i][j] = true;
                    }
                }
            }
        }
    } else {
        for (let j = 0; j < 4; j++) {
            for (let i of rows) {
                if (newBoard[i][j] !== 0 && newBoard[i][j] === oldBoard[i][j] * 2) {
                    const oldValue = oldBoard[i][j];
                    const newValue = newBoard[i][j];
                    if (oldValue !== 0 && newValue === oldValue * 2) {
                        merged[i][j] = true;
                    }
                }
            }
        }
    }
    
    return merged;
}

// Calculate score difference
function calculateScoreDifference(oldBoard, newBoard, direction) {
    const merged = detectMerges(oldBoard, newBoard, direction);
    let scoreChange = 0;
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (merged[i][j]) {
                scoreChange += newBoard[i][j];
            }
        }
    }
    
    return scoreChange;
}

// Handle move
async function handleMove(direction) {
    historyStack.push({
        board: JSON.parse(JSON.stringify(board)),
        score: currentScore,
    });
    
    localStorage.setItem('historyStack', JSON.stringify(historyStack));

    inputSequence.push(direction);
    if (inputSequence.length > 8) inputSequence.shift();
    if (JSON.stringify(inputSequence) === JSON.stringify(cheatCode)) {
        enterCheatMode();
        return;
    }

    const oldBoard = JSON.parse(JSON.stringify(board));
    const newBoard = moveBoard(oldBoard, direction);
    const hasChanged = JSON.stringify(newBoard) !== JSON.stringify(oldBoard);
    
    if (hasChanged) {
        const scoreChange = calculateScoreDifference(oldBoard, newBoard, direction);
        currentScore += scoreChange;
        
        document.getElementById('current-score').textContent = currentScore;
        
        if (currentScore > bestScore) {
            bestScore = currentScore;
            localStorage.setItem('bestScore', bestScore);
            document.getElementById('best-score').textContent = bestScore;
        }
        
        board = newBoard;
        saveGameState();
        updateBoardWithAnimation(oldBoard, newBoard, direction);
    }

    if (isGameOver(newBoard)) {
        setTimeout(() => {
            showGameOverModal();
            document.getElementById('undo-button').style.position = 'relative';
            document.getElementById('undo-button').style.zIndex = '20';
        }, 300);
    }
}

// Update board with animation
function updateBoardWithAnimation(oldBoard, newBoard, direction) {
    const gridContainer = document.getElementById('grid-container');
    const cells = Array.from(gridContainer.querySelectorAll('.cell'));
    const merged = detectMerges(oldBoard, newBoard, direction);
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (newBoard[row][col] !== oldBoard[row][col]) {
            if (newBoard[row][col] !== 0) {
                if (merged[row][col]) {
                    cell.textContent = newBoard[row][col];
                    cell.className = `cell tile-${newBoard[row][col]} pulse`;
                    
                    cell.addEventListener('animationend', () => {
                        cell.classList.remove('pulse');
                    }, { once: true });
                } else if (oldBoard[row][col] === 0) {
                    cell.textContent = newBoard[row][col];
                    cell.className = `cell tile-${newBoard[row][col]} appear`;
                    
                    cell.addEventListener('animationend', () => {
                        cell.classList.remove('appear');
                    }, { once: true });
                } else {
                    cell.textContent = newBoard[row][col];
                    cell.className = `cell tile-${newBoard[row][col]}`;
                }
            } else {
                cell.textContent = '';
                cell.className = 'cell';
            }
        }
    });
    
    adjustFontSize();
}

// Enter cheat mode
function enterCheatMode() {
    isCheatMode = true;
    replaceAllTilesWith128();
    
    const gameContainer = document.getElementById('game-container');
    const cheatNotification = document.createElement('div');
    cheatNotification.id = 'cheat-notification';
    cheatNotification.textContent = 'Cheat mode activated!';
    cheatNotification.style.position = 'absolute';
    cheatNotification.style.top = '10px';
    cheatNotification.style.left = '50%';
    cheatNotification.style.transform = 'translateX(-50%)';
    cheatNotification.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    cheatNotification.style.color = 'white';
    cheatNotification.style.padding = '10px 20px';
    cheatNotification.style.borderRadius = '5px';
    cheatNotification.style.zIndex = '100';
    gameContainer.appendChild(cheatNotification);
    
    setTimeout(() => {
        exitCheatMode();
        if (cheatNotification.parentNode) {
            cheatNotification.parentNode.removeChild(cheatNotification);
        }
    }, 3000);
}

// Replace all tiles with 128
function replaceAllTilesWith128() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] !== 0) {
                board[i][j] = 128;
            }
        }
    }
    updateUI();
}

// Exit cheat mode
function exitCheatMode() {
    isCheatMode = false;
}

// Undo move
function undoMove() {
    if (historyStack.length === 0) {
        alert("No moves to undo!");
        return;
    }

    const modal = document.getElementById('game-over-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    }

    const previousState = historyStack.pop();
    board = previousState.board;
    currentScore = previousState.score;
    
    updateUI();
    document.getElementById('current-score').textContent = currentScore;
    saveGameState();
}

// Restart game
function handleRestart() {
    const modal = document.getElementById('game-over-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    }
    
    setTimeout(() => {
        initGame();
    }, 10);
}

// Show game over modal
function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    modal.style.display = 'block';
    document.getElementById('undo-button').style.zIndex = '20';
}

// Close game over modal and init game
function initGameAndCloseModal() {
    const modal = document.getElementById('game-over-modal');
    modal.style.display = 'none';
    setTimeout(() => {
        initGame();
    }, 10);
}

// Keyboard events (PC)
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            handleMove('up');
            break;
        case 'ArrowDown':
            handleMove('down');
            break;
        case 'ArrowLeft':
            handleMove('left');
            break;
        case 'ArrowRight':
            handleMove('right');
            break;
        case 'z':
            undoMove();
            break;
    }
});

// Touch events (Mobile)
let startX = 0;
let startY = 0;

document.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
});

document.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            handleMove('right');
        } else {
            handleMove('left');
        }
    } else {
        if (deltaY > 0) {
            handleMove('down');
        } else {
            handleMove('up');
        }
    }
});

// Window resize event
window.addEventListener('resize', adjustFontSize);

// Initialize on page load
window.addEventListener('load', () => {
    const savedBoard = localStorage.getItem('gameBoard');
    
    if (savedBoard && savedBoard !== '[]') {
        board = JSON.parse(savedBoard);
        currentScore = parseInt(localStorage.getItem('currentScore')) || 0;
        bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        historyStack = JSON.parse(localStorage.getItem('historyStack')) || [];
        
        updateUI();
        
        document.getElementById('current-score').textContent = currentScore;
        document.getElementById('best-score').textContent = bestScore;
    } else {
        initGame();
    }
});