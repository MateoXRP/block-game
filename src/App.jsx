import { useEffect, useState, useRef } from 'react';
import Board from './components/Board.jsx';
import HUD from './components/HUD.jsx';
import MessageLog from './components/MessageLog.jsx';
import { generateBoard, findMatches } from './logic/boardUtils.js';

const STARTING_TIMER = 40;
const MIN_TIMER = 10;
const BASE_TARGET = 20;

export default function App() {
  const [board, setBoard] = useState(generateCleanBoard());
  const [level, setLevel] = useState(1);
  const [targetBlocks, setTargetBlocks] = useState(BASE_TARGET);
  const [blocksRemaining, setBlocksRemaining] = useState(BASE_TARGET);
  const [timeLeft, setTimeLeft] = useState(STARTING_TIMER);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelTransition, setIsLevelTransition] = useState(false);
  const [messages, setMessages] = useState([]);
  const [totalCleared, setTotalCleared] = useState(0);
  const timerRef = useRef(null);

  // Start countdown timer
  useEffect(() => {
    if (isGameOver || isLevelTransition) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [level, isGameOver, isLevelTransition]);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const handleClearBlocks = (count) => {
    setTotalCleared((prev) => prev + count);
    setBlocksRemaining((prev) => {
      const updated = prev - count;
      if (updated <= 0) {
        advanceLevel();
      }
      return updated;
    });
  };

  const logMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const advanceLevel = async () => {
    clearInterval(timerRef.current);
    setIsLevelTransition(true);
    setMessages([]); // Clear message log between levels

    const nextLevel = level + 1;
    const newTimer = Math.max(MIN_TIMER, STARTING_TIMER - (nextLevel - 1));
    const newTarget = BASE_TARGET + 5 * (nextLevel - 1);

    setLevel(nextLevel);
    setTargetBlocks(newTarget);
    setBlocksRemaining(newTarget);
    setTimeLeft(newTimer);

    await delay(1500);

    const newBoard = generateCleanBoard();
    setBoard(newBoard);

    await delay(500);
    setIsLevelTransition(false);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    console.log('Game Over – hook Firebase here later');
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setBoard(generateCleanBoard());
    setLevel(1);
    setTargetBlocks(BASE_TARGET);
    setBlocksRemaining(BASE_TARGET);
    setTimeLeft(STARTING_TIMER);
    setIsGameOver(false);
    setIsLevelTransition(false);
    setMessages([]);
    setTotalCleared(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">🧱 Block Game</h1>

      {isGameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">💀 Game Over</h2>
          <p className="text-lg">You reached Level {level}</p>
          <p className="text-lg">Total Blocks Cleared: {totalCleared}</p>
          <button
            className="mt-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
            onClick={resetGame}
          >
            🔁 Restart Game
          </button>
        </div>
      ) : isLevelTransition ? (
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">⚔️ Level {level}</h2>
          <p className="text-lg">Get ready!</p>
        </div>
      ) : (
        <>
          <HUD
            level={level}
            blocksRemaining={blocksRemaining}
            timeLeft={timeLeft}
          />
          <Board
            board={board}
            setBoard={setBoard}
            onClear={handleClearBlocks}
            onLog={logMessage}
          />
          <MessageLog messages={messages} />
        </>
      )}
    </div>
  );
}

// Ensures board starts without any matches
function generateCleanBoard(rows = 6, cols = 6) {
  let board;
  do {
    board = generateBoard(rows, cols);
  } while (findMatches(board).length > 0);
  return board;
}

