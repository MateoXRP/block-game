// src/components/Board.jsx
import { useState } from 'react';
import Tile from './Tile.jsx';
import { swapTiles, findMatches } from '../logic/boardUtils.js';
import { nanoid } from 'nanoid';

const BOARD_SIZE = 6;
const PAUSE_DELAY = 300;
const FALL_DELAY = 200;

const createTile = (emoji, fromRow = undefined, fromCol = undefined) => ({
  id: nanoid(),
  emoji,
  fromRow,
  fromCol,
});

const getRandomEmoji = (emojiSet) => {
  return emojiSet[Math.floor(Math.random() * emojiSet.length)];
};

export default function Board({ board, setBoard, onClear, onLog, onTimeBonus, onAnimationsComplete, emojiSet }) {
  const [selected, setSelected] = useState(null);
  const [animatedBoard, setAnimatedBoard] = useState(board.map((row, r) =>
    row.map((emoji, c) => createTile(emoji, r, c))
  ));
  const [highlightIds, setHighlightIds] = useState(new Set());

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const groupMatches = (matches) => {
    const visited = new Set();
    const groups = [];

    const key = (r, c) => `${r},${c}`;
    const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (const [r, c] of matches) {
      const k = key(r, c);
      if (visited.has(k)) continue;

      const queue = [[r, c]];
      const group = [];

      while (queue.length) {
        const [cr, cc] = queue.pop();
        const ck = key(cr, cc);
        if (visited.has(ck)) continue;

        visited.add(ck);
        group.push([cr, cc]);

        for (const [dr, dc] of neighbors) {
          const nr = cr + dr;
          const nc = cc + dc;
          const nk = key(nr, nc);
          if (matches.some(([mr, mc]) => mr === nr && mc === nc) && !visited.has(nk)) {
            queue.push([nr, nc]);
          }
        }
      }

      if (group.length > 0) groups.push(group);
    }

    return groups;
  };

  const handleResolve = async (tileBoard) => {
    let current = tileBoard;
    let chainCount = 0;

    while (true) {
      const matches = findMatches(current.map(row => row.map(tile => tile.emoji)));
      if (matches.length === 0) break;

      const matchIds = new Set(matches.map(([r, c]) => current[r][c].id));
      setHighlightIds(matchIds);
      await delay(PAUSE_DELAY);

      const boardWithGaps = current.map(row =>
        row.map(tile => (tile && matchIds.has(tile.id) ? null : tile))
      );

      setHighlightIds(new Set());

      const { newBoard } = clearAndFall(boardWithGaps);
      setAnimatedBoard(newBoard);
      await delay(FALL_DELAY + 50);

      const cleanedBoard = newBoard.map((row, r) =>
        row.map((tile, c) => ({ id: tile.id, emoji: tile.emoji }))
      );
      setAnimatedBoard(cleanedBoard);
      setBoard(cleanedBoard.map(row => row.map(tile => tile.emoji)));

      const grouped = groupMatches(matches);
      const largestMatchSize = Math.max(...grouped.map(g => g.length), 0);

      // ✅ NEW: Corrected time bonus logic
      let matchBonus = largestMatchSize >= 5 ? 2 : (largestMatchSize === 4 ? 1 : 0);
      const chainBonus = chainCount > 1 ? 1 : 0;
      let totalTimeBonus = matchBonus + chainBonus;
      totalTimeBonus = Math.min(totalTimeBonus, 3);

      if (largestMatchSize >= 4) onLog(`💥 ${largestMatchSize}-match bonus!`);
      if (chainBonus > 0) onLog(`⛓️ Chain clear bonus!`);
      if (totalTimeBonus > 0) {
        onLog(`⏱️ +${totalTimeBonus}s time bonus!`);
        onTimeBonus(totalTimeBonus);
      }

      onClear(matches.length);
      chainCount++;
      current = cleanedBoard;
    }

    onAnimationsComplete();
  };

  const clearAndFall = (tileBoard) => {
    const newBoard = tileBoard.map(row => [...row]);

    for (let c = 0; c < BOARD_SIZE; c++) {
      const column = [];

      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        const tile = newBoard[r][c];
        if (tile !== null) {
          column.push({ ...tile, fromRow: r, fromCol: c });
        }
      }

      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        const slot = column.shift();
        if (slot) {
          newBoard[r][c] = { id: slot.id, emoji: slot.emoji, fromRow: slot.fromRow, fromCol: slot.fromCol };
        } else {
          const newTile = createTile(getRandomEmoji(emojiSet), -1, c);
          newBoard[r][c] = newTile;
        }
      }
    }

    return { newBoard };
  };

  const handleTileClick = async (r, c) => {
    if (!animatedBoard[r][c]) return;

    if (!selected) {
      setSelected([r, c]);
    } else if (selected[0] === r && selected[1] === c) {
      setSelected(null);
    } else {
      const [r1, c1] = selected;
      const isAdjacent =
        (Math.abs(r - r1) === 1 && c === c1) ||
        (Math.abs(c - c1) === 1 && r === r1);

      if (isAdjacent) {
        const cloned = animatedBoard.map((row, rowIndex) =>
          row.map((tile, colIndex) => ({
            ...tile,
            fromRow: rowIndex,
            fromCol: colIndex
          }))
        );

        const swapped = swapTiles(cloned, [r, c], selected);
        const match = findMatches(swapped.map(row => row.map(tile => tile.emoji)));

        if (match.length > 0) {
          setAnimatedBoard(swapped);
          await new Promise(resolve => requestAnimationFrame(resolve));
          handleResolve(swapped);
        } else {
          setAnimatedBoard(swapped);
          setBoard(swapped.map(row => row.map(tile => tile.emoji)));
          onAnimationsComplete();
        }
        setSelected(null);
      } else {
        setSelected([r, c]);
      }
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-6 gap-1">
        {animatedBoard.map((row, r) =>
          row.map((tile, c) =>
            tile ? (
              <Tile
                key={tile.id}
                emoji={tile.emoji}
                isSelected={selected?.[0] === r && selected?.[1] === c}
                isFading={highlightIds.has(tile.id)}
                fromRow={tile.fromRow}
                actualRow={r}
                fromCol={tile.fromCol}
                actualCol={c}
                onClick={() => handleTileClick(r, c)}
              />
            ) : (
              <div key={`empty-${r}-${c}`} className="w-12 h-12" />
            )
          )
        )}
      </div>
    </div>
  );
}

