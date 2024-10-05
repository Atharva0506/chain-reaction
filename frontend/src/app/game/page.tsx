"use client";
import React, { useEffect, useState } from "react";
import Board from "@/components/Board";
import { useSocket } from "@/hooks/useSoket";
import { ChainReactionGame, Cell as GameCell } from "@/utils/Game";

const Game: React.FC = () => {
  const socket = useSocket();
  const [chain] = useState(new ChainReactionGame(8, 8, 2)); // Number of players set to 2
  const [board, setBoard] = useState<GameCell[][]>(chain.createGrid());
  const [started, setStarted] = useState(false);
  const [invalidMove, setInvalidMove] = useState<string | null>(null); // State for invalid move message

  const INIT_GAME = "init_game";
  const MOVE = "move";
  const GAME_OVER = "game_over";
  const INVALID_MOVE = "invalid_move";

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case INIT_GAME:
          setBoard(chain.createGrid());
          setStarted(true);
          setInvalidMove(null); // Reset invalid move message
          break;
        case MOVE:
          const move = message.payload;
    
          if (chain.placeAtom(move.row, move.col)) {
            setBoard([...chain.grid]);
            setInvalidMove(null); 
          } else {
            setInvalidMove("Invalid move! Try again."); 
          }
          break;
        case GAME_OVER:
          console.log("Game over");
          break;
        case INVALID_MOVE:
          setInvalidMove("Invalid move! Try again."); 
          break;
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket, chain]);

  if (!socket) return <div>Connecting...</div>;

  return (
    <div>
      {invalidMove && <div className="text-red-500">{invalidMove}</div>} 
      <div className="flex h-full justify-center items-center">
        {board.length > 0 && (
          <Board rows={8} cols={8} initialBoard={board} socket={socket} />
        )}
      </div>
      {!started && (
        <button
          onClick={() => {
            socket.send(
              JSON.stringify({
                type: INIT_GAME,
              })
            );
          }}
          className="px-4 py-2 bg-slate-300 text-slate-900 text-2xl font-bold rounded-lg shadow-lg duration-200 hover:text-slate-300 hover:bg-slate-900"
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default Game;
