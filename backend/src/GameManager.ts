import { WebSocket } from "ws";

export class GameManager{
    private games: Game[];
    private pendingUser : WebSocket;
    private users : WebSocket[]
    constructor(){
        this.games = []
    }

    addUser(socket:  WebSocket){
        this.users.push(socket)
    }
    removeUser(socket:WebSocket){
        this.users =  this.users.filter(user => user !== socket)
    }
    private handleMsg(){

    }
}