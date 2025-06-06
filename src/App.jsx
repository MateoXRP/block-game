import { useEffect, useState, useRef, useMemo } from 'react';
import Board from './components/Board.jsx';
import HUD from './components/HUD.jsx';
import MessageLog from './components/MessageLog.jsx';
import GameOver from './components/GameOver.jsx';
import LevelTransition from './components/LevelTransition.jsx';
import { generateBoard, findMatches } from './logic/boardUtils.js';
import { getShuffledEmojiSets } from './logic/emojiSets.js';
import { db } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const STARTING_TIMER = 40;
const MIN_TIMER = 10;
const BASE_TARGET = 20;

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [level, setLevel] = useState(1);
  const [emojiSetOrder] = useState(getShuffledEmojiSets);
  const emojiSet = useMemo(() => emojiSetOrder[(level - 1) % emojiSetOrder.length], [level, emojiSetOrder]);
  const [board, setBoard] = useState(() => generateCleanBoard(emojiSet));
  const [targetBlocks, setTargetBlocks] = useState(BASE_TARGET);
  const [blocksRemaining, setBlocksRemaining] = useState(BASE_TARGET);
  const [timeLeft, setTimeLeft] = useState(STARTING_TIMER);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelTransition, setIsLevelTransition] = useState(false);
  const [messages, setMessages] = useState([]);
  const [totalCleared, setTotalCleared] = useState(0);
  const totalClearedRef = useRef(0); // ✅ capture latest totalCleared for writes
  const timerRef = useRef(null);
  const hasSubmittedScore = useRef(false);

  useEffect(() => {
    if (isGameOver || isLevelTransition || !playerName) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => {
            handleGameOver();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [level, isGameOver, isLevelTransition, playerName]);

  const handleClearBlocks = (count) => {
    setTotalCleared((prev) => {
      const updated = prev + count;
      totalClearedRef.current = updated; // ✅ update ref value
      return updated;
    });
    setBlocksRemaining((prev) => {
      const newRemaining = prev - count;
      if (newRemaining <= 0) {
        triggerLevelTransition();
      }
      return newRemaining;
    });
  };

  const handleAnimationsComplete = () => {};

  const applyTimeBonus = (seconds) => {
    setTimeLeft(prev => prev + seconds);
  };

  const logMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const triggerLevelTransition = () => {
    clearInterval(timerRef.current);
    setIsLevelTransition(true);
    setMessages([]);
  };

  const continueToNextLevel = () => {
    const nextLevel = level + 1;
    const newTimer = Math.max(MIN_TIMER, STARTING_TIMER - (nextLevel - 1));
    const newTarget = BASE_TARGET + 5 * (nextLevel - 1);
    const nextEmojiSet = emojiSetOrder[(nextLevel - 1) % emojiSetOrder.length];
    const newBoard = generateCleanBoard(nextEmojiSet);

    setLevel(nextLevel);
    setTargetBlocks(newTarget);
    setBlocksRemaining(newTarget);
    setTimeLeft(newTimer);
    setBoard(newBoard);
    setIsLevelTransition(false);
  };

  const handleGameOver = async () => {
    if (hasSubmittedScore.current || !playerName) return;
    hasSubmittedScore.current = true;

    setIsGameOver(true);

    const cleared = totalClearedRef.current;
    const ref = doc(db, "block_leaderboard", playerName);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, {
        name: playerName,
        bestRun: cleared,
        totalBlocks: cleared,
      });
    } else {
      const data = snapshot.data();
      await updateDoc(ref, {
        bestRun: Math.max(data.bestRun, cleared),
        totalBlocks: data.totalBlocks + cleared,
      });
    }

    console.log('🔥 Game Over – Score submitted to Firebase');
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    hasSubmittedScore.current = false;
    totalClearedRef.current = 0;
    const baseEmojiSet = emojiSetOrder[0];
    const baseBoard = generateCleanBoard(baseEmojiSet);

    setLevel(1);
    setBoard(baseBoard);
    setTargetBlocks(BASE_TARGET);
    setBlocksRemaining(BASE_TARGET);
    setTimeLeft(STARTING_TIMER);
    setIsGameOver(false);
    setIsLevelTransition(false);
    setMessages([]);
    setTotalCleared(0);
  };

  const timePercent = (timeLeft / STARTING_TIMER) * 100;
  const blockPercent = (blocksRemaining / targetBlocks) * 100;

  if (!playerName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-3xl font-bold">🧱 Block Game</h1>
        <input
          className="px-4 py-2 text-black rounded"
          placeholder="Enter your name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
          onClick={() => {
            if (nameInput.trim()) setPlayerName(nameInput.trim());
          }}
        >
          ▶️ Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">🧱 Block Game</h1>

      <div className="w-full max-w-[320px] px-2">
        {isGameOver ? (
          <GameOver
            level={level}
            totalCleared={totalCleared}
            onRestart={resetGame}
          />
        ) : isLevelTransition ? (
          <LevelTransition
            level={level + 1}
            totalCleared={totalCleared}
            onContinue={continueToNextLevel}
          />
        ) : (
          <>
            <HUD
              level={level}
              blocksRemaining={blocksRemaining}
              timeLeft={timeLeft}
              timePercent={timePercent}
              blockPercent={blockPercent}
            />
            <Board
              board={board}
              setBoard={setBoard}
              onClear={handleClearBlocks}
              onLog={logMessage}
              onTimeBonus={applyTimeBonus}
              onAnimationsComplete={handleAnimationsComplete}
              emojiSet={emojiSet}
            />
            <MessageLog messages={messages} />
          </>
        )}
      </div>
    </div>
  );
}

function generateCleanBoard(emojiSet, rows = 6, cols = 6) {
  let board;
  do {
    board = generateBoard(rows, cols, emojiSet);
  } while (findMatches(board).length > 0);
  return board;
}

