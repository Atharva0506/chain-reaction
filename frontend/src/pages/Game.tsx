import { useEffect, useState } from "react";
import GameBoard from "../components/GameBoard";
import { Button } from "../components/Button";
import { useSocket } from "../hooks/useSocket";
import { ChainReactionGame } from "../utils/game";

export const INIT_MESSAGE = "INIT_MSG";
export const MOVE = "MOVE";
export const CURRENT_SATTE = "GAME_STATE";
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
          setGame(
            new ChainReactionGame(8,8,2  )
          );
          setBoard(game.createGrid());
          setStarted(true);
          break;
        case MOVE:
          const { row, col } = message;
          game.placeAtom(row, col);
          setBoard([...game.grid]);
          break;
        case GAME_OVER:
          console.log("Game over. Winner:", message.winner);
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    };
  }, [socket]);
  const handleMove = (row: number, col: number) => {
    if (!started) return;
    if (game.placeAtom(row, col)) {
        socket.send(JSON.stringify({
            type: MOVE,
            row,
            col,
            player: game.currentPlayer
        }));
        game.switchPlayer();
        setBoard([...game.grid]);
    }
};
  if (!socket) return <div>Connectingg...</div>;
  return (
    <div className="h-screen bg-white flex justify-around items-center">
      <div className="">
      <GameBoard board={board} onCellClick={handleMove} />
      </div>
      <div>
        <Button
          onClick={() => {
            socket.send(
              JSON.stringify({
                type: INIT_MESSAGE,
              })
            );
          }}
        >
          Play
        </Button>
      </div>
    </div>
  );
};

export default Game;
