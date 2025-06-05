export default function Tile({ emoji, onClick, isSelected, isMatched }) {
  return (
    <div
      className={`w-12 h-12 text-2xl flex items-center justify-center border border-white cursor-pointer transition-all duration-150
        ${isSelected ? 'bg-white text-black scale-110' : ''}
        ${isMatched ? 'animate-pulse bg-yellow-300 text-black' : ''}
      `}
      onClick={onClick}
    >
      {emoji}
    </div>
  );
}

