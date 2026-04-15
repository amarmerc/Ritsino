import { useState, useEffect, useRef } from 'react';
import { SYMBOLS, RARITY_GLOW } from '../../config/symbols';

// Cache which images exist to avoid re-checking
const imageCache = {};

function preloadImage(src) {
  if (imageCache[src] !== undefined) return Promise.resolve(imageCache[src]);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { imageCache[src] = true; resolve(true); };
    img.onerror = () => { imageCache[src] = false; resolve(false); };
    img.src = src;
  });
}

export default function Symbol({ symbolId, isWinning, spinning, delay }) {
  const symbol = SYMBOLS[symbolId];
  const [hasImage, setHasImage] = useState(null); // null=loading, true/false
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!symbol) return;
    const src = `/symbols/${symbol.name}.png`;
    // Use cache if available
    if (imageCache[src] !== undefined) {
      setHasImage(imageCache[src]);
      return;
    }
    preloadImage(src).then((ok) => {
      if (mountedRef.current) setHasImage(ok);
    });
  }, [symbol]);

  if (!symbol) return null;

  const style = {
    animationDelay: delay ? `${delay}ms` : '0ms',
    ...(isWinning && { boxShadow: RARITY_GLOW[symbol.rarity] }),
  };

  const className = [
    'slot-cell',
    isWinning && 'winning',
    spinning && 'spinning',
    !spinning && 'slot-cell-appear',
  ].filter(Boolean).join(' ');

  // During spinning, show emoji (fast, no image loading flicker)
  const showImage = hasImage && !spinning;

  return (
    <div className={className} style={style} title={symbol.label}>
      {showImage ? (
        <img
          src={`/symbols/${symbol.name}.png`}
          alt={symbol.label}
          draggable={false}
        />
      ) : (
        <span className="symbol-emoji">{symbol.emoji}</span>
      )}
    </div>
  );
}
