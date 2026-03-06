import { create } from "zustand";
import type {
  Board,
  Player,
  MatchId,
  PlayerId,
  MatchStatus,
  Position,
  BoardDiff,
} from "@chain-reaction/types";
import { createEmptyBoard } from "@chain-reaction/game-engine";

interface GameStore {
  matchId: MatchId | null;
  board: Board;
  players: Player[];
  currentTurn: number;
  turnNumber: number;
  status: MatchStatus | null;
  winner: Player | null;
  lastMove: Position | null;
  explosions: Position[];
  animating: boolean;
  playerId: PlayerId | null;

  setMatch: (matchId: MatchId, players: Player[], board: Board, currentTurn: number) => void;
  updateBoard: (board: Board, diff: BoardDiff, currentTurn: number, turnNumber: number, players: Player[]) => void;
  setWinner: (winner: Player) => void;
  setStatus: (status: MatchStatus) => void;
  setExplosions: (explosions: Position[]) => void;
  setAnimating: (animating: boolean) => void;
  setPlayerId: (id: PlayerId) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  matchId: null,
  board: createEmptyBoard(),
  players: [],
  currentTurn: 0,
  turnNumber: 0,
  status: null,
  winner: null,
  lastMove: null,
  explosions: [],
  animating: false,
  playerId: null,

  setMatch: (matchId, players, board, currentTurn) =>
    set({ matchId, players, board, currentTurn, status: "in_progress" as MatchStatus, winner: null, turnNumber: 0 }),

  updateBoard: (board, diff, currentTurn, turnNumber, players) =>
    set({
      board,
      currentTurn,
      turnNumber,
      players,
      explosions: diff.explosions,
      lastMove: diff.changes[0] ? { row: diff.changes[0].row, col: diff.changes[0].col } : null,
    }),

  setWinner: (winner) => set({ winner, status: "finished" as MatchStatus }),
  setStatus: (status) => set({ status }),
  setExplosions: (explosions) => set({ explosions }),
  setAnimating: (animating) => set({ animating }),
  setPlayerId: (playerId) => set({ playerId }),
  reset: () =>
    set({
      matchId: null,
      board: createEmptyBoard(),
      players: [],
      currentTurn: 0,
      turnNumber: 0,
      status: null,
      winner: null,
      lastMove: null,
      explosions: [],
      animating: false,
    }),
}));
