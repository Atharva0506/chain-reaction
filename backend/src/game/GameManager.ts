import { WebSocket } from "ws";
import { INIT_GAME, MOVE, GAME_OVER, INVALID_MOVE } from "../message";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(ws: WebSocket) {
    this.users.push(ws);
    this.handleMessage(ws);
  }

  removeUser(ws: WebSocket) {
    this.users = this.users.filter((user) => user !== ws);
    const game = this.games.find(
      (game) => game.player1 === ws || game.player2 === ws
    );
    if (game) {
      const opponent = game.player1 === ws ? game.player2 : game.player1;
      this.endGame(game, opponent);
    }
  }

  private handleMessage(ws: WebSocket) {
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === INIT_GAME) {
          if (this.pendingUser) {
            const game = new Game(this.pendingUser, ws);
            this.games.push(game);

            this.pendingUser.send(JSON.stringify({ type: INIT_GAME }));
            ws.send(JSON.stringify({ type: INIT_GAME }));

            this.pendingUser = null;
          } else {
            this.pendingUser = ws;
          }
        } else if (message.type === MOVE) {
          const game = this.games.find(
            (game) => game.player1 === ws || game.player2 === ws
          );
          if (game) {
            const moveResult = game.makeMove(ws, message.move);
            if (moveResult.valid) {
              this.broadcastMove(game, message.move, ws);
              if (moveResult.gameOver) {
                this.endGame(game, ws);
              }
            } else {
              ws.send(
                JSON.stringify({
                  type: INVALID_MOVE,
                  message: "Invalid move! Try again.",
                })
              );
            }
          }
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.close();
      }
    });

    ws.on("close", () => this.removeUser(ws));
  }

  private broadcastMove(game: Game, move: any, currentPlayer: WebSocket) {
    const opponent = game.player1 === currentPlayer ? game.player2 : game.player1;
    currentPlayer.send(
      JSON.stringify({ type: MOVE, payload: { move, yourMove: true } })
    );
    opponent.send(
      JSON.stringify({ type: MOVE, payload: { move, yourMove: false } })
    );
  }

  private endGame(game: Game, winner: WebSocket) {
    const loser = game.player1 === winner ? game.player2 : game.player1;

    winner.send(JSON.stringify({ type: GAME_OVER, payload: { winner: "You" } }));
    loser.send(
      JSON.stringify({ type: GAME_OVER, payload: { winner: "Opponent" } })
    );

    this.games = this.games.filter((g) => g !== game);
  }
}
