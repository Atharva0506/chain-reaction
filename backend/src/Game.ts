import { WebSocket } from "ws";
import { ChainReactionGame } from "./GameLogic";
import { CURRENT_SATTE, GAME_OVER } from "./messages";
export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private chainReactionGame: ChainReactionGame;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.chainReactionGame = new ChainReactionGame(8, 8, 2)
    }
    makeMove(socket: WebSocket, move: { row: string; col: string }) {
        const currentPlayer = socket === this.player1 ? 1 : 2;

        const isValidMove = this.chainReactionGame.placeAtom(Number(move.row), Number(move.col))
        // Validation  of Move
        try {
            if (isValidMove) {
                const gameState = {
                    grid: this.chainReactionGame.grid,
                    currentPlayer: this.chainReactionGame.currentPlayer
                }
                this.player1.send(JSON.stringify({ type: CURRENT_SATTE, gameState }));
                this.player2.send(JSON.stringify({ type: CURRENT_SATTE, gameState }));
            };
        } catch (error) {
            console.log(error)
        }

        const gameOverState = this.chainReactionGame.isGameOver();

        if (gameOverState.gameOver) {
            this.player1.send(JSON.stringify({ type: GAME_OVER, winner: gameOverState.winner }));
            this.player2.send(JSON.stringify({ type: GAME_OVER, winner: gameOverState.winner }));
        } else {
            this.chainReactionGame.switchPlayer();
        }


    }
}