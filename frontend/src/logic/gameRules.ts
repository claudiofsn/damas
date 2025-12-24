export type GameStatus = 'playing' | 'winner_white' | 'winner_black' | 'draw';

/**
 * Verifica o status do jogo de damas.
 * @param board O tabuleiro 8x8 (0: vazio, 1: branca, 2: preta)
 * @param currentPlayer O jogador da vez (1 ou 2)
 */
export const checkGameStatus = (
  board: (number | null)[][],
  currentPlayer: number
): GameStatus => {
  let whitePieces = 0;
  let blackPieces = 0;
  let canWhiteMove = false;
  let canBlackMove = false;

  // Percorre o tabuleiro uma única vez para contar peças e verificar movimentos
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === 1) {
        whitePieces++;
        if (!canWhiteMove && hasAvailableMoves(board, row, col)) canWhiteMove = true;
      } else if (piece === 2) {
        blackPieces++;
        if (!canBlackMove && hasAvailableMoves(board, row, col)) canBlackMove = true;
      }
    }
  }

  // 1. Verificação por eliminação
  if (whitePieces === 0) return 'winner_black';
  if (blackPieces === 0) return 'winner_white';

  // 2. Verificação por bloqueio (Imobilização)
  if (currentPlayer === 1 && !canWhiteMove) return 'winner_black';
  if (currentPlayer === 2 && !canBlackMove) return 'winner_white';

  return 'playing';
};

// Função auxiliar simples para verificar se há casas vazias adjacentes (simplificada)
const hasAvailableMoves = (board: (number | null)[][], row: number, col: number): boolean => {
  const piece = board[row][col];
  const directions = piece === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  
  // Nota: Para Damas (Kings), as direções seriam as 4 diagonais.
  return directions.some(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    return (
      newRow >= 0 && newRow < 8 && 
      newCol >= 0 && newCol < 8 && 
      board[newRow][newCol] === 0
    );
  });
};