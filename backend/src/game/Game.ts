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
        this.chainReactionGame = new ChainReactionGame(8, 8, 2);

        // Set initial turns correctly: player1 (blue) starts, player2 (yellow) waits
        console.log("Starting game: player1 = blue, player2 = yellow");
        this.player1.send(JSON.stringify({ type: INIT_GAME, payload: { color: "blue", isMyTurn: true } }));
        this.player2.send(JSON.stringify({ type: INIT_GAME, payload: { color: "yellow", isMyTurn: false } }));

        this.player1.send(JSON.stringify({ type: "player_joined" }));
        this.player2.send(JSON.stringify({ type: "player_joined" }));
    }

    // Make a move in the game
    makeMove(socket: WebSocket, move: { row: string; col: string }) {
        console.log("Processing move:", move);  // Log the move

        const currentPlayer = socket === this.player1 ? 1 : 2;
        console.log("Current player:", currentPlayer); // Log the current player

        // Check if it's the player's turn
        if (currentPlayer !== this.chainReactionGame.currentPlayer) {
            socket.send(JSON.stringify({ type: INVALID_MOVE, message: "Not your turn!" }));
            return { valid: false, gameOver: false };
        }

        // Process the move
        const isValidMove = this.chainReactionGame.placeAtom(Number(move.row), Number(move.col));
        if (isValidMove) {
            const gameState = {
                grid: this.chainReactionGame.grid,
                currentPlayer: this.chainReactionGame.currentPlayer
            };
            this.broadcastGameState(gameState);
        } else {
            socket.send(JSON.stringify({ type: INVALID_MOVE, message: "Invalid move!" }));
            return { valid: false, gameOver: false };
        }

        // Check for game over
        const gameOverState = this.chainReactionGame.isGameOver();
        if (gameOverState.gameOver) {
            this.broadcastGameOver(String(gameOverState.winner));
            return { valid: true, gameOver: true };
        }

        // Switch turn
        this.chainReactionGame.switchPlayer();
        this.updateTurnStatus();

        return { valid: true, gameOver: false };
    }

    // Broadcast game state
    private broadcastGameState(gameState: any) {
        console.log("Broadcasting game state:", gameState);  // Log game state
        this.player1.send(JSON.stringify({ type: CURRENT_STATE, payload: gameState, yourMove: this.chainReactionGame.currentPlayer === 1 }));
        this.player2.send(JSON.stringify({ type: CURRENT_STATE, payload: gameState, yourMove: this.chainReactionGame.currentPlayer === 2 }));
    }

    // Update turn status after each move
    private updateTurnStatus() {
        this.player1.send(JSON.stringify({ type: "UPDATE_TURN", yourMove: this.chainReactionGame.currentPlayer === 1 }));
        this.player2.send(JSON.stringify({ type: "UPDATE_TURN", yourMove: this.chainReactionGame.currentPlayer === 2 }));
    }

    // Broadcast game over state
    private broadcastGameOver(winner: string) {
        const gameOverMessage = JSON.stringify({
            type: GAME_OVER,
            payload: { winner }
        });
        this.player1.send(gameOverMessage);
        this.player2.send(gameOverMessage);
    }
}
