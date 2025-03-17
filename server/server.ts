import express from "express";
import { Server, Socket } from "socket.io";
import { Chess } from "chess.js";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

interface Player {
  email: string;
  socketId: string;
  color: "w" | "b";
}

interface Game {
  players: Player[];
  chess: Chess;
  status: "waiting" | "active" | "ended";
}

const games = new Map<string, Game>();
const emailToSocket = new Map<string, string>();

io.on("connection", (socket: Socket) => {
  const email = socket.handshake.query.email as string;
  console.log(`User connected: ${socket.id}, Email: ${email}`);
  emailToSocket.set(email, socket.id);
  console.log(`Current connected users: ${JSON.stringify([...emailToSocket.entries()])}`);

  socket.on("init_game", ({ opponentEmail }: { opponentEmail: string }) => {
    const gameId = `${email}-${opponentEmail}-${Date.now()}`;
    const chess = new Chess();

    games.set(gameId, {
      players: [{ email, socketId: socket.id, color: "w" }],
      chess,
      status: "waiting",
    });

    socket.join(gameId);
    console.log(`Emitting game_created to ${email} for game ${gameId}`);
    socket.emit("game_created", { gameId, color: "w" });

    const opponentSocketId = emailToSocket.get(opponentEmail);
    if (opponentSocketId) {
      console.log(`Sending game invite to ${opponentEmail} (socket: ${opponentSocketId})`);
      io.to(opponentSocketId).emit("game_invite", { gameId, from: email });
    } else {
      socket.emit("error", { message: "Opponent not online" });
    }
  });

  socket.on("join_game", ({ gameId }: { gameId: string }) => {
    const game = games.get(gameId);
    if (!game || game.players.length >= 2) {
      socket.emit("error", { message: "Game not found or full" });
      return;
    }

    game.players.push({ email, socketId: socket.id, color: "b" });
    game.status = "active";
    socket.join(gameId);

    console.log(`Emitting game_started to room ${gameId}`);
    io.to(gameId).emit("game_started", {
      gameId,
      players: game.players,
      fen: game.chess.fen(),
      turn: game.chess.turn(),
    });
  });

  socket.on("move", ({ gameId, move }: { gameId: string; move: { from: string; to: string; promotion?: string } }) => {
    const game = games.get(gameId);
    if (!game || game.status !== "active") {
      socket.emit("error", { message: "Game not active" });
      return;
    }

    const player = game.players.find(p => p.socketId === socket.id);
    if (!player || game.chess.turn() !== player.color) {
      socket.emit("error", { message: "Not your turn" });
      return;
    }

    try {
      const moveResult = game.chess.move(move);
      if (moveResult) {
        const gameOver = game.chess.isGameOver();
        console.log(`Move made in game ${gameId}: ${JSON.stringify(move)}`);
        
        // Calculate pieces for each player
        const board = game.chess.board();
        const whitePieces = board.flat().filter(p => p && p.color === "w");
        const blackPieces = board.flat().filter(p => p && p.color === "b");

        io.to(gameId).emit("move_made", {
          move: moveResult,
          fen: game.chess.fen(),
          gameOver,
          turn: game.chess.turn(),
          whitePieces: whitePieces.map(p => ({ type: p!.type, color: p!.color })),
          blackPieces: blackPieces.map(p => ({ type: p!.type, color: p!.color })),
        });

        if (gameOver) {
          game.status = "ended";
          io.to(gameId).emit("game_ended", {
            reason: game.chess.isCheckmate() ? "checkmate" : game.chess.isDraw() ? "draw" : "other",
            winner: game.chess.isCheckmate() ? (game.chess.turn() === "b" ? "w" : "b") : null,
          });
        }
      }
    } catch (error) {
      console.log(`Invalid move attempted: ${JSON.stringify(move)}`);
      socket.emit("error", { message: `Invalid move: ${move.from} to ${move.to}` });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}, Email: ${email}`);
    emailToSocket.delete(email);
    for (const [gameId, game] of games) {
      const playerIndex = game.players.findIndex((p) => p.socketId === socket.id);
      if (playerIndex !== -1) {
        io.to(gameId).emit("opponent_disconnected");
        games.delete(gameId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on ${PORT}`);
}).on("error", (err) => {
  console.error("Server failed to start:", err);
});