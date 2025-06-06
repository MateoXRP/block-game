import { useEffect, useRef, useState } from 'react';

export default function Tile({ emoji, isSelected, isFading, fromRow, actualRow, fromCol, actualCol, onClick }) {
  const ref = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const deltaY = fromRow !== undefined ? fromRow - actualRow : 0;
  const deltaX = fromCol !== undefined ? fromCol - actualCol : 0;

  const startTransform = `translate(${deltaX * 48}px, ${deltaY * 48}px)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial position immediately (no animation yet)
    el.style.transition = 'none';
    el.style.transform = startTransform;

    // Force a browser repaint
    void el.offsetWidth;

    // Then enable animation to final position
    el.style.transition = 'transform 200ms ease-in';
    el.style.transform = 'translate(0, 0)';
    setShouldAnimate(true);
  }, [startTransform]);

  return (
    <div
      ref={ref}
      className={`w-12 h-12 text-2xl flex items-center justify-center border border-white cursor-pointer
        ${shouldAnimate ? '' : ''}
        ${isSelected ? 'bg-white text-black scale-110' : ''}
        ${isFading ? 'bg-yellow-400 text-black' : ''}
      `}
      onClick={onClick}
    >
      {emoji}
    </div>
  );
}

