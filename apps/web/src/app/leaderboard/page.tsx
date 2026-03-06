"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo, Button, Card } from "@chain-reaction/ui";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface LeaderboardEntry {
  rank: number;
  userName: string;
  rating: number;
  wins: number;
  losses: number;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const { data: entries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/leaderboard`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  return (
    <main className="min-h-screen flex flex-col items-center p-4 pt-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Logo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg"
      >
        <Card>
          <h2 className="text-xl font-mono font-bold text-zinc-100 mb-6 text-center">
            Leaderboard
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <motion.div
                className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-3 py-2 text-zinc-500 font-mono text-xs uppercase tracking-wider">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">W</span>
                <span className="text-right">L</span>
                <span className="text-right">ELO</span>
              </div>

              {(entries || []).map((entry, i) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`grid grid-cols-[3rem_1fr_4rem_4rem_4rem] gap-2 px-3 py-2.5 rounded-md font-mono text-sm ${
                    i < 3
                      ? "bg-zinc-800/60 border border-zinc-700/50"
                      : "hover:bg-zinc-800/30"
                  }`}
                >
                  <span
                    className={
                      i === 0
                        ? "text-yellow-400 font-bold"
                        : i === 1
                          ? "text-zinc-300 font-bold"
                          : i === 2
                            ? "text-amber-600 font-bold"
                            : "text-zinc-500"
                    }
                  >
                    {entry.rank}
                  </span>
                  <span className="text-zinc-200 truncate">{entry.userName}</span>
                  <span className="text-right text-emerald-400">{entry.wins}</span>
                  <span className="text-right text-red-400">{entry.losses}</span>
                  <span className="text-right text-zinc-300 font-bold">{entry.rating}</span>
                </motion.div>
              ))}

              {(!entries || entries.length === 0) && (
                <div className="text-center py-8 text-zinc-500 font-mono text-sm">
                  No ranked players yet
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Back to Menu
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
