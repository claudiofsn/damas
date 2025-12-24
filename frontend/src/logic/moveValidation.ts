export interface Position {
  row: number;
  col: number;
}

export interface MoveResult {
  isValid: boolean;
  captured?: Position;
}

export const validateMove = (
  board: (number | null)[][],
  from: { row: number, col: number },
  to: { row: number, col: number },
  playerColor: number
) => {
  const piece = board[from.row][from.col];
  if (!piece) return { isValid: false };

  const isKing = piece % 1 !== 0; // Se for 1.1 ou 2.1, é Dama
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);
  const direction = playerColor === 1 ? -1 : 1; // Brancas sobem (-1), Pretas descem (1)

  // 1. MOVIMENTO SIMPLES (1 casa)
  if (Math.abs(rowDiff) === 1 && colDiff === 1) {
    // Se for Dama, permite qualquer direção. Se não, só na 'direction' correta.
    if (isKing || rowDiff === direction) {
      return { isValid: true };
    }
  }

  // 2. CAPTURA (2 casas)
  if (Math.abs(rowDiff) === 2 && colDiff === 2) {
    const midRow = from.row + rowDiff / 2;
    const midCol = from.col + (to.col - from.col) / 2;
    const midPiece = board[midRow][midCol];

    // A Dama pode capturar para trás e para frente.
    // Peças normais, na regra brasileira, também podem capturar para trás!
    // Se quiser permitir captura para trás para todos (Regra Brasileira):
    if (midPiece !== 0 && Math.floor(midPiece!) !== Math.floor(playerColor)) {
      return { isValid: true, captured: { row: midRow, col: midCol } };
    }
  }

  return { isValid: false };
};