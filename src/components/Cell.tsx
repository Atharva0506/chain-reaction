// components/Cell.tsx
import React from 'react';

interface CellProps {
  row: number;
  column: number;
  onClick: (row: number, column: number) => void;
  currentPlayer: number; // Add currentPlayer prop
  player: number;
  atoms: number;
}

const Cell: React.FC<CellProps> = ({ row, column, onClick, player, atoms,currentPlayer }) => {
  const handleClick = () => {
    // Check if the cell is empty or belongs to the current player before allowing placement
    if (player === 0 || player === currentPlayer) {
      onClick(row, column); // Call onClick callback to place atom
    }
  };

  return (
    <div
      className={`w-10 h-10 border border-[#0f172a] cursor-pointer ${
        player === 0 ? 'bg-white' : player === 1 ? 'bg-red-500' : 'bg-blue-500'
      }`}
      onClick={handleClick}
    >
      {atoms > 0 && <div className="w-full h-full flex justify-center items-center">{atoms}</div>}
    </div>
  );
};

export default Cell;

