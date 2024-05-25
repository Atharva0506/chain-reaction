class ChainReactionGame {
    rows: number;
    cols: number;
    numPlayers: number;
    currentPlayer: number;
    grid: { player: number; atoms: number; }[][];
    turnComplete: boolean;
    
    constructor(rows: number, cols: number, numPlayers: number) {
        this.rows = rows;
        this.cols = cols;
        this.numPlayers = numPlayers;
        this.currentPlayer = 1;
        this.grid = this.createGrid();
        this.turnComplete = false; // Flag to indicate whether a player's turn is complete
    }

    createGrid() {
        let grid = [];
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push({ player: 0, atoms: 0 }); // Initialize each cell with player 0 (empty) and 0 atoms
            }
            grid.push(row);
        }
        return grid;
    }

    placeAtom(row: number, col: number) {
        let cell = this.grid[row][col];
        if (this.isValidMove(row, col, this.currentPlayer)) { // Check if the cell is owned by the current player or empty
            cell.player = this.currentPlayer;
            cell.atoms++;
            this.checkExplosions(row, col);
            return true; // Atom placed successfully
        }
        return false; // Cannot place atom in this cell
    }

    checkExplosions(row: number, col: number) {
        let cell = this.grid[row][col];
        let criticalMass = this.getCriticalMass(row, col);
        if (cell.atoms >= criticalMass) {
            cell.atoms -= criticalMass;
            this.grid[row][col] = { player: 0, atoms: 0 }; // Empty the cell after explosion
            // Explode adjacent cells
            this.explodeAdjacent(row - 1, col);
            this.explodeAdjacent(row + 1, col);
            this.explodeAdjacent(row, col - 1);
            this.explodeAdjacent(row, col + 1);
        }
    }

    explodeAdjacent(row: number, col: number) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col].player = this.currentPlayer;
            this.grid[row][col].atoms++;
            this.checkExplosions(row, col);
        }
    }

    getCriticalMass(row: number, col: number) {
        if ((row === 0 || row === this.rows - 1) && (col === 0 || col === this.cols - 1)) {
            return 2; // Corner cell
        } else if (row === 0 || row === this.rows - 1 || col === 0 || col === this.cols - 1) {
            return 3; // Edge cell
        } else {
            return 4; // Regular cell
        }
    }

    calculateScore(player: number) {
        let score = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j].player === player) {
                    score += this.grid[i][j].atoms;
                }
            }
        }
        return score;
    }

    getHeuristicValue() {
        const currentPlayerScore = this.calculateScore(this.currentPlayer);
        const opponentPlayer = this.currentPlayer === 1 ? 2 : 1;
        const opponentPlayerScore = this.calculateScore(opponentPlayer);
        if (currentPlayerScore === 0) {
            return Number.NEGATIVE_INFINITY; // Player loses
        } else if (opponentPlayerScore === 0) {
            return Number.POSITIVE_INFINITY; // Player wins
        } else {
            return currentPlayerScore - opponentPlayerScore;
        }
    }

    switchPlayer() {
        this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1; // Cycle through players
        this.turnComplete = false; // Reset the turnComplete flag for the next player
    }

    endTurn() {
        this.turnComplete = true; // Set the turnComplete flag to true
    }

    printGrid() {
        for (let i = 0; i < this.rows; i++) {
            let row = '';
            for (let j = 0; j < this.cols; j++) {
                row += this.grid[i][j].player + '-' + this.grid[i][j].atoms + ' ';
            }
            console.log(row);
        }
    }

    minimax(depth: number, isMaximizingPlayer: boolean): number {
        if (depth === 0 || this.isGameOver()) {
            return this.getHeuristicValue();
        }

        if (isMaximizingPlayer) {
            let maxEval = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.isValidMove(i, j, this.currentPlayer)) {
                        this.placeAtom(i, j);
                        this.switchPlayer();
                        let eval = this.minimax(depth - 1, false);
                        this.undoMove(i, j);
                        this.switchPlayer();
                        maxEval = Math.max(maxEval, eval);
                    }
                }
            }
            return maxEval;
        } else {
            let minEval = Number.POSITIVE_INFINITY;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.isValidMove(i, j, this.currentPlayer)) {
                        this.placeAtom(i, j);
                        this.switchPlayer();
                        let eval = this.minimax(depth - 1, true);
                        this.undoMove(i, j);
                        this.switchPlayer();
                        minEval = Math.min(minEval, eval);
                    }
                }
            }
            return minEval;
        }
    }

    findBestMove(depth: number): { row: number, col: number } {
        let bestMove = { row: -1, col: -1 };
        let bestValue = Number.NEGATIVE_INFINITY;
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.isValidMove(i, j, this.currentPlayer)) {
                    this.placeAtom(i, j);
                    this.switchPlayer();
                    let moveValue = this.minimax(depth - 1, false);
                    this.undoMove(i, j);
                    this.switchPlayer();
                    
                    if (moveValue > bestValue) {
                        bestMove = { row: i, col: j };
                        bestValue = moveValue;
                    }
                }
            }
        }
        
        return bestMove;
    }

    isValidMove(row: number, col: number, player: number): boolean {
        let cell = this.grid[row][col];
        return cell.player === player || cell.player === 0;
    }

    isGameOver(): boolean {
        let player1Score = this.calculateScore(1);
        let player2Score = this.calculateScore(2);
        return player1Score === 0 || player2Score === 0;
    }

    undoMove(row: number, col: number) {
        // Implement logic to undo the last move made at (row, col)
        let cell = this.grid[row][col];
        if (cell.atoms > 0) {
            cell.atoms--;
            if (cell.atoms === 0) {
                cell.player = 0;
            }
        }
    }
}

export { ChainReactionGame };
