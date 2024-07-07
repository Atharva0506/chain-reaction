import React from 'react';
import Cell from './Cell';

interface GameBoardProps {
  board: { player: number; atoms: number }[][];
  onCellClick: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick }) => {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${board[0].length}, 3rem)` }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            player={cell.player}
            atoms={cell.atoms}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;