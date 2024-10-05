import { WebSocketServer } from 'ws';
import { GameManager } from './game/GameManager';

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);
  gameManager.addUser(ws);

  ws.on('close', (code, reason) => {
    console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
    gameManager.removeUser(ws);
  });
});