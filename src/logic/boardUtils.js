// src/logic/boardUtils.js

export function generateBoard(rows, cols, emojiSet) {
  const board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
      row.push(emoji);
    }
    board.push(row);
  }
  return board;
}

export function findMatches(board) {
  const matches = [];

  // Horizontal matches
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length - 2; c++) {
      const e1 = board[r][c];
      const e2 = board[r][c + 1];
      const e3 = board[r][c + 2];
      if (e1 === e2 && e2 === e3) {
        matches.push([r, c], [r, c + 1], [r, c + 2]);
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < board[0].length; c++) {
    for (let r = 0; r < board.length - 2; r++) {
      const e1 = board[r][c];
      const e2 = board[r + 1][c];
      const e3 = board[r + 2][c];
      if (e1 === e2 && e2 === e3) {
        matches.push([r, c], [r + 1, c], [r + 2, c]);
      }
    }
  }

  return matches;
}

export function swapTiles(board, [r1, c1], [r2, c2]) {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[r1][c1];
  newBoard[r1][c1] = newBoard[r2][c2];
  newBoard[r2][c2] = temp;
  return newBoard;
}

