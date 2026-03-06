"use client";

import { useGameStore } from "@/store/game-store";
import { PLAYER_COLORS } from "@chain-reaction/types";

interface GameOverModalProps {
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameOverModal({ onPlayAgain, onMainMenu }: GameOverModalProps) {
  const winner = useGameStore((s) => s.winner);
  const turnNumber = useGameStore((s) => s.turnNumber);

  if (!winner) return null;

  const color = PLAYER_COLORS[winner.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="bg-zinc-900 rounded-2xl p-8 max-w-xs w-full mx-4 text-center slide-in-bottom"
        style={{
          border: `2px solid ${color}44`,
          boxShadow: `0 0 60px ${color}22`,
        }}
      >
        {/* Winner orb */}
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 orb-wobble"
          style={{
            background: `radial-gradient(circle at 35% 30%, white, ${color} 45%, ${color}44 100%)`,
            boxShadow: `0 0 40px ${color}66`,
          }}
        />

        <h2 className="text-2xl font-black text-white mb-1">
          {winner.name} Wins!
        </h2>
        <p className="text-zinc-500 font-mono text-xs mb-6">
          {turnNumber} turns played
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wide text-white transition-all active:scale-[0.98]"
            style={{
              backgroundColor: color,
              boxShadow: `0 4px 20px ${color}44`,
            }}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onMainMenu}
            className="w-full py-2.5 rounded-xl font-mono text-sm text-zinc-400 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-all active:scale-[0.98]"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
