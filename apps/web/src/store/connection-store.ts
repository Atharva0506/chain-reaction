import { create } from "zustand";

interface ConnectionStore {
  connected: boolean;
  reconnecting: boolean;
  latency: number;
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  setLatency: (latency: number) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connected: false,
  reconnecting: false,
  latency: 0,
  setConnected: (connected) => set({ connected }),
  setReconnecting: (reconnecting) => set({ reconnecting }),
  setLatency: (latency) => set({ latency }),
}));
