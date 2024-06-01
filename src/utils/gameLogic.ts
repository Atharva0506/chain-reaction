interface Cell {
    player: number;
    atoms: number;
}

class ChainReactionGame {
    rows: number;
    cols: number;
    numPlayers: number;
    currentPlayer: number;
    grid: Cell[][];
    turnComplete: boolean;
    turnCounter: number;
    movesMade: number[]; // Track the number of moves made by each player

    constructor(rows: number, cols: number, numPlayers: number) {
        this.rows = rows;
        this.cols = cols;
        this.numPlayers = numPlayers;
        this.currentPlayer = 1;
        this.grid = this.createGrid();
        this.turnComplete = false;
        this.turnCounter = 0; // Counter to keep track of the number of turns
        this.movesMade = Array(numPlayers).fill(0); // Initialize the movesMade array
    }

    createGrid(): Cell[][] {
        let grid: Cell[][] = [];
        for (let i = 0; i < this.rows; i++) {
            let row: Cell[] = [];
            for (let j = 0; j < this.cols; j++) {
                row.push({ player: 0, atoms: 0 });
            }
            grid.push(row);
        }
        return grid;
    }

    placeAtom(row: number, col: number): boolean {
        if (this.isValidMove(row, col, this.currentPlayer)) {
            let cell = this.grid[row][col];
            cell.player = this.currentPlayer;
            cell.atoms++;
            this.checkExplosions(row, col);
            this.movesMade[this.currentPlayer - 1]++; // Increment the move count for the current player
            return true;
        }
        return false;
    }

    checkExplosions(row: number, col: number): void {
        let cell = this.grid[row][col];
        let criticalMass = this.getCriticalMass(row, col);
        if (cell.atoms >= criticalMass) {
            cell.atoms -= criticalMass;
            this.grid[row][col] = { player: 0, atoms: 0 };
            this.explodeAdjacent(row - 1, col);
            this.explodeAdjacent(row + 1, col);
            this.explodeAdjacent(row, col - 1);
            this.explodeAdjacent(row, col + 1);
        }
    }

    explodeAdjacent(row: number, col: number): void {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col].player = this.currentPlayer;
            this.grid[row][col].atoms++;
            this.checkExplosions(row, col);
        }
    }

    getCriticalMass(row: number, col: number): number {
        if ((row === 0 || row === this.rows - 1) && (col === 0 || col === this.cols - 1)) {
            return 2;
        } else if (row === 0 || row === this.rows - 1 || col === 0 || col === this.cols - 1) {
            return 3;
        } else {
            return 4;
        }
    }

    calculateScore(player: number): number {
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

    getHeuristicValue(): number {
        const currentPlayerScore = this.calculateScore(this.currentPlayer);
        const opponentScores = [];
        for (let player = 1; player <= this.numPlayers; player++) {
            if (player !== this.currentPlayer) {
                opponentScores.push(this.calculateScore(player));
            }
        }
        const maxOpponentScore = Math.max(...opponentScores);
        if (currentPlayerScore === 0) {
            return Number.NEGATIVE_INFINITY;
        } else if (maxOpponentScore === 0) {
            return Number.POSITIVE_INFINITY;
        } else {
            return currentPlayerScore - maxOpponentScore;
        }
    }

    switchPlayer(): void {
        let initialPlayer = this.currentPlayer;
        let allPlayersMoved = this.movesMade.every(moves => moves > 0);

        do {
            this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1;
        } while (allPlayersMoved && this.calculateScore(this.currentPlayer) === 0 && this.currentPlayer !== initialPlayer);

        this.turnComplete = false;
    }

    minimax(depth: number, isMaximizingPlayer: boolean): number {
        if (depth === 0 || this.isGameOver().gameOver) {
            return this.getHeuristicValue();
        }

        if (isMaximizingPlayer) {
            let maxEval = Number.NEGATIVE_INFINITY;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.isValidMove(i, j, this.currentPlayer)) {
                        this.placeAtom(i, j);
                        this.switchPlayer();
                        let _eval = this.minimax(depth - 1, false);
                        this.undoMove(i, j);
                        this.switchPlayer();
                        maxEval = Math.max(maxEval, _eval);
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
                        let _eval = this.minimax(depth - 1, true);
                        this.undoMove(i, j);
                        this.switchPlayer();
                        minEval = Math.min(minEval, _eval);
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

    isGameOver(): { gameOver: boolean, winner: number | null } {
        let activePlayers = new Set<number>();
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j].player !== 0) {
                    activePlayers.add(this.grid[i][j].player);
                }
            }
        }

        if (activePlayers.size === 1) {
            return { gameOver: true, winner: [...activePlayers][0] };
        } else {
            return { gameOver: false, winner: null };
        }
    }

    undoMove(row: number, col: number): void {
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
export type { Cell };
