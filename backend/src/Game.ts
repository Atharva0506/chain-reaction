import { WebSocket } from "ws";
import { ChainReactionGame } from "./GameLogic";
export class Game{
    public player1 : WebSocket;
    public player2 :  WebSocket;
    private chainReactionGame  : ChainReactionGame;

    constructor(player1:WebSocket,player2:WebSocket){
        this.player1 = player1;
        this.player2 =  player2;
        this.chainReactionGame = new ChainReactionGame(8,8,2)
    }
    makeMove(socket:WebSocket,move:string){
        // Validation  of Move
        // is it the users move
        // is it vaild move
        
        
        // Upade Board 
        // push the move
        // check the game is Over
        // send updated board to user 
        
    }
}