import { WebSocket } from "ws";

export class Game {
    private p1: WebSocket;
    private p2: WebSocket;

    constructor(p1: WebSocket, p2: WebSocket) {
        this.p1 = p1;
        this.p2 = p2;
    }
}