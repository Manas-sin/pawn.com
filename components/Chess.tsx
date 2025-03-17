import React, { useState, useEffect } from "react";
import styles from "../styles/chessboard.module.scss";
import { Chess } from "chess.js";
import { getSocket } from "../utils/socket";

const pieceSymbols: { [key: string]: { w: string; b: string } } = {
  r: { w: "/wr.png", b: "/br.png" },
  n: { w: "/wn.png", b: "/bn.png" },
  b: { w: "/wb.png", b: "/bb.png" },
  q: { w: "/wq.png", b: "/bq.png" },
  k: { w: "/wk.png", b: "/bk.png" },
  p: { w: "/wp.png", b: "/bp.png" },
};

interface Square {
  square: string;
  type: string;
  color: "w" | "b";
}

interface Piece {
  type: string;
  color: "w" | "b";
}

interface ChessboardProps {
  boardData: (Square | null)[][];
  setBoardData: React.Dispatch<React.SetStateAction<(Square | null)[][]>>;
  gameId: string;
  playerColor: "w" | "b";
}

const Chessboard: React.FC<ChessboardProps> = ({
  boardData,
  setBoardData,
  gameId,
  playerColor,
}) => {
  const [draggedPiece, setDraggedPiece] = useState<Square | null>(null);
  const [sourceIndex, setSourceIndex] = useState<number | null>(null);
  const [game, setGame] = useState<Chess>(new Chess());
  const [gameStatus, setGameStatus] = useState<string>(
    "Waiting for opponent..."
  );
  const [whitePieces, setWhitePieces] = useState<Piece[]>([]);
  const [blackPieces, setBlackPieces] = useState<Piece[]>([]);
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !gameId) return;

    socket.on(
      "game_started",
      ({ fen, turn }: { fen: string; turn: "w" | "b" }) => {
        const newGame = new Chess(fen);
        setGame(newGame);
        setBoardData(newGame.board() as (Square | null)[][]);
        setGameStatus(turn === playerColor ? "Your turn" : "Opponent's turn");
        updatePieces(newGame);
      }
    );

    socket.on(
      "move_made",
      ({ move, fen, gameOver, turn, whitePieces, blackPieces }) => {
        const newGame = new Chess(fen);
        setGame(newGame);
        setBoardData(newGame.board() as (Square | null)[][]);
        setWhitePieces(whitePieces);
        setBlackPieces(blackPieces);
        setGameStatus(
          gameOver
            ? newGame.isCheckmate()
              ? "Checkmate!"
              : newGame.isDraw()
              ? "Draw!"
              : "Game Over"
            : turn === playerColor
            ? "Your turn"
            : "Opponent's turn"
        );
      }
    );

    socket.on("game_ended", ({ reason, winner }) => {
      setGameStatus(
        `Game ended: ${reason}${
          winner
            ? ` (Winner: ${winner === playerColor ? "You" : "Opponent"})`
            : ""
        }`
      );
    });

    socket.on("opponent_disconnected", () => {
      setGameStatus("Opponent disconnected. Game over.");
    });

    socket.on("error", ({ message }) => {
      alert(message);
    });

    return () => {
      socket.off("game_started");
      socket.off("move_made");
      socket.off("game_ended");
      socket.off("opponent_disconnected");
      socket.off("error");
    };
  }, [socket, gameId, playerColor, setBoardData]);

  const updatePieces = (chess: Chess) => {
    const board = chess.board();
    const white = board
      .flat()
      .filter((p) => p && p.color === "w")
      .map((p) => ({ type: p!.type, color: p!.color }));
    const black = board
      .flat()
      .filter((p) => p && p.color === "b")
      .map((p) => ({ type: p!.type, color: p!.color }));
    setWhitePieces(white);
    setBlackPieces(black);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    square: Square,
    index: number
  ) => {
    if (game.turn() !== playerColor || gameStatus.includes("Game")) return;
    setDraggedPiece(square);
    setSourceIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();
    if (
      !draggedPiece ||
      sourceIndex === null ||
      game.turn() !== playerColor ||
      gameStatus.includes("Game")
    )
      return;

    const indexToSquare = (index: number) => {
      const row =
        playerColor === "w" ? 7 - Math.floor(index / 8) : Math.floor(index / 8);
      const col = playerColor === "w" ? index % 8 : 7 - (index % 8);
      return String.fromCharCode(97 + col) + (row + 1);
    };

    const sourceSquare = indexToSquare(sourceIndex);
    const targetSquare = indexToSquare(targetIndex);

    const move = { from: sourceSquare, to: targetSquare, promotion: "q" };
    socket?.emit("move", { gameId, move });

    setDraggedPiece(null);
    setSourceIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const renderBoard = () => {
    const flatBoard = boardData.flat();
    const adjustedBoard =
      playerColor === "b" ? [...flatBoard].reverse() : flatBoard;

    return adjustedBoard.map((square, index) => {
      const row =
        playerColor === "w" ? 7 - Math.floor(index / 8) : Math.floor(index / 8);
      const col = playerColor === "w" ? index % 8 : 7 - (index % 8);
      const isDark = (row + col) % 2 === 1;
      const bgColor = isDark ? styles.dark : styles.light;

      return (
        <div
          key={index}
          className={`${styles.chessSquare} ${bgColor}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          {square && (
            <img
              src={pieceSymbols[square.type][square.color]}
              alt={`${square.color} ${square.type}`}
              className={styles.chessPiece}
              draggable
              onDragStart={(e) => handleDragStart(e, square, index)}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      {/* Left: Opponent's Pieces */}
      <div className={styles.opponentPieces}>
        <h3>Opponent's Pieces ({playerColor === "w" ? "Black" : "White"})</h3>
        {(playerColor === "w" ? blackPieces : whitePieces).map((piece, idx) => (
          <img
            key={idx}
            src={pieceSymbols[piece.type][piece.color]}
            alt={`${piece.color} ${piece.type}`}
            className={styles.pieceIcon}
          />
        ))}
      </div>

      {/* Center: Chessboard and Game Status */}
      <div className={styles.boardWrapper}>
        <div className={styles.chessboard}>{renderBoard()}</div>
        <div className={styles.gameStatus}>{gameStatus}</div>
      </div>

      {/* Right: Your Pieces */}
      <div className={styles.yourPieces}>
        <h3>Your Pieces ({playerColor === "w" ? "White" : "Black"})</h3>
        {(playerColor === "w" ? whitePieces : blackPieces).map((piece, idx) => (
          <img
            key={idx}
            src={pieceSymbols[piece.type][piece.color]}
            alt={`${piece.color} ${piece.type}`}
            className={styles.pieceIcon}
          />
        ))}
      </div>
    </div>
  );
};

export default Chessboard;
