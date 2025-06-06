// src/components/GameOver.jsx
import Leaderboard from './Leaderboard.jsx';

export default function GameOver({ level, totalCleared, onRestart }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-2">💀 Game Over</h2>
      <p className="text-lg">You reached Level {level}</p>
      <p className="text-lg">Total Blocks Cleared: {totalCleared}</p>
      <button
        className="mt-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
        onClick={onRestart}
      >
        🔁 Restart Game
      </button>

      <Leaderboard />
    </div>
  );
}

