import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io: SocketIOServer;
    };
  };
};
declare module "stockfish" {
    export default function stockfish(): {
      postMessage(message: string): void;
      onmessage: (event: any) => void;
    };
  }