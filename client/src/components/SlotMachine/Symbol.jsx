import { useState, useEffect } from 'react';
import { SYMBOLS, RARITY_GLOW } from '../../config/symbols';

export default function Symbol({ symbolId, isWinning, spinning, delay }) {
  const symbol = SYMBOLS[symbolId];
  const [imgError, setImgError] = useState(false);

  // Clear the error state when the symbol changes (fixes emoji fallback during fast spins)
  useEffect(() => {
    setImgError(false);
  }, [symbolId]);

  if (!symbol) return null;

  const imgSrc = `/symbols/${symbol.name}.png`;

  const style = {
    animationDelay: delay ? `${delay}ms` : '0ms',
    ...(isWinning && {
      boxShadow: RARITY_GLOW[symbol.rarity],
    }),
  };

  const className = [
    'slot-cell',
    isWinning && 'winning',
    spinning && 'spinning',
    !spinning && 'slot-cell-appear',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} style={style} title={symbol.label}>
      {!imgError ? (
        <img
          src={imgSrc}
          alt={symbol.label}
          className="symbol-image"
          onError={() => setImgError(true)}
          draggable={false}
        />
      ) : (
        <span className="symbol-emoji">{symbol.emoji}</span>
      )}
    </div>
  );
}
