// src/App.jsx
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Board from './components/Board.jsx';
import HUD from './components/HUD.jsx';
import MessageLog from './components/MessageLog.jsx';
import GameOver from './components/GameOver.jsx';
import LevelTransition from './components/LevelTransition.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    const savedName = Cookies.get('blockGameName');
    if (savedName) setPlayerName(savedName);
  }, []);

  const {
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
    timePercent,
    blockPercent,
    handleClearBlocks,
    applyTimeBonus,
    logMessage,
    continueToNextLevel,
    resetGame
  } = useGameEngine(playerName);

  const handleAnimationsComplete = () => {
    // no-op
  };

  const signOut = () => {
    Cookies.remove('blockGameName');
    setPlayerName('');
    resetGame();
  };

  if (!playerName) {
    return (
      <LoginScreen
        nameInput={nameInput}
        setNameInput={setNameInput}
        onStart={() => {
          if (nameInput.trim()) {
            const trimmed = nameInput.trim();
            setPlayerName(trimmed);
            Cookies.set('blockGameName', trimmed);
          }
        }}
      />
    );
  }

  let content;
  if (isGameOver) {
    content = (
      <GameOver
        level={level}
        totalCleared={totalCleared}
        onRestart={resetGame}
        onSignOut={signOut}
      />
    );
  } else if (isLevelTransition) {
    content = (
      <LevelTransition
        level={level + 1}
        totalCleared={totalCleared}
        onContinue={continueToNextLevel}
      />
    );
  } else {
    content = (
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4">🧱 Block Game</h1>
      <div className="w-full max-w-[320px]">
        {content}
      </div>
    </div>
  );
}

