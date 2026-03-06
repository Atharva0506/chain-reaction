import {
  type Board,
  type Cell,
  type Position,
  type CellDiff,
  type BoardDiff,
  type Player,
  type PlayerColor,
  BOARD_ROWS,
  BOARD_COLS,
} from "@chain-reaction/types";

export function createEmptyBoard(rows = BOARD_ROWS, cols = BOARD_COLS): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = { orbs: 0, owner: null };
    }
  }
  return board;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function getCriticalMass(
  row: number,
  col: number,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): number {
  const isTop = row === 0;
  const isBottom = row === rows - 1;
  const isLeft = col === 0;
  const isRight = col === cols - 1;
  const edgeCount =
    (isTop ? 1 : 0) + (isBottom ? 1 : 0) + (isLeft ? 1 : 0) + (isRight ? 1 : 0);
  if (edgeCount >= 2) return 2;
  if (edgeCount === 1) return 3;
  return 4;
}

export function getNeighbors(
  row: number,
  col: number,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): Position[] {
  const neighbors: Position[] = [];
  if (row > 0) neighbors.push({ row: row - 1, col });
  if (row < rows - 1) neighbors.push({ row: row + 1, col });
  if (col > 0) neighbors.push({ row, col: col - 1 });
  if (col < cols - 1) neighbors.push({ row, col: col + 1 });
  return neighbors;
}

export function isValidMove(
  board: Board,
  position: Position,
  playerColor: PlayerColor
): boolean {
  const cell = board[position.row]?.[position.col];
  if (!cell) return false;
  return cell.owner === null || cell.owner === playerColor;
}

export interface ExplosionStep {
  diff: BoardDiff;
  board: Board;
}

export function applyMove(
  board: Board,
  position: Position,
  playerColor: PlayerColor,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): { finalBoard: Board; steps: ExplosionStep[] } {
  const current = cloneBoard(board);
  const steps: ExplosionStep[] = [];

  current[position.row][position.col].orbs += 1;
  current[position.row][position.col].owner = playerColor;

  const initialChanges: CellDiff[] = [
    {
      row: position.row,
      col: position.col,
      orbs: current[position.row][position.col].orbs,
      owner: playerColor,
    },
  ];

  let unstable = findUnstableCells(current, rows, cols);

  if (unstable.length === 0) {
    steps.push({
      diff: { changes: initialChanges, explosions: [] },
      board: cloneBoard(current),
    });
    return { finalBoard: current, steps };
  }

  steps.push({
    diff: { changes: initialChanges, explosions: [] },
    board: cloneBoard(current),
  });

  let iterations = 0;
  const maxIterations = rows * cols * 4;

  while (unstable.length > 0 && iterations < maxIterations) {
    iterations++;
    const changes: CellDiff[] = [];
    const explosions: Position[] = [...unstable];

    for (const pos of unstable) {
      const mass = getCriticalMass(pos.row, pos.col, rows, cols);
      current[pos.row][pos.col].orbs -= mass;
      if (current[pos.row][pos.col].orbs <= 0) {
        current[pos.row][pos.col].orbs = 0;
        current[pos.row][pos.col].owner = null;
      }
      changes.push({
        row: pos.row,
        col: pos.col,
        orbs: current[pos.row][pos.col].orbs,
        owner: current[pos.row][pos.col].owner,
      });

      const neighbors = getNeighbors(pos.row, pos.col, rows, cols);
      for (const n of neighbors) {
        current[n.row][n.col].orbs += 1;
        current[n.row][n.col].owner = playerColor;
        changes.push({
          row: n.row,
          col: n.col,
          orbs: current[n.row][n.col].orbs,
          owner: playerColor,
        });
      }
    }

    steps.push({
      diff: { changes, explosions },
      board: cloneBoard(current),
    });

    unstable = findUnstableCells(current, rows, cols);
  }

  return { finalBoard: current, steps };
}

function findUnstableCells(
  board: Board,
  rows: number,
  cols: number
): Position[] {
  const unstable: Position[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].orbs >= getCriticalMass(r, c, rows, cols)) {
        unstable.push({ row: r, col: c });
      }
    }
  }
  return unstable;
}

export function checkWinner(
  board: Board,
  players: Player[],
  turnNumber: number,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): Player | null {
  if (turnNumber < players.length) return null;

  const activeColors = new Set<PlayerColor>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].orbs > 0 && board[r][c].owner !== null) {
        activeColors.add(board[r][c].owner!);
      }
    }
  }

  if (activeColors.size === 1) {
    const winnerColor = [...activeColors][0];
    return players.find((p) => p.color === winnerColor) ?? null;
  }

  return null;
}

export function getAlivePlayers(board: Board, players: Player[]): Player[] {
  const activeColors = new Set<PlayerColor>();
  for (const row of board) {
    for (const cell of row) {
      if (cell.orbs > 0 && cell.owner !== null) {
        activeColors.add(cell.owner);
      }
    }
  }
  return players.filter(
    (p) =>
      activeColors.has(p.color) ||
      !boardHasAnyOrbs(board)
  );
}

function boardHasAnyOrbs(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.orbs > 0) return true;
    }
  }
  return false;
}

export function getValidMoves(
  board: Board,
  playerColor: PlayerColor,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isValidMove(board, { row: r, col: c }, playerColor)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

export function countPlayerOrbs(board: Board, color: PlayerColor): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.owner === color) {
        count += cell.orbs;
      }
    }
  }
  return count;
}

export function countPlayerCells(board: Board, color: PlayerColor): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.owner === color && cell.orbs > 0) {
        count++;
      }
    }
  }
  return count;
}
