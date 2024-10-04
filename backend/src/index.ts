import { WebSocketServer } from 'ws';
import { GameManager } from './game/GameManager';

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager()
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
    gameManager.addUser(ws)
    ws.on('disconnect',()=>{gameManager.removeUser(ws)})
});