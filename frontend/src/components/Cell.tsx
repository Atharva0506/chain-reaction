import React from 'react';

interface CellProps {
  player: number;
  atoms: number;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ player, atoms, onClick }) => {
  const playerColors = ['bg-white', 'bg-red-500', 'bg-blue-500'];

  return (
    <div
      className={`flex items-center justify-center border border-black w-12 h-12 cursor-pointer ${playerColors[player]} text-white`}
      onClick={onClick}
    >
      {atoms}
    </div>
  );
};

export default Cell;