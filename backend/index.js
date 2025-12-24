const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "ectosarcous-distinctively-mario.ngrok-free.dev",
    ], // URL do seu React/Vite
    methods: ["GET", "POST"],
  },
});

// Objeto simples para armazenar salas e quantidade de jogadores
// Em produção, usarias algo como Redis, mas para estudos um Map/Objeto basta.
let activeRooms = {};

const startTurnTimer = (io, roomCode) => {
  const room = activeRooms[roomCode];
  if (!room) return;

  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timeLeft = 15;

  room.timerInterval = setInterval(() => {
    room.timeLeft -= 1;
    io.to(roomCode).emit("timer_update", room.timeLeft);

    if (room.timeLeft <= 0) {
      clearInterval(room.timerInterval);

      // LÓGICA DE VITÓRIA:
      // Se era o turno das Brancas (1) e o tempo acabou, Pretas (2) vencem.
      const winner = room.turn === 1 ? 2 : 1;

      io.to(roomCode).emit("game_over", {
        winner,
        reason: "timeout",
      });

      console.log(
        `Fim de jogo na sala ${roomCode}: Vitória do jogador ${winner} por tempo.`
      );
    }
  }, 1000);
};

io.on("connection", (socket) => {
  // Sempre que alguém conecta, enviamos a lista de salas atuais
  socket.emit("update_room_list", Object.keys(activeRooms));

  socket.on("join_room", (rawRoomCode) => {
    const roomCode = rawRoomCode.trim(); // Evita erros de digitação/espaços
    socket.join(roomCode);

    if (!activeRooms[roomCode]) {
      activeRooms[roomCode] = {
        players: new Set(),
        turn: 1,
        timeLeft: 15,
        timerInterval: null,
      };
    }
    activeRooms[roomCode].players.add(socket.id);

    const players = Array.from(activeRooms[roomCode].players);
    const playerCount = players.length;

    // Define a cor
    let assignedColor = playerCount === 1 ? 1 : playerCount === 2 ? 2 : null;
    socket.emit("assign_color", assignedColor);

    // IMPORTANTE: Avisar a TODOS na sala que o número de jogadores mudou
    // Isso fará o "Aguardando Oponente" sumir para o Jogador 1
    io.to(roomCode).emit("player_count_update", playerCount);
    io.to(roomCode).emit("update_turn", activeRooms[roomCode].turn);

    // Inicia o timer apenas quando o segundo jogador entra
    if (playerCount === 2) {
      console.log(`Partida iniciada na sala: ${roomCode}`);
      startTurnTimer(io, roomCode);
    }
  });

  // Novo evento: Quando um movimento é validado e concluído
  socket.on("move_completed", (roomCode) => {
    if (activeRooms[roomCode]) {
      // Alterna o turno: se era 1 vira 2, se era 2 vira 1
      activeRooms[roomCode].turn = activeRooms[roomCode].turn === 1 ? 2 : 1;

      // Avisa a todos na sala sobre a mudança de turno
      io.to(roomCode).emit("update_turn", activeRooms[roomCode].turn);
    }
  });

  socket.on("make_move", ({ room, newBoard }) => {
    if (activeRooms[room]) {
      activeRooms[room].turn = activeRooms[room].turn === 1 ? 2 : 1;

      io.to(room).emit("update_board", newBoard);
      io.to(room).emit("update_turn", activeRooms[room].turn);

      // ESSENCIAL: Reinicia o cronômetro quando uma jogada válida é feita
      startTurnTimer(io, room);
    }
  });

  socket.on("disconnecting", () => {
    // socket.rooms é um Set que contém as salas do usuário
    socket.rooms.forEach((r) => {
      if (activeRooms[r]) {
        // Usamos 'r' aqui também para acessar a sala correta
        activeRooms[r].players.delete(socket.id);

        if (activeRooms[r].players.size === 0) {
          // Limpa o timer antes de deletar a sala para evitar memory leak
          if (activeRooms[r].timerInterval) {
            clearInterval(activeRooms[r].timerInterval);
          }
          delete activeRooms[r];
          console.log(`Sala ${r} fechada e timer limpo.`);
        }
      }
    });

    io.emit("update_room_list", Object.keys(activeRooms));
  });
});

// Inicia o servidor na porta 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.io a correr na porta ${PORT}`);
});
