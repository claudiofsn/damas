import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { validateMove } from "../logic/moveValidation";

// --- Tipagens e Constantes ---
interface Position {
  row: number;
  col: number;
}
interface BoardProps {
  socket: Socket;
  room: string;
}

const INITIAL_BOARD = () => {
  const b = Array(8)
    .fill(null)
    .map(() => Array(8).fill(0));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 !== 0) {
        if (r < 3) b[r][c] = 2; // Pretas
        if (r > 4) b[r][c] = 1; // Brancas
      }
    }
  }
  return b;
};

// --- Sub-componente: Peça ---
const Piece: React.FC<{ type: number; isSelected: boolean }> = ({
  type,
  isSelected,
}) => {
  const isKing = type % 1 !== 0;
  return (
    <div
      className={`relative w-4/5 h-4/5 rounded-full shadow-xl border-4 transform transition-all duration-300 ${
        Math.floor(type) === 1
          ? "bg-zinc-100 border-zinc-400"
          : "bg-zinc-800 border-zinc-950"
      } ${isSelected ? "scale-110 shadow-yellow-500/50 rotate-12" : ""}`}
    >
      {isKing && (
        <div className="absolute inset-0 flex items-center justify-center text-amber-500 text-lg sm:text-2xl drop-shadow-md">
          👑
        </div>
      )}
    </div>
  );
};

const Board: React.FC<BoardProps> = ({ socket, room }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [playerCount, setPlayerCount] = useState(0);
  const [myColor, setMyColor] = useState<number | null>(null);
  const [selected, setSelected] = useState<Position | null>(null);
  const [board, setBoard] = useState<(number | null)[][]>(INITIAL_BOARD);
  const [gameOver, setGameOver] = useState<{
    winner: number;
    reason: string;
  } | null>(null);

  // --- Lógica de Sockets Concentrada ---
  useEffect(() => {
    const handlers = {
      update_turn: setCurrentTurn,
      assign_color: setMyColor,
      player_count_update: setPlayerCount,
      update_board: setBoard,
      timer_update: setTimeLeft,
      game_over: setGameOver,
    };

    Object.entries(handlers).forEach(([event, handler]) =>
      socket.on(event, handler)
    );
    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event));
    };
  }, [socket]);

  const handleSquareClick = (row: number, col: number) => {
    // 1. Bloqueios de segurança
    if (gameOver || !myColor || playerCount < 2 || myColor !== currentTurn)
      return;

    const piece = board[row][col];

    // 2. LÓGICA DE SELEÇÃO: Se clicar em uma peça que é sua
    // Usamos Math.floor para que 1.1 ou 2.1 (Damas) sejam identificados como sua cor
    if (piece && piece !== 0 && Math.floor(piece) === myColor) {
      setSelected({ row, col });
      return; // Encerra aqui para apenas selecionar
    }

    // 3. LÓGICA DE MOVIMENTO: Se já tiver uma peça selecionada e clicar em um destino
    if (selected) {
      const result = validateMove(board, selected, { row, col }, myColor);

      if (result.isValid) {
        const newBoard = board.map((r) => [...r]);

        // Pegamos a peça que estava na posição de origem (pode ser 1 ou 1.1)
        let pieceToMove = board[selected.row][selected.col]!;

        // PROMOÇÃO PARA DAMA:
        // Se a peça comum (1 ou 2) chegar na última linha, ela ganha + 0.1
        const isAlreadyKing = pieceToMove % 1 !== 0;
        if (!isAlreadyKing) {
          if ((myColor === 1 && row === 0) || (myColor === 2 && row === 7)) {
            pieceToMove = myColor + 0.1; // Vira 1.1 ou 2.1
            console.log("Peça promovida a Dama!");
          }
        }

        // Executa o movimento no novo tabuleiro
        newBoard[row][col] = pieceToMove;
        newBoard[selected.row][selected.col] = 0;

        // Se houve captura, remove a peça do meio
        if (result.captured) {
          newBoard[result.captured.row][result.captured.col] = 0;
        }

        // Sincroniza com o servidor e atualiza localmente
        socket.emit("make_move", { room, newBoard });
        setBoard(newBoard);
        setSelected(null);
      } else {
        // Se o movimento for inválido, apenas desmarca a peça
        setSelected(null);
      }
    }
  };

  const isWaiting = playerCount < 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-4 text-white animate-in fade-in duration-700">
      {/* Container Principal: Timer + Tabuleiro */}
      <div className="flex flex-row items-stretch gap-6 mb-8">
        {/* TIMER VERTICAL */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-4 h-full min-h-75 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            {/* Barra de Progresso Vertical - Cresce de baixo para cima */}
            <div
              className={`absolute bottom-0 w-full transition-all duration-1000 ${
                timeLeft <= 5 ? "bg-red-500" : "bg-amber-500"
              }`}
              style={{ height: `${(timeLeft / 15) * 100}%` }}
            />
          </div>
        </div>

        {/* TABULEIRO CONTAINER */}
        <div className="relative group">
          <div
            className={`grid grid-cols-8 gap-0 border-12 border-amber-950 shadow-2xl relative ${
              isWaiting ? "opacity-20 pointer-events-none" : ""
            }`}
          >
            {board.map((rowData, rIndex) =>
              rowData.map((piece, cIndex) => {
                const isDark = (rIndex + cIndex) % 2 !== 0;
                const isSelected =
                  selected?.row === rIndex && selected?.col === cIndex;

                return (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleSquareClick(rIndex, cIndex)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center relative ${
                      isDark ? "bg-amber-900" : "bg-amber-100"
                    } ${
                      isSelected ? "ring-4 ring-inset ring-yellow-400 z-10" : ""
                    }`}
                  >
                    {piece !== 0 && piece !== null && (
                      <Piece type={piece} isSelected={isSelected} />
                    )}

                    {/* Coordenadas */}
                    {cIndex === 0 && (
                      <span className="absolute left-0.5 top-0.5 text-[8px] text-zinc-400">
                        {8 - rIndex}
                      </span>
                    )}
                    {rIndex === 7 && (
                      <span className="absolute right-0.5 bottom-0.5 text-[8px] text-zinc-400">
                        {String.fromCharCode(65 + cIndex)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Overlay de Espera */}
          {isWaiting && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-zinc-900/40 z-20">
              <div className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold animate-bounce shadow-xl">
                Aguardando Oponente...
              </div>
            </div>
          )}

          {/* Reutilizando seu Modal de Fim de Jogo aqui dentro para cobrir o board */}
          {/* {gameOver && <GameOverModal ... />} */}
        </div>
      </div>

      {/* Painel Inferior: Informações do Jogador e Turno */}
      <div className="w-full max-w-125 grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-black">
              Sua Peça
            </span>
            <span className="text-sm font-bold text-zinc-200">
              {myColor === 1 ? "Brancas" : "Pretas"}
            </span>
          </div>
          <div
            className={`w-6 h-6 rounded-full ${
              myColor === 1
                ? "bg-zinc-100 border-zinc-400"
                : "bg-zinc-800 border-zinc-950"
            } border-2 shadow-inner`}
          />
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center shadow-lg ${
            currentTurn === myColor
              ? "bg-green-600/20 border-green-500 text-green-400 animate-pulse"
              : "bg-zinc-800 border-zinc-700 text-zinc-500"
          }`}
        >
          <span className="text-[10px] uppercase font-black">Status</span>
          <span className="text-sm font-bold">
            {currentTurn === myColor ? "Sua Vez!" : "Oponente Jogando"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Board;
