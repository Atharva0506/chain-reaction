import { WebSocket } from "ws";
import { ChainReactionGame } from "./gameLogic";
import { CURRENT_STATE, GAME_OVER, INIT_GAME, INVALID_MOVE } from "../message";
export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private chainReactionGame: ChainReactionGame;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.chainReactionGame = new ChainReactionGame(8, 8, 2)
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "blue"
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "yellow"
            }
        }));
    }
    makeMove(socket: WebSocket, move: { row: string; col: string }) {
        const currentPlayer = socket === this.player1 ? 1 : 2;
        if (currentPlayer !== this.chainReactionGame.currentPlayer) {
           
            socket.send(JSON.stringify({ type: INVALID_MOVE, message: "Not your turn!" }));
            return;
        }
        const isValidMove = this.chainReactionGame.placeAtom(Number(move.row), Number(move.col))
            // Validate the move and update the game state
            if (isValidMove) {
                const gameState = {
                    grid: this.chainReactionGame.grid,
                    currentPlayer: this.chainReactionGame.currentPlayer
                };
                this.broadcastGameState(gameState);
            } else {
                socket.send(JSON.stringify({ type: INVALID_MOVE, message: "Invalid move!" }));
            }
    
            const gameOverState = this.chainReactionGame.isGameOver();
            if (gameOverState.gameOver) {
                this.broadcastGameOver(String(gameOverState.winner));
            } else {
                this.chainReactionGame.switchPlayer();
            }
        }
    
        private broadcastGameState(gameState: any) {
            this.player1.send(JSON.stringify({ type: CURRENT_STATE, payload: gameState }));
            this.player2.send(JSON.stringify({ type: CURRENT_STATE, payload: gameState }));
        }
    
        private broadcastGameOver(winner: string) {
            const gameOverMessage = JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner
                }
            });
    
            this.player1.send(gameOverMessage);
            this.player2.send(gameOverMessage);

    }
}