
"use client"


import React, { useState } from 'react';
import Grid from '@/components/Grid';

const GRID_ROWS = 9;
const GRID_COLS = 6;

const IndexPage: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0)));

  const handleCellClick = (row: number, col: number) => {
    console.log("The Clicked Row And Cols Are" + row + "col: " + col)
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Grid grid={grid} onCellClick={handleCellClick} />
    </div>
  );
};

export default IndexPage;


