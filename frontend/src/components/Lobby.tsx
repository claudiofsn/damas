import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface LobbyProps {
  socket: Socket;
  onJoin: (room: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ socket, onJoin }) => {
  const [roomInput, setRoomInput] = useState("");
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

  useEffect(() => {
    // Ouve atualizações da lista de salas
    socket.on("update_room_list", (rooms: string[]) => {
      setAvailableRooms(rooms);
    });

    return () => {
      socket.off("update_room_list");
    };
  }, [socket]);

  const handleCreateRoom = () => {
    const newRoomId = `sala-${Math.floor(Math.random() * 1000)}`;
    onJoin(newRoomId);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 h-screen flex flex-col justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna 1: Criar / Entrar via Código */}
        <div className="space-y-6 bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl">
          <div>
            <h2 className="text-xl font-bold mb-4">Nova Partida</h2>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-bold transition-all transform hover:scale-105"
            >
              <span className="text-black">Criar Nova Sala Aleatória</span>
            </button>
          </div>

          <div className="border-t border-zinc-700 pt-6">
            <h2 className="text-xl font-bold mb-4">Entrar com Código</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: sala-123"
                className="flex-1 bg-zinc-900 border border-zinc-600 p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
              <button
                onClick={() => onJoin(roomInput)}
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded font-bold"
              >
                <span className="text-black">Entrar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 2: Salas Disponíveis */}
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4">Salas Disponíveis</h2>
          <div className="flex-1 overflow-y-auto max-h-75 space-y-2 pr-2 custom-scrollbar">
            {availableRooms.length === 0 ? (
              <p className="text-zinc-500 italic">
                Nenhuma sala aberta no momento...
              </p>
            ) : (
              availableRooms.map((room) => (
                <div
                  key={room}
                  className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-700 hover:border-amber-500 transition-colors"
                >
                  <span className="font-mono text-amber-400">{room}</span>
                  <button
                    onClick={() => onJoin(room)}
                    className="text-xs bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white px-3 py-1 rounded-full border border-amber-600/30 transition-all"
                  >
                    Entrar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
