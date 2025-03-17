import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const connectSocket = (email: string): Socket | null => {
  if (!socket) {
    console.log(`Attempting to connect to ${SOCKET_URL} with email: ${email}`);
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      query: { email },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => console.log("✅ Connected to WebSocket:", socket?.id));
    socket.on("disconnect", () => console.warn("⚠️ Disconnected. Attempting reconnect..."));
    socket.on("connect_error", (error) => console.error("❌ WebSocket error:", error.message));
  } else {
    console.log("Socket already exists:", socket.id, "Connected:", socket.connected);
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};