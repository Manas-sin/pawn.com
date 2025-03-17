import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (email: string | null) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!email) return; // Prevent running if email is null

        console.log("🔌 Connecting WebSocket...");

        const newSocket = io("ws://localhost:4000", {
            query: { email }, // Send email as query param
            transports: ["websocket"],
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ WebSocket connected:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ WebSocket disconnected");
            setSocket(null);
        });

        return () => {
            console.log("🛑 Cleaning up WebSocket...");
            newSocket.disconnect(); // Disconnect when component unmounts
        };
    }, [email]); // Reconnect if email changes

    return socket;
};
