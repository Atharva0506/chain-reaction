"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Logo, Button, Card } from "@chain-reaction/ui";
import { ClientEvent } from "@chain-reaction/types";
import { useWebSocket } from "@/hooks/use-websocket";
import { ConnectionStatus } from "@/components/connection-status";
import { useConnectionStore } from "@/store/connection-store";

export default function MultiplayerPage() {
  const router = useRouter();
  const { connect, send } = useWebSocket();
  const connected = useConnectionStore((s) => s.connected);
  const [tab, setTab] = useState<"quick" | "private">("quick");
  const [roomCode, setRoomCode] = useState("");
  const [searching, setSearching] = useState(false);

  const handleQuickMatch = useCallback(() => {
    if (!connected) connect();
    setSearching(true);
    send(ClientEvent.QUEUE_MATCHMAKING, { playerName: "Player" });
  }, [connected, connect, send]);

  const handleCreateRoom = useCallback(() => {
    if (!connected) connect();
    send(ClientEvent.CREATE_ROOM, { playerCount: 2 });
  }, [connected, connect, send]);

  const handleJoinRoom = useCallback(() => {
    if (!connected) connect();
    if (roomCode.trim().length > 0) {
      send(ClientEvent.JOIN_ROOM, { roomCode: roomCode.trim().toUpperCase() });
    }
  }, [connected, connect, send, roomCode]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
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
        className="w-full max-w-md"
      >
        <Card>
          <div className="flex gap-1 mb-6 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setTab("quick")}
              className={`flex-1 py-2 px-4 rounded-md font-mono text-sm transition-colors ${
                tab === "quick"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Quick Match
            </button>
            <button
              onClick={() => setTab("private")}
              className={`flex-1 py-2 px-4 rounded-md font-mono text-sm transition-colors ${
                tab === "private"
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Private Room
            </button>
          </div>

          {tab === "quick" ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-zinc-400 font-mono text-sm text-center">
                Find an opponent and play a ranked 1v1 match
              </p>
              {searching ? (
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="w-12 h-12 border-2 border-emerald-400 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-zinc-400 font-mono text-sm">
                    Searching for opponent...
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearching(false);
                      send(ClientEvent.CANCEL_MATCHMAKING, {});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={handleQuickMatch} size="lg" className="w-full">
                  Find Match
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Button onClick={handleCreateRoom} size="lg" className="w-full">
                Create Room
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-700" />
                <span className="text-zinc-500 font-mono text-xs">OR</span>
                <div className="flex-1 h-px bg-zinc-700" />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 uppercase tracking-widest text-center"
                />
                <Button
                  onClick={handleJoinRoom}
                  variant="secondary"
                  disabled={roomCode.trim().length === 0}
                >
                  Join
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <ConnectionStatus />
          </div>
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
