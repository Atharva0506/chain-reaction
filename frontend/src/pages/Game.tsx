import  { useEffect, useState } from 'react'
import GameBoard from '../components/GameBoard'
import { Button } from '../components/Button'
import { useSocket } from '../hooks/useSocket'

export const INIT_MESSAGE = "INIT_MSG"
export const MOVE =  "MOVE"
export const CURRENT_SATTE = "GAME_STATE"
export const GAME_OVER = "GAME_OVER"


const Game = () => {

  const socket =  useSocket();
  useEffect(() => {
    if (!socket) { 
      console.log("Socket is not available");
      return; 
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message);

      switch (message.type) {
        case INIT_MESSAGE:
          alert("xxxxxx");
          console.log("Init Message");
          break;
        case MOVE:
          console.log("Move Message");
          break;
        case CURRENT_STATE:
          console.log("Current State Message");
          break;
        case GAME_OVER:
          console.log("Game Over Message");
          break;
        default:
          console.log("Unknown message type:", message.type);
      }
    };
  }, [socket]);

  // if(!socket) return <div>Connectingg...</div>
  return (
    <div className='h-screen bg-white flex justify-around items-center'>
      <div className=''>
        <GameBoard />
      </div>
      <div>
        <Button onClick={()=>{
          socket.send(JSON.stringify({
            type: INIT_MESSAGE
          }))
        }}>
          Play
        </Button>
      </div>
    </div>
  )
}

export default Game