import { useEffect, useRef, useState } from 'react';

export default function Tile({ emoji, onClick, isSelected, isFading, fromRow, actualRow }) {
  const ref = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const delta = fromRow !== undefined ? fromRow - actualRow : 0;
  const fallPixels = delta * 48;

  useEffect(() => {
    if (ref.current) {
      // Set base position immediately
      ref.current.style.transform = `translateY(${fallPixels}px)`;
      // Force layout reflow, then apply transition
      requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
    }
  }, [fallPixels]);

  return (
    <div
      ref={ref}
      className={`w-12 h-12 text-2xl flex items-center justify-center border border-white cursor-pointer
        ${shouldAnimate ? 'tile-animating' : ''}
        ${isSelected ? 'bg-white text-black scale-110' : ''}
        ${isFading ? 'fade-out' : ''}
      `}
      style={{
        transform: shouldAnimate ? 'translateY(0)' : undefined,
      }}
      onClick={onClick}
    >
      {emoji}
    </div>
  );
}

