// Symbol configuration — maps symbol IDs to display info
// The user can replace images in /public/symbols/ to customize

const SYMBOLS = {
  1: { id: 1, name: 'symbol_1', emoji: '🍒', rarity: 'common', label: 'Cereza', image: '/symbols/symbol_1.png' },
  2: { id: 2, name: 'symbol_2', emoji: '🍋', rarity: 'common', label: 'Limón', image: '/symbols/symbol_2.png' },
  3: { id: 3, name: 'symbol_3', emoji: '🍊', rarity: 'uncommon', label: 'Naranja', image: '/symbols/symbol_3.png' },
  4: { id: 4, name: 'symbol_4', emoji: '🍇', rarity: 'uncommon', label: 'Uva', image: '/symbols/symbol_4.png' },
  5: { id: 5, name: 'symbol_5', emoji: '🔔', rarity: 'rare', label: 'Campana', image: '/symbols/symbol_5.png' },
  6: { id: 6, name: 'symbol_6', emoji: '⭐', rarity: 'rare', label: 'Estrella', image: '/symbols/symbol_6.png' },
  7: { id: 7, name: 'symbol_7', emoji: '💎', rarity: 'epic', label: 'Diamante', image: '/symbols/symbol_7.png' },
  8: { id: 8, name: 'symbol_8', emoji: '7️⃣', rarity: 'legendary', label: 'Siete', image: '/symbols/symbol_8.png' },
  9: { id: 9, name: 'scatter', emoji: '🎰', rarity: 'scatter', label: 'Scatter', image: '/symbols/scatter.png' },
};

// Rarity colors for UI
const RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f0c040',
  scatter: '#ef4444',
};

const RARITY_GLOW = {
  common: 'none',
  uncommon: '0 0 8px rgba(34, 197, 94, 0.4)',
  rare: '0 0 12px rgba(59, 130, 246, 0.5)',
  epic: '0 0 16px rgba(168, 85, 247, 0.6)',
  legendary: '0 0 20px rgba(240, 192, 64, 0.7)',
  scatter: '0 0 20px rgba(239, 68, 68, 0.7)',
};

export { SYMBOLS, RARITY_COLORS, RARITY_GLOW };
