# ♟️ Damas Real-Time (Checkers Online)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/-Vitest-252b3b?style=for-the-badge&logo=vitest&logoColor=729b1b)

> Um jogo de Damas multiplayer em tempo real desenvolvido como projeto de portfólio Full Stack. O sistema utiliza WebSockets para garantir sincronização instantânea de movimentos, chat (futuro) e estados de jogo entre dois jogadores.

---

## 📸 Screenshots

<div align="center">
  <img src="./assets/lobby-preview.png" alt="Lobby do Jogo" width="45%">
  <img src="./assets/board-gameplay.png" alt="Tabuleiro em Jogo" width="45%">
</div>

---

## 🚀 Funcionalidades

- **Lobby & Matchmaking:**
  - Criação de salas privadas via código.
  - Listagem em tempo real de salas disponíveis.
  - Sistema de "Espectador" caso a sala esteja cheia.
- **Mecânicas de Jogo (Regras):**
  - **Movimentação:** Validação de movimentos diagonais no Frontend e Backend.
  - **Captura:** Lógica para "comer" peças adversárias.
  - **Promoção à Dama (King):** Peças que atingem o extremo oposto tornam-se Damas e podem mover-se livremente (frente e trás).
  - **Turnos:** Controle rígido de vez (Brancas vs Pretas).
- **Sistema de Morte Súbita (Timer):**
  - Temporizador de 15 segundos por turno rodando no servidor.
  - Se o tempo esgotar, a vitória é concedida automaticamente ao oponente.
- **Interface (UI/UX):**
  - Design responsivo e moderno com Tailwind CSS.
  - Feedback visual de seleção, movimentos e timer vertical ("estilo ampulheta").
  - Modais de Vitória/Derrota personalizados.

---

## 📂 Estrutura do Projeto

O projeto segue uma estrutura de monorepo simples:

```bash
damas/
├── backend/           # API Node.js + Socket.io
│   ├── index.js       # Lógica do servidor, salas e timer
│   └── package.json
│
├── frontend/          # SPA React + Vite
│   ├── src/
│   │   ├── components/ # Board, Lobby, Piece
│   │   └── logic/      # Regras de validação (compartilhada)
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

## ⚡ Como Rodar Localmente

Este projeto requer Node.js (v16+) instalado.

1. Clone o Repositório

```bash
git clone [https://github.com/claudiofsn/damas.git](https://github.com/claudiofsn/damas.git)
cd damas
```

2. Iniciando o Backend (Servidor)
   Abra um terminal na raiz do projeto:

```bash
cd backend
npm install
node index.js
# O servidor iniciará na porta 3000 (http://localhost:3000)
```

3. Iniciando o Frontend (Cliente)
   Abra um segundo terminal na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
# O Vite iniciará a aplicação (geralmente em http://localhost:5173)
```

## 🛠️ Melhorias Futuras

[ ] Implementar captura múltipla (Combo/Sequencial).

[ ] Adicionar Chat de texto na sala.

[ ] Banco de dados para persistir histórico de partidas.

[ ] Deploy automático (CI/CD).

## 👨‍💻 Autor

Desenvolvido por [Seu Nome]
