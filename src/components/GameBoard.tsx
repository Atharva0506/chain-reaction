"use client";
import React, { useState } from "react";
import Cell from "./Cell";
import { ChainReactionGame } from "@/utils/gameLogic"; // Update the path

interface GameBoardProps {
  rows: number;
  columns: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ rows, columns }) => {
  const [game, setGame] = useState(new ChainReactionGame(rows, columns, 3)); //  passing Rows and  cols and no of plauyers
  const [grid, setGrid] = useState(game.grid);
  const [turns,setTurns] = useState(0)
  const currentPlayer = game.currentPlayer;

  const handleCellClick = (row: number, column: number) => {
    const success = game.placeAtom(row, column);
    if (success) {
      setGrid([...game.grid]);
      game.switchPlayer();

      setTurns(turns+1)
      const gameOverStatus = game.isGameOver(); 
      console.log(turns + " " + game.numPlayers + " " + gameOverStatus.gameOver)
        if (turns >= game.numPlayers && gameOverStatus.gameOver) {
          console.log(`Game over! Player ${gameOverStatus.winner} wins!`);
           alert(`Game over! Player ${gameOverStatus.winner} wins!`)
        }
    }
  };

  return (
    <div>
      <div className="text-2xl ">Current Player : {currentPlayer}</div>

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
    </div>
  );
};

export default GameBoard;
