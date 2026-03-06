import { useRef, useCallback, useEffect } from "react";
import {
  ClientEvent,
  ServerEvent,
  type ClientMessage,
  type ServerMessage,
  type MatchStartPayload,
  type BoardUpdatePayload,
  type TurnChangePayload,
  type MatchEndPayload,
  type ChainReactionPayload,
  type ErrorPayload,
  type RoomCreatedPayload,
  type MatchmakingStatusPayload,
  RECONNECT_GRACE_MS,
} from "@chain-reaction/types";
import { useGameStore } from "@/store/game-store";
import { useConnectionStore } from "@/store/connection-store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingStartRef = useRef<number>(0);

  const send = useCallback((event: ClientEvent, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { event, payload };
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const handleMessage = useCallback(
    (data: string) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(data);
      } catch {
        return;
      }

      switch (msg.event) {
        case ServerEvent.MATCH_START: {
          const p = msg.payload as MatchStartPayload;
          useGameStore.getState().setMatch(p.matchId, p.players, p.board, p.currentTurn);
          break;
        }
        case ServerEvent.BOARD_UPDATE: {
          const p = msg.payload as BoardUpdatePayload;
          const store = useGameStore.getState();
          const newBoard = store.board.map((row) => row.map((cell) => ({ ...cell })));
          for (const change of p.diff.changes) {
            newBoard[change.row][change.col] = {
              orbs: change.orbs,
              owner: change.owner,
            };
          }
          store.updateBoard(newBoard, p.diff, p.currentTurn, p.turnNumber, p.players);
          break;
        }
        case ServerEvent.TURN_CHANGE: {
          const _p = msg.payload as TurnChangePayload;
          break;
        }
        case ServerEvent.MATCH_END: {
          const p = msg.payload as MatchEndPayload;
          useGameStore.getState().setWinner(p.winner);
          break;
        }
        case ServerEvent.CHAIN_REACTION: {
          const _p = msg.payload as ChainReactionPayload;
          break;
        }
        case ServerEvent.ERROR: {
          const p = msg.payload as ErrorPayload;
          console.error(`[WS Error] ${p.code}: ${p.message}`);
          break;
        }
        case ServerEvent.ROOM_CREATED: {
          const _p = msg.payload as RoomCreatedPayload;
          break;
        }
        case ServerEvent.MATCHMAKING_STATUS: {
          const _p = msg.payload as MatchmakingStatusPayload;
          break;
        }
        case ServerEvent.PONG: {
          const latency = Date.now() - pingStartRef.current;
          useConnectionStore.getState().setLatency(latency);
          break;
        }
        default:
          break;
      }
    },
    []
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      useConnectionStore.getState().setConnected(true);
      useConnectionStore.getState().setReconnecting(false);

      pingIntervalRef.current = setInterval(() => {
        pingStartRef.current = Date.now();
        send(ClientEvent.PING, {});
      }, 5000);
    };

    ws.onmessage = (e) => {
      handleMessage(e.data);
    };

    ws.onclose = () => {
      useConnectionStore.getState().setConnected(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      useConnectionStore.getState().setReconnecting(true);
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_GRACE_MS);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [handleMessage, send]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    useConnectionStore.getState().setConnected(false);
    useConnectionStore.getState().setReconnecting(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, send };
}
