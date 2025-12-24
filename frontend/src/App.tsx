import { useState } from "react";
import { io } from "socket.io-client";
import Board from "./components/Board";
import Lobby from "./components/Lobby";

const socket = io("http://localhost:3000");

function App() {
  const [room, setRoom] = useState<string | null>(null);

  const joinRoom = (roomName: string) => {
    if (!roomName.trim()) return;
    socket.emit("join_room", roomName);
    setRoom(roomName);
  };

  return (
    <div className="min-h-screen min-w-screen bg-zinc-900 text-white font-sans">
      {!room ? (
        <Lobby socket={socket} onJoin={joinRoom} />
      ) : (
        <div className="flex flex-col items-center py-10">
          <button
            onClick={() => setRoom(null)}
            className="mb-4 text-xs text-black"
          >
            <span>← Sair da Sala</span>
          </button>
          <Board socket={socket} room={room} />
        </div>
      )}
    </div>
  );
}

export default App;
