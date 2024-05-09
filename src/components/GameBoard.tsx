"use client"
import { useEffect, useState } from 'react';

// Define constants for the grid size
const GRID_WIDTH = 6;
const GRID_HEIGHT = 9;
const CRITICAL_MASS = 4; // Define the critical mass required for chain reaction

// Define types for the cell and orb
type Cell = {
  position: { x: number; y: number };
  neighbors: Cell[];
  orbCount: number;
  exploded: boolean;
};

type Orb = {
  // Add properties for the orb if needed
};

// Function to initialize the game board
const initializeGameBoard = (): Cell[][] => {
  const board: Cell[][] = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      // Initialize each cell with position, empty orb count, and not exploded
      const cell: Cell = {
        position: { x, y },
        neighbors: [], // You'll need to populate this later
        orbCount: 0,
        exploded: false,
      };
      row.push(cell);
    }
    board.push(row);
  }

  // Assign neighbors for each cell
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = board[y][x];
      // Assign neighbors (e.g., top, bottom, left, right)
      cell.neighbors = [
        board[y - 1]?.[x], // Top
        board[y + 1]?.[x], // Bottom
        board[y]?.[x - 1], // Left
        board[y]?.[x + 1], // Right
      ].filter(Boolean) as Cell[];
    }
  }

  return board;
};

// Function to perform chain reaction
const triggerChainReaction = (cell: Cell) => {
  // Check if the cell's orb count exceeds critical mass
  if (cell.orbCount >= CRITICAL_MASS && !cell.exploded) {
    cell.exploded = true; // Mark cell as exploded

    // Explode the cell, distribute orbs to neighbors
    const excessOrbs = cell.orbCount - CRITICAL_MASS;
    cell.orbCount = CRITICAL_MASS; // Cell reaches critical mass

    // Distribute excess orbs to neighbors
    cell.neighbors.forEach(neighbor => {
      neighbor.orbCount += excessOrbs / cell.neighbors.length; // Distribute evenly to neighbors
    });

    // Recursively trigger chain reaction for neighbors
    cell.neighbors.forEach(neighbor => triggerChainReaction(neighbor));
  }
};

// GameBoard component
const GameBoard: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'Player1' | 'Player2'>('Player1');

  useEffect(() => {
    // Initialize the game board and start with Player1's turn
    setBoard(initializeGameBoard());
    setCurrentPlayer('Player1');
  }, []);

  // Function to handle orb placement when a player clicks on an empty cell
  const handleCellClick = (x: number, y: number) => {
    // Check if it's the current player's turn
    if ((currentPlayer === 'Player1' && board[y][x].orbCount === 0) ||
        (currentPlayer === 'Player2' && board[y][x].orbCount === 0)) {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(row => [...row]);
        const clickedCell = newBoard[y][x];

        // Place the player's orb in the clicked cell
        clickedCell.orbCount = 1; // You can adjust this based on player's orb count

        // Trigger chain reaction for the clicked cell
        triggerChainReaction(clickedCell);

        // Switch to the next player's turn
        setCurrentPlayer(currentPlayer === 'Player1' ? 'Player2' : 'Player1');

        return newBoard;
      });
    }
  };

  return (
    <div className="grid grid-cols-6 gap-1">
      {board.map((row, y) => (
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="border border-gray-400 flex items-center justify-center h-16 w-16 cursor-pointer"
            onClick={() => handleCellClick(x, y)}
          >
            {cell.orbCount}
          </div>
        ))
      ))}
      <div>
        Current player: {currentPlayer}
      </div>
    </div>
  );
};

export default GameBoard;