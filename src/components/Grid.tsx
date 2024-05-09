import React from 'react';
import GridCell from './GridCell';

interface GridProps {
  grid: number[][];
  onCellClick: (row: number, col: number) => void;
}

const Grid: React.FC<GridProps> = ({ grid, onCellClick }) => {
  return (
    <div className="grid grid-cols-6 gap-1">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GridCell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Grid;