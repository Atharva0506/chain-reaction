'use client'

import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 8;

const Home = () => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(Array(GRID_SIZE).fill({ player: 0, atoms: 0 })));
  const [status, setStatus] = useState('Connecting...');
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false); // Track if waiting for an opponent
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => setStatus('Connected');
    ws.current.onmessage = (message) => handleWebSocketMessage(JSON.parse(message.data));
    ws.current.onclose = () => setStatus('Disconnected');

    return () => ws.current?.close();
  }, []);

  const handleWebSocketMessage = (data: any) => {
    if (data.type === 'waiting') {
      setStatus(data.message);
      setWaitingForOpponent(true); // Show that waiting for an opponent
    } else if (data.type === 'INIT_GAME') {
      setStatus('Game Started');
      setIsMyTurn(data.payload.isMyTurn); // Server sends initial turn status
      setWaitingForOpponent(false); // Once game starts, stop waiting
    } else if (data.type === 'MOVE') {
      const { move, yourMove } = data.payload;
      updateGrid(move.row, move.col, yourMove);
      setIsMyTurn(yourMove); // Update turn based on server response
    } else if (data.type === 'GAME_OVER') {
      setStatus(`Game Over! Winner: ${data.payload.winner}`);
    } else if (data.type === 'INVALID_MOVE') {
      setStatus(data.message);
    } else if (data.type === 'CURRENT_STATE') {
      setGrid(data.payload.grid);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) {
      setStatus("Not your turn!");
      return;
    }

    ws.current?.send(JSON.stringify({ type: 'MOVE', payload: { row, col } }));
  };

  const updateGrid = (row: number, col: number, myMove: boolean) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[row][col] = {
        player: myMove ? 1 : 2,
        atoms: newGrid[row][col].atoms + 1,
      };
      return newGrid;
    });
  };

  const handlePlayClick = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'ADD_USER' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Chain Reaction Game</h1>
      <div className="mb-4 text-xl text-gray-700">{status}</div>

      {/* Show "Play" button only if not waiting for opponent */}
      {!waitingForOpponent && status !== 'Game Started' && (
        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded-md mb-4" 
          onClick={handlePlayClick}>
          Play
        </button>
      )}

      <div className="grid grid-cols-8 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex items-center justify-center text-white font-bold ${
                cell.player === 1 ? 'bg-blue-500' : cell.player === 2 ? 'bg-yellow-500' : 'bg-gray-300'
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell.atoms > 0 ? cell.atoms : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
