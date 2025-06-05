import { useEffect, useState } from 'react';
import Tile from './Tile.jsx';
import {
  swapTiles,
  findMatches,
  clearMatches,
} from '../logic/boardUtils.js';

const BOARD_SIZE = 6;
const ANIMATION_DELAY = 250;

export default function Board({ board, setBoard, onClear, onLog }) {
  const [selected, setSelected] = useState(null);
  const [matchedTiles, setMatchedTiles] = useState([]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleResolve = async (startingBoard) => {
    let current = startingBoard;
    let chainCount = 0;

    while (true) {
      const matches = findMatches(current);
      if (matches.length === 0) break;

      setMatchedTiles(matches.map(([r, c]) => `${r}-${c}`));
      await delay(ANIMATION_DELAY);

      current = clearMatches(current, matches);
      setMatchedTiles([]);
      setBoard(current);

      const bonus =
        matches.length >= 5 ? 2 :
        matches.length === 4 ? 1 : 0;

      if (matches.length >= 4) {
        onLog(`💥 ${matches.length}-match bonus!`);
      }
      if (chainCount > 0) {
        onLog(`⛓️ Chain clear bonus!`);
      }

      onClear(matches.length + bonus);
      chainCount++;

      await delay(ANIMATION_DELAY);
    }
  };

  const handleTileClick = (r, c) => {
    if (!selected) {
      setSelected([r, c]);
    } else if (selected[0] === r && selected[1] === c) {
      // ✅ Deselect tile if clicked again
      setSelected(null);
    } else {
      const [r1, c1] = selected;
      const isAdjacent =
        (Math.abs(r - r1) === 1 && c === c1) ||
        (Math.abs(c - c1) === 1 && r === r1);

      if (isAdjacent) {
        const swapped = swapTiles(board, [r, c], selected);
        const match = findMatches(swapped);
        if (match.length > 0) {
          handleResolve(swapped);
        } else {
          setBoard(swapped); // allow unmatched swap
        }
        setSelected(null);
      } else {
        setSelected([r, c]);
      }
    }
  };

  return (
    <div className="grid grid-cols-6 gap-1">
      {board.map((row, r) =>
        row.map((tile, c) => (
          <Tile
            key={`${r}-${c}`}
            emoji={tile}
            isSelected={selected?.[0] === r && selected?.[1] === c}
            isMatched={matchedTiles.includes(`${r}-${c}`)}
            onClick={() => handleTileClick(r, c)}
          />
        ))
      )}
    </div>
  );
}

