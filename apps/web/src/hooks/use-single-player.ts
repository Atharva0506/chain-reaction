import { useCallback, useRef } from "react";
import {
  type Board,
  type Player,
  type Position,
  Difficulty,
  PlayerColor,
} from "@chain-reaction/types";
import {
  createEmptyBoard,
  isValidMove,
  applyMove,
  checkWinner,
  getAIMove,
} from "@chain-reaction/game-engine";
import { useGameStore } from "@/store/game-store";

const PLAYERS: Player[] = [
  { id: "human", name: "You", color: PlayerColor.RED, isAlive: true, isBot: false },
  { id: "bot", name: "Bot", color: PlayerColor.GREEN, isAlive: true, isBot: true, difficulty: Difficulty.MEDIUM },
];

function makePlayers(diff: Difficulty): Player[] {
  return [
    { id: "human", name: "You", color: PlayerColor.RED, isAlive: true, isBot: false },
    { id: "bot", name: "Bot", color: PlayerColor.GREEN, isAlive: true, isBot: true, difficulty: diff },
  ];
}

export function useSinglePlayer() {
  const boardRef = useRef<Board>(createEmptyBoard());
  const difficultyRef = useRef<Difficulty>(Difficulty.MEDIUM);
  const turnRef = useRef(0);
  const turnNumberRef = useRef(0);
  const processingRef = useRef(false);
  const playersRef = useRef<Player[]>(PLAYERS);

  const start = useCallback((diff: Difficulty) => {
    difficultyRef.current = diff;
    const board = createEmptyBoard();
    boardRef.current = board;
    turnRef.current = 0;
    turnNumberRef.current = 0;
    processingRef.current = false;
    const p = makePlayers(diff);
    playersRef.current = p;
    useGameStore.getState().setMatch("single-player", p, board, 0);
  }, []);

  const makeMove = useCallback((position: Position) => {
    if (processingRef.current) return;
    if (turnRef.current !== 0) return;

    const store = useGameStore.getState();
    if (store.winner) return;

    const players = playersRef.current;
    const currentPlayer = players[0];
    if (!isValidMove(boardRef.current, position, currentPlayer.color)) return;

    processingRef.current = true;
    const { finalBoard, steps } = applyMove(
      boardRef.current,
      position,
      currentPlayer.color
    );
    boardRef.current = finalBoard;
    turnNumberRef.current++;

    const winner = checkWinner(finalBoard, players, turnNumberRef.current);
    if (winner) {
      store.updateBoard(
        finalBoard,
        { changes: [], explosions: steps.flatMap((s) => s.diff.explosions) },
        0,
        turnNumberRef.current,
        players
      );
      store.setWinner(winner);
      processingRef.current = false;
      return;
    }

    turnRef.current = 1;
    store.updateBoard(
      finalBoard,
      { changes: [], explosions: steps.flatMap((s) => s.diff.explosions) },
      1,
      turnNumberRef.current,
      players
    );

    setTimeout(() => {
      const botPlayer = players[1];
      const botMove = getAIMove(
        boardRef.current,
        botPlayer,
        players,
        difficultyRef.current,
        turnNumberRef.current
      );
      const botResult = applyMove(
        boardRef.current,
        botMove,
        botPlayer.color
      );
      boardRef.current = botResult.finalBoard;
      turnNumberRef.current++;

      const botWinner = checkWinner(botResult.finalBoard, players, turnNumberRef.current);
      turnRef.current = 0;

      useGameStore.getState().updateBoard(
        botResult.finalBoard,
        {
          changes: [],
          explosions: botResult.steps.flatMap((s) => s.diff.explosions),
        },
        0,
        turnNumberRef.current,
        players
      );

      if (botWinner) {
        useGameStore.getState().setWinner(botWinner);
      }
      processingRef.current = false;
    }, 600);
  }, []);

  return { start, makeMove, difficulty: difficultyRef.current };
}
