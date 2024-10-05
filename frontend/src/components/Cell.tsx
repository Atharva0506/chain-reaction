import React from "react";

interface CellProps {
  value: number;
  onClick: () => void;
}

const getOrbColor = (value: number) => {
  switch (value) {
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-green-500";
    case 3:
      return "bg-blue-500";
    case 4:
      return "bg-yellow-500";
    case 5:
      return "bg-purple-500";
    case 6:
      return "bg-white";
    default:
      return "bg-transparent";
  }
};

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
  const orbColor = getOrbColor(value);

  return (
    <div
      className="w-16 h-16 flex items-center justify-center border border-gray-600"
      onClick={onClick}
    >
      {value > 0 && (
        <div className={`w-12 h-12 ${orbColor} rounded-full`}></div>
      )}
    </div>
  );
};

export default Cell;
