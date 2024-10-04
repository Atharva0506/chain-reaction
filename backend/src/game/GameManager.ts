import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "../message";
import { Game } from "./Game";


export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = []
    }

    addUser(ws: WebSocket) {
        this.users.push(ws)
        this.handleMessage(ws)
    }

    removeUser(ws: WebSocket) {
        this.users = this.users.filter((user) => user !== ws)
        //stop the game
    }

    private handleMessage(ws: WebSocket) {
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString())
// ============================= Move THis To diffrent File  ================================ //
           // ========== INIT GAME =========== //
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, ws)
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = ws;
                }
            }

            // ========= HANDLE MOVES ============= //
            if(message.type === MOVE){
                const game = this.games.find(game => game.player1 === ws || game.player2 === ws)
                if (game) {
                    game.makeMove(ws, message.move)
                }
            }
        })
    }
}