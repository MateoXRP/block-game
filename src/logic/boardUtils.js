const EMOJIS = ['🧱', '🍀', '🔥', '💎', '🌈', '🎈'];

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

// Create a board that avoids 3+ horizontal/vertical matches
export function generateBoard(rows = 6, cols = 6) {
  const board = [];

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let newEmoji;
      let attempts = 0;

      do {
        newEmoji = randomEmoji();
        attempts++;
      } while (
        causesHorizontalMatch(row, c, newEmoji) ||
        causesVerticalMatch(board, r, c, newEmoji)
      );

      row.push(newEmoji);
    }
    board.push(row);
  }

  return board;
}

function causesHorizontalMatch(row, c, emoji) {
  return (
    (c >= 2 && row[c - 1] === emoji && row[c - 2] === emoji) ||
    (c >= 3 && row[c - 1] === emoji && row[c - 2] === emoji && row[c - 3] === emoji)
  );
}

function causesVerticalMatch(board, r, c, emoji) {
  return (
    (r >= 2 && board[r - 1][c] === emoji && board[r - 2][c] === emoji) ||
    (r >= 3 && board[r - 1][c] === emoji && board[r - 2][c] === emoji && board[r - 3][c] === emoji)
  );
}

// Swap two tiles
export function swapTiles(board, pos1, pos2) {
  const newBoard = board.map(row => [...row]);
  const [r1, c1] = pos1;
  const [r2, c2] = pos2;
  const temp = newBoard[r1][c1];
  newBoard[r1][c1] = newBoard[r2][c2];
  newBoard[r2][c2] = temp;
  return newBoard;
}

// Find matches of 3 or more in a row/column
export function findMatches(board) {
  const matches = [];
  const rows = board.length;
  const cols = board[0].length;

  // Horizontal matches
  for (let r = 0; r < rows; r++) {
    let count = 1;
    for (let c = 1; c <= cols; c++) {
      if (c < cols && board[r][c] === board[r][c - 1]) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.push([r, c - 1 - i]);
          }
        }
        count = 1;
      }
    }
  }

  // Vertical matches
  for (let c = 0; c < cols; c++) {
    let count = 1;
    for (let r = 1; r <= rows; r++) {
      if (r < rows && board[r][c] === board[r - 1][c]) {
        count++;
      } else {
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.push([r - 1 - i, c]);
          }
        }
        count = 1;
      }
    }
  }

  return matches;
}

// Clear matched tiles and apply gravity
export function clearMatches(board, matches) {
  const newBoard = board.map(row => [...row]);

  for (const [r, c] of matches) {
    newBoard[r][c] = null;
  }

  for (let c = 0; c < board[0].length; c++) {
    let col = [];
    for (let r = 0; r < board.length; r++) {
      if (newBoard[r][c] !== null) {
        col.push(newBoard[r][c]);
      }
    }
    while (col.length < board.length) {
      col.unshift(randomEmoji());
    }
    for (let r = 0; r < board.length; r++) {
      newBoard[r][c] = col[r];
    }
  }

  return newBoard;
}

