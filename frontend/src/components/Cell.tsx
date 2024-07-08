import React from 'react';

interface CellProps {
  player: number;
  atoms: number;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ player, atoms, onClick }) => {
  return (
    <div className="cell" onClick={onClick}>
      {/* Render cell content based on player and atoms */}
      {atoms > 0 && <div>{`P${player}: ${atoms}`}</div>}
    </div>
  );
};

export default Cell;
