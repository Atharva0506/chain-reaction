// components/GridCell.tsx

import React from 'react';

interface GridCellProps {
  value: number;
  onClick: () => void;
}

const GridCell: React.FC<GridCellProps> = ({ value, onClick }) => {
  return (
    <div
      className={`w-12 h-12 border border-gray-300 flex items-center justify-center cursor-pointer ${
        value === 0 ? 'bg-white' : value === 1 ? 'bg-blue-500' : 'bg-red-500'
      }`}
      onClick={onClick}
    >
      <span className="text-white">{value}</span>
    </div>
  );
};

export default GridCell;
