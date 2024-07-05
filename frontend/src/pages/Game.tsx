
import { useSocket } from '../hooks/useSocket'

const Game = () => {
  const socket  =  useSocket()

  

  if(!socket) return <div>Connecting...</div>
  return (
    <div>Game</div>
  )
}

export default Game