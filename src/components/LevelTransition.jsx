export default function LevelTransition({ level, totalCleared, onContinue }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-yellow-300 mb-2">🏗️ Level {level}</h2>
      <p className="text-lg mb-2">Blocks Cleared So Far: {totalCleared}</p>
      <button
        className="px-4 py-2 bg-green-400 text-black font-bold rounded hover:bg-green-300"
        onClick={onContinue}
      >
        ▶️ Continue
      </button>
    </div>
  );
}

