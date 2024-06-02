"use client";
import React, { useEffect, useState } from "react";
import Cell from "./Cell";
import { ChainReactionGame } from "@/utils/gameLogic";

interface GameBoardProps {
  rows: number;
  columns: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ rows, columns }) => {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [game, setGame] = useState<ChainReactionGame | null>(null);
  const [grid, setGrid] = useState<
    Array<Array<{ player: number; atoms: number }>>
  >([]);
  const [turns, setTurns] = useState(0);
  const [winner, setWinner] = useState<string | number | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(true);
  const currentPlayer = game ? game.currentPlayer : null;

  useEffect(() => {
    if (game) {
      setGrid([...game.grid]);
    }
  }, [game]);

  const handleCellClick = (row: number, column: number) => {
    if (!game) return;

    const success = game.placeAtom(row, column);
    if (success) {
      setGrid([...game.grid]);
      game.switchPlayer();

      setTurns((prevTurns) => prevTurns + 1);
      const gameOverStatus = game.isGameOver();
      if (turns + 1 >= game.numPlayers && gameOverStatus.gameOver) {
        setWinner(gameOverStatus.winner);
      }
    }
  };

  const startGame = () => {
    const newGame = new ChainReactionGame(rows, columns, numPlayers);
    setGame(newGame);
    setGrid(newGame.grid);
    setTurns(0);
    setWinner(null);
    setIsSetupOpen(false);
  };

  return (
    <section>
      <div>
        {isSetupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Setup Game</h2>
                <p className="text-gray-600">Please enter the number of players and start the game.</p>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="numPlayers" className="text-right font-medium">Number of Players</label>
                  <input
                    id="numPlayers"
                    type="number"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                    min="2"
                    max="8"
                    className="col-span-3 border rounded p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentPlayer !== null && (
        <div className="text-2xl my-4">Current Player: {currentPlayer}</div>
      )}

      <div className="grid grid-cols-6">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              column={colIndex}
              onClick={handleCellClick}
              player={cell.player}
              atoms={cell.atoms}
              currentPlayer={currentPlayer}
            />
          ))
        )}
      </div>

      {winner !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="border border-red-500 p-4 rounded-lg">
              <div className="text-red-500 font-semibold">Game Over!</div>
              <div className="text-red-500">Player {winner} wins!</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GameBoard;
