import {
  type Board,
  type Position,
  type Player,
  type PlayerColor,
  Difficulty,
  BOARD_ROWS,
  BOARD_COLS,
} from "@chain-reaction/types";
import {
  getValidMoves,
  applyMove,
  cloneBoard,
  getCriticalMass,
  countPlayerOrbs,
  countPlayerCells,
  getNeighbors,
  checkWinner,
} from "./engine";

export function getAIMove(
  board: Board,
  player: Player,
  players: Player[],
  difficulty: Difficulty,
  turnNumber: number,
  rows = BOARD_ROWS,
  cols = BOARD_COLS
): Position {
  switch (difficulty) {
    case Difficulty.EASY:
      return getEasyMove(board, player.color, rows, cols);
    case Difficulty.MEDIUM:
      return getMediumMove(board, player, players, turnNumber, rows, cols);
    case Difficulty.HARD:
      return getHardMove(board, player, players, turnNumber, rows, cols);
    default:
      return getEasyMove(board, player.color, rows, cols);
  }
}

function getEasyMove(
  board: Board,
  color: PlayerColor,
  rows: number,
  cols: number
): Position {
  const moves = getValidMoves(board, color, rows, cols);
  const safeMoves = moves.filter((m) => {
    const mass = getCriticalMass(m.row, m.col, rows, cols);
    return board[m.row][m.col].orbs < mass - 1;
  });
  const pool = safeMoves.length > 0 ? safeMoves : moves;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getMediumMove(
  board: Board,
  player: Player,
  players: Player[],
  turnNumber: number,
  rows: number,
  cols: number
): Position {
  const moves = getValidMoves(board, player.color, rows, cols);
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const { finalBoard } = applyMove(
      cloneBoard(board),
      move,
      player.color,
      rows,
      cols
    );
    const score = evaluateBoard(finalBoard, player, players, turnNumber, rows, cols);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function getHardMove(
  board: Board,
  player: Player,
  players: Player[],
  turnNumber: number,
  rows: number,
  cols: number
): Position {
  const moves = getValidMoves(board, player.color, rows, cols);
  let bestScore = -Infinity;
  let bestMove = moves[0];
  const depth = 3;

  for (const move of moves) {
    const { finalBoard } = applyMove(
      cloneBoard(board),
      move,
      player.color,
      rows,
      cols
    );
    const score = minimax(
      finalBoard,
      depth - 1,
      false,
      -Infinity,
      Infinity,
      player,
      players,
      turnNumber + 1,
      rows,
      cols
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  players: Player[],
  turnNumber: number,
  rows: number,
  cols: number
): number {
  const winner = checkWinner(board, players, turnNumber, rows, cols);
  if (winner) {
    return winner.id === aiPlayer.id ? 10000 : -10000;
  }
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer, players, turnNumber, rows, cols);
  }

  const currentPlayerIndex = turnNumber % players.length;
  const currentPlayer = players[currentPlayerIndex];
  const moves = getValidMoves(board, currentPlayer.color, rows, cols);

  if (moves.length === 0) return 0;

  const sampledMoves =
    moves.length > 10
      ? moves.sort(() => Math.random() - 0.5).slice(0, 10)
      : moves;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sampledMoves) {
      const { finalBoard } = applyMove(
        cloneBoard(board),
        move,
        currentPlayer.color,
        rows,
        cols
      );
      const evalScore = minimax(
        finalBoard,
        depth - 1,
        false,
        alpha,
        beta,
        aiPlayer,
        players,
        turnNumber + 1,
        rows,
        cols
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sampledMoves) {
      const { finalBoard } = applyMove(
        cloneBoard(board),
        move,
        currentPlayer.color,
        rows,
        cols
      );
      const evalScore = minimax(
        finalBoard,
        depth - 1,
        true,
        alpha,
        beta,
        aiPlayer,
        players,
        turnNumber + 1,
        rows,
        cols
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluateBoard(
  board: Board,
  aiPlayer: Player,
  players: Player[],
  turnNumber: number,
  rows: number,
  cols: number
): number {
  let score = 0;
  const myColor = aiPlayer.color;

  const myOrbs = countPlayerOrbs(board, myColor);
  const myCells = countPlayerCells(board, myColor);

  let enemyOrbs = 0;
  let enemyCells = 0;
  for (const p of players) {
    if (p.color !== myColor) {
      enemyOrbs += countPlayerOrbs(board, p.color);
      enemyCells += countPlayerCells(board, p.color);
    }
  }

  score += (myOrbs - enemyOrbs) * 2;
  score += (myCells - enemyCells) * 3;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.orbs === 0 || cell.owner === null) continue;
      const mass = getCriticalMass(r, c, rows, cols);
      const isCorner = mass === 2;
      const isEdge = mass === 3;

      if (cell.owner === myColor) {
        if (cell.orbs === mass - 1) {
          score += 5;
          if (isCorner) score += 3;
          if (isEdge) score += 2;
        }
        const neighbors = getNeighbors(r, c, rows, cols);
        for (const n of neighbors) {
          const neighbor = board[n.row][n.col];
          if (
            neighbor.owner !== null &&
            neighbor.owner !== myColor &&
            neighbor.orbs >= getCriticalMass(n.row, n.col, rows, cols) - 1
          ) {
            score -= 8;
          }
        }
      } else {
        if (cell.orbs === mass - 1) {
          const neighbors = getNeighbors(r, c, rows, cols);
          for (const n of neighbors) {
            if (board[n.row][n.col].owner === myColor) {
              score -= 6;
            }
          }
        }
      }
    }
  }

  return score;
}
