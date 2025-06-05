export default function HUD({ level, blocksRemaining, timeLeft }) {
  return (
    <div className="w-full text-center mb-4 text-lg font-bold space-y-2">
      <div>🧱 Level: {level}</div>
      <div>🧨 Blocks Left: {blocksRemaining}</div>
      <div>⏳ Time: {timeLeft}s</div>
    </div>
  );
}

