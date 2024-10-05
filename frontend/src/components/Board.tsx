"use client";
import React, { useEffect, useState } from "react";
import Cell from "./Cell";
import { ChainReactionGame, Cell as GameCell } from "@/utils/Game";

interface BoardProps {
  rows: number;
  cols: number;
  initialBoard: GameCell[][];
  socket: WebSocket;
}

const Board: React.FC<BoardProps> = ({ rows, cols, initialBoard, socket }) => {
  const [game] = useState(new ChainReactionGame(rows, cols, 2)); 
  const [board, setBoard] = useState<GameCell[][]>(initialBoard);

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "current_state":
          setBoard(message.payload.grid);
          break;
        case "move":
          const { row, col } = message.payload;
          // Apply the move received from the other player
          if (game.placeAtom(row, col)) {
            setBoard([...game.grid]); // Update the local board state
            console.log("Move received from another player", row, col);
          } else {
            // Send back an invalid move message
            socket.send(
              JSON.stringify({
                type: "invalid_move",
                payload: { row, col },
              })
            );
          }
          break;
        case "game_over":
          console.log("Game over, winner:", message.payload.winner);
          break;
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket, game]);

  if (!socket) return <div>Connecting...</div>;

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (game.placeAtom(rowIndex, colIndex)) {
      setBoard([...game.grid]);
      socket.send(
        JSON.stringify({
          type: "move",
          move: { row: rowIndex, col: colIndex },
        })
      );
    } else {
      socket.send(
        JSON.stringify({
          type: "invalid_move",
          move: { row: rowIndex, col: colIndex },
        })
      );
    }
  };

  return (
    <div
      className="grid gap-0 w-full max-w-[400px] h-full max-h-[400px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`}>
            <Cell
              value={cell.atoms}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
