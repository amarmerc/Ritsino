const SYMBOLS = {
  1:  { id: 1,  name: 'symbol_1',  emoji: '🍒', rarity: 'common',    label: 'Cereza' },
  2:  { id: 2,  name: 'symbol_2',  emoji: '🍋', rarity: 'common',    label: 'Limón' },
  3:  { id: 3,  name: 'symbol_3',  emoji: '🍊', rarity: 'common',    label: 'Naranja' },
  4:  { id: 4,  name: 'symbol_4',  emoji: '🍉', rarity: 'common',    label: 'Sandía' },
  5:  { id: 5,  name: 'symbol_5',  emoji: '🍇', rarity: 'uncommon',  label: 'Uva' },
  6:  { id: 6,  name: 'symbol_6',  emoji: '🍎', rarity: 'uncommon',  label: 'Manzana' },
  7:  { id: 7,  name: 'symbol_7',  emoji: '🥝', rarity: 'uncommon',  label: 'Kiwi' },
  8:  { id: 8,  name: 'symbol_8',  emoji: '🔔', rarity: 'rare',      label: 'Campana' },
  9:  { id: 9,  name: 'symbol_9',  emoji: '⭐', rarity: 'rare',      label: 'Estrella' },
  10: { id: 10, name: 'symbol_10', emoji: '💎', rarity: 'epic',      label: 'Diamante' },
  11: { id: 11, name: 'symbol_11', emoji: '👑', rarity: 'epic',      label: 'Corona' },
  12: { id: 12, name: 'symbol_12', emoji: '7️⃣', rarity: 'legendary', label: 'Siete' },
  13: { id: 13, name: 'scatter',   emoji: '🎰', rarity: 'scatter',   label: 'Scatter' },
};

const RARITY_COLORS = {
  common: '#94a3b8', uncommon: '#22c55e', rare: '#3b82f6',
  epic: '#a855f7', legendary: '#f0c040', scatter: '#ef4444',
};

const RARITY_GLOW = {
  common: 'none', uncommon: '0 0 8px rgba(34,197,94,0.4)',
  rare: '0 0 12px rgba(59,130,246,0.5)', epic: '0 0 16px rgba(168,85,247,0.6)',
  legendary: '0 0 20px rgba(240,192,64,0.7)', scatter: '0 0 20px rgba(239,68,68,0.7)',
};

export { SYMBOLS, RARITY_COLORS, RARITY_GLOW };
