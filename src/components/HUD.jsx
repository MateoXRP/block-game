export default function HUD({ level, blocksRemaining, timeLeft, timePercent, blockPercent }) {
  const timeBarColor = timePercent < 25 ? 'bg-red-500' : 'bg-green-400';
  const blockBarColor = blockPercent < 25 ? 'bg-yellow-500' : 'bg-blue-400';

  return (
    <div className="w-full text-center mb-4 text-lg font-bold space-y-2">
      <div>🧱 Level: {level}</div>
      <div>
        🧨 Blocks Left: {blocksRemaining}
        <div className="w-full h-3 bg-gray-700 rounded mt-1 overflow-hidden">
          <div
            className={`h-3 ${blockBarColor} transition-all duration-500 ease-linear`}
            style={{ width: `${Math.max(0, blockPercent)}%` }}
          />
        </div>
      </div>
      <div>
        ⏳ Time: {timeLeft}s
        <div className="w-full h-3 bg-gray-700 rounded mt-1 overflow-hidden">
          <div
            className={`h-3 ${timeBarColor} transition-all duration-500 ease-linear`}
            style={{ width: `${Math.max(0, timePercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

