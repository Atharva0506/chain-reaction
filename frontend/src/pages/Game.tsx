import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import { ChainReactionGame, Cell as CellType } from '../utils/game'; // Assuming you have a similar implementation in the frontend

const Game: React.FC = () => {
  const [game, setGame] = useState(new ChainReactionGame(8, 8, 2));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameState, setGameState] = useState<CellType[][]>(game.grid);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    setGameState(game.grid);
  }, [game]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    setWs(socket);

    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'GAME_STATE') {
        setGameState(data.gameState.grid);
        setCurrentPlayer(data.gameState.currentPlayer);
      }
      if (data.type === 'GAME_OVER') {
        alert(`Game over! Player ${data.winner} wins!`);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (ws) {
      ws.send(JSON.stringify({ type: 'MOVE', move: { row, col } }));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Chain Reaction</h1>
      <GameBoard grid={gameState} onCellClick={handleCellClick} />
      <p className="mt-4 text-white">Current Player: {currentPlayer}</p>
    </div>
  );
}

export default Game;
