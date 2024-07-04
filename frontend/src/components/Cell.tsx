import React from 'react';

interface CellProps {
  row: number;
  col: number;
  player: number;
  atoms: number;
  onCellClick: (row: number, col: number) => void;
}
const Cell: React.FC<CellProps> = ({ row, col, player, atoms, onCellClick }) => {
  const handleClick = () => {
    onCellClick(row, col);
  };

  const getPlayerColor = (player: number) => {
    switch(player) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-blue-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div 
      className={`w-16 h-16 flex items-center justify-center border ${getPlayerColor(player)}`}
      onClick={handleClick}
    >
      {atoms > 0 && <span>{atoms}</span>}
    </div>
  );
}

export default Cell;
