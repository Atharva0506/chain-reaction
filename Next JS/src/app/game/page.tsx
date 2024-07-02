"use client"

import React from 'react';
import Header from '@/components/Header';
import GameBoard from '@/components/GameBoard';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <Header />
      <div className="flex justify-center mt-8">
        <GameBoard rows={9} columns={6} />
      </div>
    </div>
  );
};

export default Home;