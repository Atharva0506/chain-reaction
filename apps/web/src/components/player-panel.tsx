"use client";

import { PLAYER_COLORS } from "@chain-reaction/types";
import { countPlayerOrbs } from "@chain-reaction/game-engine";
import { useGameStore } from "@/store/game-store";

export function PlayerPanel() {
  const players = useGameStore((s) => s.players);
  const currentTurn = useGameStore((s) => s.currentTurn);
  const board = useGameStore((s) => s.board);
  const winner = useGameStore((s) => s.winner);

  const currentPlayer = players[currentTurn];
  const currentColor = currentPlayer ? PLAYER_COLORS[currentPlayer.color] : "#888";

  return (
    <div className="w-full">
      {/* Turn indicator banner */}
      {!winner && currentPlayer && (
        <div
          className="turn-pulse text-center py-2 px-4 rounded-lg mb-3 font-mono text-sm font-bold tracking-wide"
          style={{
            backgroundColor: currentColor + "22",
            color: currentColor,
            border: `1px solid ${currentColor}44`,
            textShadow: `0 0 12px ${currentColor}88`,
          }}
        >
          {currentPlayer.name}&apos;s Turn
          {currentPlayer.isBot && <span className="ml-2 opacity-60 text-xs">(thinking...)</span>}
        </div>
      )}

      {/* Player chips */}
      <div className="flex items-center justify-center gap-3">
        {players.map((player, idx) => {
          const color = PLAYER_COLORS[player.color];
          const isActive = idx === currentTurn && !winner;
          const orbs = countPlayerOrbs(board, player.color);
          const eliminated = orbs === 0 && board.some(row => row.some(c => c.orbs > 0));

          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs transition-all ${
                eliminated ? "opacity-30" : ""
              }`}
              style={{
                backgroundColor: isActive ? color + "22" : "#18181b",
                border: `1.5px solid ${isActive ? color + "88" : "#27272a"}`,
                boxShadow: isActive ? `0 0 12px ${color}33` : "none",
              }}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${isActive ? "orb-critical" : ""}`}
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88)`,
                  boxShadow: isActive ? `0 0 6px ${color}` : "none",
                }}
              />
              <span style={{ color: isActive ? color : "#a1a1aa" }}>
                {player.name}
              </span>
              <span className="text-zinc-600 ml-1">{orbs}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
