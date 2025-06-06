// src/hooks/useGameEngine.js
import { useEffect, useRef, useState, useMemo } from 'react';
import { generateBoard, findMatches } from '../logic/boardUtils.js';
import { getShuffledEmojiSets } from '../logic/emojiSets.js';
import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const STARTING_TIMER = 40;
const MIN_TIMER = 10;
const BASE_TARGET = 20;

export function useGameEngine(playerName) {
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

  const totalClearedRef = useRef(0);
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
      totalClearedRef.current = updated;
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

  return {
    level,
    board,
    setBoard,
    emojiSet,
    blocksRemaining,
    targetBlocks,
    timeLeft,
    isGameOver,
    isLevelTransition,
    messages,
    totalCleared,
    timePercent: (timeLeft / STARTING_TIMER) * 100,
    blockPercent: (blocksRemaining / targetBlocks) * 100,
    handleClearBlocks,
    applyTimeBonus,
    logMessage,
    continueToNextLevel,
    resetGame,
  };
}

function generateCleanBoard(emojiSet, rows = 6, cols = 6) {
  let board;
  do {
    board = generateBoard(rows, cols, emojiSet);
  } while (findMatches(board).length > 0);
  return board;
}

