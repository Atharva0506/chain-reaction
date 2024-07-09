import React from "react";

interface CellProps {
  row: number;
  column: number;
  onClick: (row: number, column: number) => void;
  currentPlayer: number | null; 
  player: number;
  atoms: number;
}

const playerColors = [
  "white",    
  "red",      
  "blue",     
  "green",    
  "yellow",   
  "purple",   
];

const Cell: React.FC<CellProps> = ({
  row,
  column,
  onClick,
  player,
  atoms,
  currentPlayer,
}) => {
  const handleClick = () => {
    if (player === 0 || player === currentPlayer) {
      onClick(row, column); 
    }
  };

  const renderAtoms = () => {
    const atomElements = [];
    for (let i = 0; i < atoms; i++) {
      atomElements.push(
        <circle
          key={i}
          cx="50%"
          cy="50%"
          r="10"
          fill={playerColors[player]}
          className="atom animate-pulse"
          style={{
            transform: `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`,
          }}
        />
      );
    }
    return atomElements;
  };

  return (
    <div
      className={`w-16 h-16 border border-[#0f172a] cursor-pointer relative flex items-center justify-center ${
        playerColors[player]
      }`}
      onClick={handleClick}
    >
      <svg className="w-full h-full">
        {renderAtoms()}
      </svg>
    </div>
  );
};

export default Cell;