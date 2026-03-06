export const BOARD_ROWS = 9;
export const BOARD_COLS = 6;
export const MAX_PLAYERS = 4;
export const TURN_TIMEOUT_MS = 30_000;
export const RECONNECT_GRACE_MS = 15_000;
export const MATCHMAKING_TICK_MS = 2_000;

export type PlayerId = string;
export type MatchId = string;
export type RoomCode = string;

export enum GameMode {
  SINGLE_PLAYER = "single_player",
  MULTIPLAYER = "multiplayer",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum MatchStatus {
  WAITING = "waiting",
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
  ABANDONED = "abandoned",
}

export enum PlayerColor {
  RED = 0,
  GREEN = 1,
  BLUE = 2,
  YELLOW = 3,
}

export const PLAYER_COLORS: Record<PlayerColor, string> = {
  [PlayerColor.RED]: "#ef4444",
  [PlayerColor.GREEN]: "#22c55e",
  [PlayerColor.BLUE]: "#3b82f6",
  [PlayerColor.YELLOW]: "#eab308",
};

export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  orbs: number;
  owner: PlayerColor | null;
}

export type Board = Cell[][];

export interface Player {
  id: PlayerId;
  name: string;
  color: PlayerColor;
  isAlive: boolean;
  isBot: boolean;
  difficulty?: Difficulty;
}

export interface GameState {
  matchId: MatchId;
  board: Board;
  players: Player[];
  currentTurn: number;
  turnNumber: number;
  status: MatchStatus;
  winner: PlayerId | null;
  lastMove: Position | null;
  explosions: Position[];
}

export interface CellDiff {
  row: number;
  col: number;
  orbs: number;
  owner: PlayerColor | null;
}

export interface BoardDiff {
  changes: CellDiff[];
  explosions: Position[];
}

export enum ClientEvent {
  JOIN_MATCH = "JOIN_MATCH",
  MAKE_MOVE = "MAKE_MOVE",
  PING = "PING",
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  SPECTATE = "SPECTATE",
  LEAVE_MATCH = "LEAVE_MATCH",
  START_SINGLE_PLAYER = "START_SINGLE_PLAYER",
  QUEUE_MATCHMAKING = "QUEUE_MATCHMAKING",
  CANCEL_MATCHMAKING = "CANCEL_MATCHMAKING",
}

export enum ServerEvent {
  MATCH_START = "MATCH_START",
  BOARD_UPDATE = "BOARD_UPDATE",
  TURN_CHANGE = "TURN_CHANGE",
  MATCH_END = "MATCH_END",
  ERROR = "ERROR",
  PONG = "PONG",
  ROOM_CREATED = "ROOM_CREATED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  PLAYER_RECONNECTED = "PLAYER_RECONNECTED",
  MATCHMAKING_STATUS = "MATCHMAKING_STATUS",
  CHAIN_REACTION = "CHAIN_REACTION",
}

export interface ClientMessage {
  event: ClientEvent;
  payload: unknown;
}

export interface ServerMessage {
  event: ServerEvent;
  payload: unknown;
}

export interface JoinMatchPayload {
  matchId: MatchId;
  playerId: PlayerId;
  token: string;
}

export interface MakeMovePayload {
  matchId: MatchId;
  position: Position;
}

export interface CreateRoomPayload {
  playerCount: number;
}

export interface JoinRoomPayload {
  roomCode: RoomCode;
}

export interface StartSinglePlayerPayload {
  difficulty: Difficulty;
  playerName: string;
}

export interface QueueMatchmakingPayload {
  playerName: string;
}

export interface MatchStartPayload {
  matchId: MatchId;
  players: Player[];
  board: Board;
  currentTurn: number;
}

export interface BoardUpdatePayload {
  diff: BoardDiff;
  currentTurn: number;
  turnNumber: number;
  players: Player[];
}

export interface TurnChangePayload {
  currentTurn: number;
  turnNumber: number;
  timeoutMs: number;
}

export interface MatchEndPayload {
  winner: Player;
  finalBoard: Board;
  totalTurns: number;
}

export interface ChainReactionPayload {
  steps: BoardDiff[];
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export interface RoomCreatedPayload {
  roomCode: RoomCode;
  matchId: MatchId;
}

export interface MatchmakingStatusPayload {
  status: "queued" | "matched" | "cancelled";
  matchId?: MatchId;
  estimatedWaitMs?: number;
}

export interface LeaderboardEntry {
  playerId: PlayerId;
  playerName: string;
  wins: number;
  losses: number;
  rating: number;
  rank: number;
}

export interface MatchRecord {
  matchId: MatchId;
  mode: GameMode;
  status: MatchStatus;
  players: { id: PlayerId; name: string; color: PlayerColor }[];
  winnerId: PlayerId | null;
  totalTurns: number;
  startedAt: string;
  endedAt: string | null;
}
