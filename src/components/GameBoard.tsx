"use client";
import React, { useState } from "react";
import Cell from "./Cell";
import { ChainReactionGame } from "@/utils/gameLogic"; // Update the path

interface GameBoardProps {
  rows: number;
  columns: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ rows, columns }) => {
  const [game, setGame] = useState(new ChainReactionGame(rows, columns, 2)); // Initialize game
  const [grid, setGrid] = useState(game.grid); // Store grid in state
  const currentPlayer = game.currentPlayer; // Get the current player

  const handleCellClick = (row: number, column: number) => {
    const success = game.placeAtom(row, column); // Place atom in the clicked cell
    if (success) {
      setGrid([...game.grid]); // Update grid state
      game.switchPlayer(); // Switch player after placing atom
    }
  };

  return (
    <div className="grid grid-cols-6 ">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            column={colIndex}
            onClick={handleCellClick}
            player={cell.player}
            atoms={cell.atoms}
            currentPlayer={currentPlayer} // Pass currentPlayer prop
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
