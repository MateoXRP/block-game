// src/components/GameOver.jsx
import Leaderboard from './Leaderboard.jsx';

export default function GameOver({ level, totalCleared, onRestart, onSignOut }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-2">💀 Game Over</h2>
      <p className="text-lg">You reached Level {level}</p>
      <p className="text-lg">Total Blocks Cleared: {totalCleared}</p>

      <div className="flex flex-col items-center space-y-2 mt-4">
        <button
          className="px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
          onClick={onRestart}
        >
          🔁 Restart Game
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-400"
          onClick={onSignOut}
        >
          🔚 Sign Out
        </button>
      </div>

      <Leaderboard />
    </div>
  );
}

