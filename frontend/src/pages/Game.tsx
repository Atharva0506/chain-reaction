import { Button } from "../components/Button";
import GameBoard from "../components/GameBoard";
import { useSocket } from "../hooks/useSocket";

const Game = () => {
  const socket = useSocket();

  // if(!socket) return <div>Connecting...</div>
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl p-4">
        {/* Game Board */}
        <div className=" p-8 shadow-lg mb-4 lg:mb-0 lg:mr-4 flex-1">
          <h2 className="text-xl font-bold text-white">Game Board</h2>
         <GameBoard/>
        </div>
        <div className="p-8 shadow-lg flex-1">
          <h2 className="text-xl font-bold">Buttons</h2>
          <Button > Play Now</Button>
        </div>
      </div>
    </div>
  );
};

export default Game;
