import { useEffect, useState } from "react";

export const useSocket = () => {
   const [socket, setSocket] = useState<WebSocket | null>(null);

   useEffect(() => {
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
         console.log("WebSocket connection established.");
      };

      ws.onerror = (error) => {
         console.error("WebSocket error observed:", error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
      };

      setSocket(ws);

      return () => {
         if (ws.readyState === WebSocket.OPEN) {
            ws.close();
         }
      };
   }, []);

   return socket;
};
