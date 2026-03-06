"use client";

import { memo, useMemo } from "react";
import { PLAYER_COLORS, type PlayerColor } from "@chain-reaction/types";
import { getCriticalMass } from "@chain-reaction/game-engine";
import { useGameStore } from "@/store/game-store";

interface GameBoardProps {
  onCellClick: (row: number, col: number) => void;
}

export const GameBoard = memo(function GameBoard({ onCellClick }: GameBoardProps) {
  const board = useGameStore((s) => s.board);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const players = useGameStore((s) => s.players);
  const explosions = useGameStore((s) => s.explosions);
  const winner = useGameStore((s) => s.winner);

  const currentPlayer = players[currentTurn];
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const currentColor = currentPlayer ? PLAYER_COLORS[currentPlayer.color] : "#555";

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="grid rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, var(--cell-size))`,
          gridTemplateRows: `repeat(${rows}, var(--cell-size))`,
          gap: "1px",
          backgroundColor: currentColor + "18",
          border: `2px solid ${currentColor}33`,
          borderRadius: "12px",
          boxShadow: `0 0 30px ${currentColor}10, inset 0 0 30px ${currentColor}05`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const mass = getCriticalMass(r, c, rows, cols);
            const isExploding = explosions.some(
              (e) => e.row === r && e.col === c
            );
            const isClickable =
              !winner &&
              currentPlayer &&
              (cell.owner === null || cell.owner === currentPlayer.color);

            return (
              <button
                key={`${r}-${c}`}
                className="relative flex items-center justify-center transition-colors duration-75"
                style={{
                  width: "var(--cell-size)",
                  height: "var(--cell-size)",
                  backgroundColor: cell.owner !== null && cell.orbs > 0
                    ? PLAYER_COLORS[cell.owner] + "08"
                    : "#111",
                  cursor: isClickable ? "pointer" : "default",
                }}
                onClick={() => isClickable && onCellClick(r, c)}
              >
                {isExploding && (
                  <div
                    className="absolute inset-0 explode-flash rounded-md"
                    style={{ backgroundColor: cell.owner !== null ? PLAYER_COLORS[cell.owner] + "44" : "#fff3" }}
                  />
                )}

                {cell.orbs > 0 && cell.owner !== null && (
                  <OrbCluster
                    count={cell.orbs}
                    color={PLAYER_COLORS[cell.owner]}
                    critical={cell.orbs >= mass - 1}
                    exploding={isExploding}
                  />
                )}

                {isClickable && cell.orbs === 0 && (
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
                  >
                    <div
                      className="w-3 h-3 rounded-full opacity-20"
                      style={{ backgroundColor: currentColor }}
                    />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});

const ORB_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0, y: 0 }],
  2: [{ x: -22, y: 0 }, { x: 22, y: 0 }],
  3: [{ x: 0, y: -18 }, { x: -18, y: 14 }, { x: 18, y: 14 }],
  4: [{ x: -16, y: -16 }, { x: 16, y: -16 }, { x: -16, y: 16 }, { x: 16, y: 16 }],
};

function OrbCluster({
  count,
  color,
  critical,
  exploding,
}: {
  count: number;
  color: string;
  critical: boolean;
  exploding: boolean;
}) {
  const positions = ORB_POSITIONS[Math.min(count, 4)] || ORB_POSITIONS[4];
  const size = count === 1 ? 40 : count === 2 ? 32 : 26;

  return (
    <div className="absolute inset-0">
      {positions.map((pos, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${
            exploding ? "explode-flash" : critical ? "orb-critical" : "orb-wobble"
          }`}
          style={{
            width: `${size}%`,
            height: `${size}%`,
            left: `calc(50% + ${pos.x}%)`,
            top: `calc(50% + ${pos.y}%)`,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at 35% 30%, ${lighten(color, 60)}, ${color} 50%, ${darken(color, 30)} 100%)`,
            boxShadow: `
              0 0 ${critical ? 14 : 7}px ${color}${critical ? "bb" : "55"},
              inset 0 -2px 4px ${darken(color, 40)}88,
              inset 0 2px 4px ${lighten(color, 80)}44
            `,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function lighten(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = pct / 100;
  return `rgb(${Math.min(255, Math.round(r + (255 - r) * f))},${Math.min(255, Math.round(g + (255 - g) * f))},${Math.min(255, Math.round(b + (255 - b) * f))})`;
}

function darken(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - pct / 100;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}
