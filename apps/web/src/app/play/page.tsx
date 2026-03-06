"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useCallback, Suspense } from "react";
import { Difficulty } from "@chain-reaction/types";
import { useSinglePlayer } from "@/hooks/use-single-player";
import { useGameStore } from "@/store/game-store";
import { GameBoard } from "@/components/game-board";
import { PlayerPanel } from "@/components/player-panel";
import { GameOverModal } from "@/components/game-over-modal";

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");
  const difficultyParam = searchParams.get("difficulty") as Difficulty | null;
  const { start, makeMove } = useSinglePlayer();
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    if (mode === "single") {
      start(difficultyParam || Difficulty.MEDIUM);
    }
  }, [mode, difficultyParam, start]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (mode === "single") {
        makeMove({ row, col });
      }
    },
    [mode, makeMove]
  );

  const handlePlayAgain = useCallback(() => {
    reset();
    start(difficultyParam || Difficulty.MEDIUM);
  }, [reset, start, difficultyParam]);

  const handleMainMenu = useCallback(() => {
    reset();
    router.push("/");
  }, [reset, router]);

  return (
    <main className="h-dvh flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
          {mode === "single" ? `vs Bot · ${difficultyParam}` : "Multiplayer"}
        </span>
        <button
          onClick={handleMainMenu}
          className="text-zinc-500 hover:text-zinc-300 font-mono text-xs uppercase tracking-wider transition-colors"
        >
          ✕ Exit
        </button>
      </div>

      {/* Turn indicator + player chips */}
      <div className="px-4 py-2">
        <PlayerPanel />
      </div>

      {/* Board — centered and fills remaining space */}
      <div className="flex-1 flex items-center justify-center px-2 pb-4">
        <GameBoard onCellClick={handleCellClick} />
      </div>

      <GameOverModal onPlayAgain={handlePlayAgain} onMainMenu={handleMainMenu} />
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh flex items-center justify-center bg-black">
          <div className="text-zinc-500 font-mono text-sm">Loading...</div>
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
