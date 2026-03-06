"use client";

import { useConnectionStore } from "@/store/connection-store";

export function ConnectionStatus() {
  const connected = useConnectionStore((s) => s.connected);
  const reconnecting = useConnectionStore((s) => s.reconnecting);
  const latency = useConnectionStore((s) => s.latency);

  if (!connected && !reconnecting) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <div
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-emerald-400" : reconnecting ? "bg-yellow-400 animate-pulse" : "bg-red-400"
        }`}
      />
      <span className="text-zinc-500">
        {connected ? `${latency}ms` : reconnecting ? "Reconnecting..." : "Offline"}
      </span>
    </div>
  );
}
