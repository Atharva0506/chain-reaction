import React, { useState, useEffect } from "react";
import GameBoard from "../components/GameBoard";
import { ChainReactionGame  } from "../utils/game"; // Assuming you have a similar implementation in the frontend
import { useSocket } from "../hooks/useSocket";
import { Button } from "../components/Button";

export const INIT_MESSAGE = "INIT_MSG";
export const MOVE = "MOVE";
export const CURRENT_STATE = "GAME_STATE";
export const GAME_OVER = "GAME_OVER";

const Game: React.FC = () => {
  const [game, setGame] = useState(new ChainReactionGame(8, 8, 2));
  const [gameState, setGameState] = useState(game);
  const [currentPlayer, setCurrentPlayer] = useState(game.currentPlayer);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_MESSAGE:
          const newGame = new ChainReactionGame(8, 8, 2);
          setGame(newGame);
          setGameState(newGame);
          setCurrentPlayer(newGame.currentPlayer);
          console.log("Game Init");
          break;
        case MOVE:
          const move = message.payload;
          game.placeAtom(move.row, move.col);
          setGameState(game);
          setCurrentPlayer(game.currentPlayer);
          console.log("Move Made");
          break;
        case CURRENT_STATE:
          setGameState(message.gameState);
          setCurrentPlayer(message.gameState.currentPlayer);
          break;
        case GAME_OVER:
          console.log("Game Is Over. Winner: ", message.winner);
          break;
      }
    };
  }, [socket,game]);

  const handleCellClick = (row: number, col: number) => {
    if (game.isValidMove(row, col, currentPlayer)) {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: { row, col },
        })
      );
    }
  };

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="flex flex-row items-center justify-center h-screen">
      <div className="flex flex-col items-center mr-4">
        <h1 className="text-2xl font-bold mb-4">Chain Reaction</h1>
        <GameBoard grid={gameState.grid} onCellClick={handleCellClick} />
        <p className="mt-4 text-white">Current Player: {currentPlayer}</p>
      </div>
      <div className="ml-4">
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() =>
            socket.send(
              JSON.stringify({
                type: INIT_MESSAGE,
              })
            )
          }
        >
          Play
        </Button>
      </div>
    </div>
  );
};

export default Game;
