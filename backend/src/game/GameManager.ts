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
    if (this.pendingUser) {
      // If there's already a pending user, start a new game with both users
      const player1 = this.pendingUser;
      const player2 = ws;
      const game = new Game(player1, player2); // Assuming Game takes two players
      this.games.push(game);
      this.pendingUser = null;

      // Notify both players that the game has started
      player1.send(JSON.stringify({ type: INIT_GAME }));
      player2.send(JSON.stringify({ type: INIT_GAME }));
      
      console.log("Game started between two players");

    } else {
      // If no pending user, make this user the pending user
      this.pendingUser = ws;
      ws.send(JSON.stringify({ type: "waiting", message: "Waiting for an opponent..." }));
      console.log("Waiting for an opponent...");
    }
    
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
        console.log("Received message:", message); // Add this line to log incoming messages
    
        if (message.type === MOVE) {
          console.log("Move message received:", message.payload); // Log the move data
          const game = this.games.find(
            (game) => game.player1 === ws || game.player2 === ws
          );
          if (game) {
            // Extract move from message.payload, not message.move
            const { row, col } = message.payload;
            const moveResult = game.makeMove(ws, { row, col }); // Pass the move data properly
            if (moveResult.valid) {
              this.broadcastMove(game, { row, col }, ws); // Broadcast the correct move
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
