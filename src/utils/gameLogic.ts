interface Cell {
    orbs: number;
    color: string | null;
}

export function initializeBoard(m: number, n: number): Cell[][] {
    const board: Cell[][] = [];
    for (let i = 0; i < m; i++) {
        const row: Cell[] = [];
        for (let j = 0; j < n; j++) {
            row.push({ orbs: 0, color: null });
        }
        board.push(row);
    }
    return board;
}

export function addOrb(cell: Cell, color: string): void {
    cell.orbs += 1;
    cell.color = color;
}

export function explodeCell(cell: Cell, board: Cell[][]): void {
    const neighbors = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];
    for (const { dx, dy } of neighbors) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (nx >= 0 && nx < board.length && ny >= 0 && ny < board[0].length) {
            const adjacentCell = board[nx][ny];
            addOrb(adjacentCell, cell.color!);
            cell.orbs -= 1;
        }
    }
}

export function convertCells(cell: Cell, color: string, board: Cell[][]): void {
    if (cell.color !== color) {
        cell.color = color;
        if (cell.orbs >= 4) { // Assuming 4 is the critical mass
            explodeCell(cell, board);
        }
    }
}

export function checkWinner(board: Cell[][]): string | null {
    let redOrbs = 0;
    let greenOrbs = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell.color === 'red') {
                redOrbs += cell.orbs;
            } else if (cell.color === 'green') {
                greenOrbs += cell.orbs;
            }
        }
    }
    if (redOrbs === 0) {
        return 'Green';
    } else if (greenOrbs === 0) {
        return 'Red';
    } else {
        return null;
    }
}
