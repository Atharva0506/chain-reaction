import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import GameBoard from "../components/GameBoard";
import { useSocket } from "../hooks/useSocket";
import { ChainReactionGame } from "../utils/game";

export const INIT_MESSAGE = "INIT_MSG";
export const MOVE = "MOVE";
export const GAME_STATE = "GAME_STATE";
export const GAME_OVER = "GAME_OVER";

const Game = () => {
  const socket = useSocket();
  const [game, setGame] = useState(new ChainReactionGame(8, 8, 2));
  const [board, setBoard] = useState(game.createGrid());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_MESSAGE:
          setBoard(game.createGrid());
          setStarted(true);
          break;
        case MOVE:
          const move = message.payload;
          game.placeAtom(move.row, move.col);
          setBoard([...game.grid]);
          console.log("Move made");
          break;
        case GAME_OVER:
          console.log("Game over");
          break;
        default:
          console.log("Unknown message type");
      }
    };
  }, [socket, game]);

  const handlePlayNow = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const initMessage = { type: INIT_MESSAGE };
      socket.send(JSON.stringify(initMessage));
    }
  };

  const onCellClick = (row:number, col:number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const moveMessage = { type: MOVE, payload: { row, col } };
      socket.send(JSON.stringify(moveMessage));
    }
  };

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl p-4">
        {/* Game Board */}
        <div className="p-8 shadow-lg mb-4 lg:mb-0 lg:mr-4 flex-1">
          <h2 className="text-xl font-bold text-white">Game Board</h2>
          <GameBoard board={board} onCellClick={onCellClick} />
        </div>
        <div className="p-8 shadow-lg flex-1">
          <h2 className="text-xl font-bold">Buttons</h2>
          <Button onClick={handlePlayNow}>Play Now</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
