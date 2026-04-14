import { SYMBOLS, RARITY_COLORS, RARITY_GLOW } from '../../config/symbols';

export default function Symbol({ symbolId, isWinning, spinning, delay }) {
  const symbol = SYMBOLS[symbolId];
  if (!symbol) return null;

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
      <span className="symbol-emoji">{symbol.emoji}</span>
    </div>
  );
}
