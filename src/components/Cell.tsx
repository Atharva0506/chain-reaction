import React from "react";

interface CellProps {
  row: number;
  column: number;
  onClick: (row: number, column: number) => void;
  currentPlayer: number; 
  player: number;
  atoms: number;
}


const playerColors = [
  "bg-white",     
  "bg-red-500",   
  "bg-blue-500",  
  "bg-green-500", 
  "bg-yellow-500",
  "bg-purple-500",]


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

  return (
    <div
      className={`w-10 h-10 border border-[#0f172a] cursor-pointer ${
        playerColors[player] 
      }`}
      onClick={handleClick}
    >
      {atoms > 0 && (
        <div className="w-full h-full flex justify-center items-center">
          {atoms}
        </div>
      )}
    </div>
  );
};

export default Cell;