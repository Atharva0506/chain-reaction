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
    movesMade: number[]; 

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
        const grid: Cell[][] = [];
        for (let i = 0; i < this.rows; i++) {
            const row: Cell[] = [];
            for (let j = 0; j < this.cols; j++) {
                row.push({ player: 0, atoms: 0 });
            }
            grid.push(row);
        }
        return grid;
    }

    placeAtom(row: number, col: number): boolean {
        if (this.isValidMove(row, col, this.currentPlayer)) {
            const cell = this.grid[row][col];
            cell.player = this.currentPlayer;
            cell.atoms++;
            this.checkExplosions(row, col);
            this.movesMade[this.currentPlayer - 1]++; // Increment the move count for the current player
            return true;
        }
        return false;
    }

    checkExplosions(row: number, col: number): void {
        const cell = this.grid[row][col];
        const criticalMass = this.getCriticalMass(row, col);
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

    switchPlayer(): void {
        const initialPlayer = this.currentPlayer;
        const allPlayersMoved = this.movesMade.every(moves => moves > 0);

        do {
            this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1;
        } while (allPlayersMoved && this.calculateScore(this.currentPlayer) === 0 && this.currentPlayer !== initialPlayer);

        this.turnComplete = false;
    }

    isValidMove(row: number, col: number, player: number): boolean {
        const cell = this.grid[row][col];
        return cell.player === player || cell.player === 0;
    }

    isGameOver() {
        if (this.movesMade.reduce((acc, moves) => acc + moves, 0) < this.numPlayers) {
            return { gameOver: false, winner: null };
        }
        const activePlayers = new Set();
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
        const cell = this.grid[row][col];
        if (cell.atoms > 0) {
            cell.atoms--;
            if (cell.atoms === 0) {
                cell.player = 0;
            }
        }
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
}

export { ChainReactionGame };
export type { Cell };