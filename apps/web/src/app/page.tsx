"use client";

import { useState, useMemo } from "react";
import { Difficulty } from "@chain-reaction/types";
import Link from "next/link";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"];

function FloatingOrbs() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 8 + Math.random() * 24,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 8,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full float-orb"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: `radial-gradient(circle at 35% 30%, white, ${orb.color} 50%, ${orb.color}44 100%)`,
            boxShadow: `0 0 ${orb.size}px ${orb.color}44`,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
            opacity: 0.25,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [showDifficulty, setShowDifficulty] = useState(false);

  return (
    <main className="h-dvh flex flex-col items-center justify-center relative bg-black">
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col items-center gap-10 px-4 w-full max-w-xs">
        {/* Title */}
        <div className="text-center slide-in-bottom">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            Chain
            <span className="bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
              Reaction
            </span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">
            Conquer the board
          </p>
        </div>

        {/* Menu */}
        <div className="w-full flex flex-col gap-3 slide-in-bottom" style={{ animationDelay: "0.15s" }}>
          {!showDifficulty ? (
            <>
              <button
                onClick={() => setShowDifficulty(true)}
                className="w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-wide
                  bg-gradient-to-r from-red-600 to-orange-600 text-white
                  hover:from-red-500 hover:to-orange-500 transition-all
                  shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                PLAY VS BOT
              </button>

              <Link href="/multiplayer" className="w-full">
                <button className="w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-wide
                  bg-zinc-800 text-zinc-300 border border-zinc-700
                  hover:bg-zinc-700 transition-all active:scale-[0.98]"
                >
                  MULTIPLAYER
                </button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-center text-zinc-400 font-mono text-xs mb-1 uppercase tracking-widest">
                Difficulty
              </p>
              {[
                { d: Difficulty.EASY, label: "Easy", color: "from-emerald-600 to-green-600", shadow: "shadow-emerald-600/20" },
                { d: Difficulty.MEDIUM, label: "Medium", color: "from-yellow-600 to-amber-600", shadow: "shadow-yellow-600/20" },
                { d: Difficulty.HARD, label: "Hard", color: "from-red-600 to-rose-600", shadow: "shadow-red-600/20" },
              ].map(({ d, label, color, shadow }) => (
                <Link key={d} href={`/play?mode=single&difficulty=${d}`} className="w-full">
                  <button className={`w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wide
                    bg-gradient-to-r ${color} text-white shadow-lg ${shadow}
                    hover:brightness-110 transition-all active:scale-[0.98]`}
                  >
                    {label.toUpperCase()}
                  </button>
                </Link>
              ))}
              <button
                onClick={() => setShowDifficulty(false)}
                className="text-zinc-500 hover:text-zinc-300 font-mono text-xs mt-2 transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
