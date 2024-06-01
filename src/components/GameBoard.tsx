"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
const Cell = dynamic(() => import('./Cell'), { ssr: false });
import { ChainReactionGame } from "@/utils/gameLogic"; // Update the path
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button";


interface GameBoardProps {
  rows: number;
  columns: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ rows, columns }) => {
  const [numPlayers, setNumPlayers] = useState<number>(2); // Number of players
  const [game, setGame] = useState<ChainReactionGame| null>(null);
  const [grid, setGrid] = useState<Array<Array<{ player: number; atoms: number }>>>([]);
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

      setTurns(turns + 1);
      const gameOverStatus = game.isGameOver();
      console.log(
        turns + " " + game.numPlayers + " " + gameOverStatus.gameOver
      );
      if (turns >= game.numPlayers && gameOverStatus.gameOver) {
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

    <div>
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Start Game</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setup Game</DialogTitle>
            <DialogDescription>
              Please enter the number of players and start the game.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numPlayers" className="text-right">
                Number of Players
              </Label>
              <Input
                id="numPlayers"
                type="number"
                value={numPlayers}
                onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                min="2"
                max="8"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startGame}>Start Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentPlayer !== null && (
        <div className="text-2xl">Current Player: {currentPlayer}</div>
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
              currentPlayer={currentPlayer} // Pass currentPlayer prop
            />
          ))
        )}
      </div>

      {winner !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <Alert variant="destructive">
              <AlertTitle>Game Over!</AlertTitle>
              <AlertDescription>
                Player {winner} wins!
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;