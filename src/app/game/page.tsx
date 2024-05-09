"use client"

import GameBoard from "@/components/GameBoard"

const Home: React.FC = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-6xl font-bold">
            Welcome to Your Game
          </h1>
          <GameBoard />
        </main>
        <footer className="flex items-center justify-center w-full h-24 border-t">
          Footer
        </footer>
      </div>
    );
  };
  
  export default Home;