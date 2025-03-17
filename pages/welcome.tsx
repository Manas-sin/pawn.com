import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { connectSocket, getSocket } from "../utils/socket";
import styles from "../styles/welcome.module.scss";
import Chessboard from "../components/Chess";
import { Chess } from "chess.js";
import Image from 'next/image';

interface Square {
  square: string;
  type: string;
  color: "w" | "b";
}

interface Player {
  email: string;
  socketId: string;
  color: "w" | "b";
}

const initialBoardState: (Square | null)[][] = new Chess().board() as (Square | null)[][];

const Welcome: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [boardData, setBoardData] = useState<(Square | null)[][]>(initialBoardState);
  const [opponentEmail, setOpponentEmail] = useState<string>("");
  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(null); // State for image source

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin/signin");
      return;
    }

    if (!session?.user?.email) {
      console.log("No email available yet");
      return;
    }

    console.log("Full session:", session);
    console.log("Profile image:", session.user.image);
    setProfileImageSrc(session.user.image || "/default-profile.png"); // Set initial image source

    const socket = connectSocket(session.user.email);
    if (!socket) {
      console.error("Failed to initialize socket");
      return;
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("game_created", ({ gameId, color }: { gameId: string; color: "w" | "b" }) => {
      console.log(`Game created: ${gameId}, Color: ${color}`);
      setGameId(gameId);
      setPlayerColor(color);
    });

    socket.on("game_invite", ({ gameId, from }: { gameId: string; from: string }) => {
      console.log(`Received game invite from ${from} for game ${gameId}`);
      if (confirm(`Accept game invite from ${from}?`)) {
        socket.emit("join_game", { gameId });
        setGameId(gameId);
        setPlayerColor("b");
      }
    });

    socket.on("game_started", ({ gameId, players, fen, turn }: { gameId: string; players: Player[]; fen: string; turn: "w" | "b" }) => {
      console.log(`Game started: ${gameId}, Players: ${JSON.stringify(players)}, FEN: ${fen}, Turn: ${turn}`);
      const myPlayer = players.find((p) => p.email === session.user.email);
      if (myPlayer) {
        setGameId(gameId);
        setPlayerColor(myPlayer.color);
        const newGame = new Chess(fen);
        setBoardData(newGame.board() as (Square | null)[][]);
      }
    });

    socket.on("error", (data: { message: string }) => {
      console.log("Error from server:", data.message);
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("game_created");
      socket.off("game_invite");
      socket.off("game_started");
      socket.off("error");
    };
  }, [session?.user?.email, status, router]);

  const startGame = () => {
    if (!opponentEmail) {
      alert("Enter opponent’s email");
      return;
    }
    const socket = getSocket();
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      alert("Not connected to server. Please try again.");
      return;
    }
    console.log(`Sending init_game to server with opponent: ${opponentEmail}`);
    socket.emit("init_game", { opponentEmail });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("Image failed to load:", e.currentTarget.src);
    if (profileImageSrc !== "/default-profile.png") {
      setProfileImageSrc("/default-profile.png"); // Switch to fallback once
    } else {
      console.log("Fallback image also failed, stopping attempts");
    }
  };

  if (status === "loading") return <h2>Loading...</h2>;
  if (!session) return <h2>Please log in to continue.</h2>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.contentWrapper}>
          <div className={styles.profileContainer}>
            <img
              src={profileImageSrc || "/default-profile.png"}
              alt="Profile"
              className={styles.profileImage}
              onError={handleImageError}
            />
            <p
              className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}
            >
              {isConnected ? "🟢" : "🔴"}
            </p>
          </div>
          <h2 className={styles.welcome}>{session.user?.name}</h2>
          {!gameId && (
            <div>
              <input
                type="email"
                value={opponentEmail}
                onChange={(e) => setOpponentEmail(e.target.value)}
                placeholder="Opponent's email"
              />
              <button onClick={startGame}>Start Game</button>
            </div>
          )}
        </div>
        <button onClick={() => signOut()} className={`${styles.button} ${styles.signOut}`}>
          Sign Out
        </button>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.gameTitle}>
          
        {/* <img src="/image/pawn.png" alt="Pawn Logo" /> */}
        <Image src="/image/pawn.png" alt="Pawn Logo"/>
          <h1>Pawn.com</h1>
        </div>
        {gameId && playerColor ? (
          <Chessboard
            boardData={boardData}
            setBoardData={setBoardData}
            gameId={gameId}
            playerColor={playerColor}
          />
        ) : (
          <p>Waiting to start a game...</p>
        )}
      </div>
    </div>
  );
};

export default Welcome;