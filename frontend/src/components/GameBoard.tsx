import React from 'react';
import Cell from './Cell';
import { Cell as CellType } from '../utils/game';

interface GameBoardProps {
  grid: CellType[][];
  onCellClick: (row: number, col: number) => void;
}
const GameBoard: React.FC<GameBoardProps> = ({ grid, onCellClick }) => {
  return (
    <div className="grid grid-cols-8 gap-1">
      {grid.map((row, rowIndex) => 
        row.map((cell, colIndex) => (
          <Cell 
            key={`${rowIndex}-${colIndex}`} 
            row={rowIndex} 
            col={colIndex} 
            player={cell.player} 
            atoms={cell.atoms}
            onCellClick={onCellClick}
          />
        ))
      )}
    </div>
  );
}

export default GameBoard;
