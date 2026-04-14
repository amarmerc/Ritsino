// ============================================
// RITSINO — Slot Engine (6×5 Scatter Pays)
// ============================================

// Symbol definitions with weights and payouts
const SYMBOLS = [
  { id: 1, name: 'symbol_1', rarity: 'common', weight: 25 },
  { id: 2, name: 'symbol_2', rarity: 'common', weight: 25 },
  { id: 3, name: 'symbol_3', rarity: 'uncommon', weight: 12 },
  { id: 4, name: 'symbol_4', rarity: 'uncommon', weight: 12 },
  { id: 5, name: 'symbol_5', rarity: 'rare', weight: 6 },
  { id: 6, name: 'symbol_6', rarity: 'rare', weight: 6 },
  { id: 7, name: 'symbol_7', rarity: 'epic', weight: 4 },
  { id: 8, name: 'symbol_8', rarity: 'legendary', weight: 2 },
  { id: 9, name: 'scatter', rarity: 'scatter', weight: 1 },
];

// Payout table: { minCount: multiplier }
const PAYOUTS = {
  common:    { 5: 0.5, 8: 1, 12: 2 },
  uncommon:  { 5: 1,   8: 2, 12: 4 },
  rare:      { 5: 2,   8: 4, 12: 8 },
  epic:      { 5: 5,   8: 10, 12: 25 },
  legendary: { 5: 10,  8: 25, 12: 50 },
  scatter:   { 3: 5,   4: 20, 5: 50, 6: 100 },
};

const GRID_COLS = 6;
const GRID_ROWS = 5;

// Total weight for weighted random selection
const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

/**
 * Pick a random symbol based on weights
 */
function pickRandomSymbol() {
  let random = Math.random() * TOTAL_WEIGHT;
  for (const symbol of SYMBOLS) {
    random -= symbol.weight;
    if (random <= 0) return symbol;
  }
  return SYMBOLS[0]; // fallback
}

/**
 * Generate a 6×5 grid of random symbols
 * Returns a 2D array: grid[col][row]
 */
function generateGrid() {
  const grid = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const column = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      column.push(pickRandomSymbol());
    }
    grid.push(column);
  }
  return grid;
}

/**
 * Count occurrences of each symbol in the grid
 */
function countSymbols(grid) {
  const counts = {};
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      const sym = grid[col][row];
      counts[sym.id] = (counts[sym.id] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Get the positions of matching symbols in the grid
 */
function getWinningPositions(grid, symbolId) {
  const positions = [];
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) {
      if (grid[col][row].id === symbolId) {
        positions.push({ col, row });
      }
    }
  }
  return positions;
}

/**
 * Calculate the payout multiplier for a symbol count
 */
function getMultiplier(rarity, count) {
  const payoutTiers = PAYOUTS[rarity];
  if (!payoutTiers) return 0;

  let multiplier = 0;
  const thresholds = Object.keys(payoutTiers)
    .map(Number)
    .sort((a, b) => b - a); // descending

  for (const threshold of thresholds) {
    if (count >= threshold) {
      multiplier = payoutTiers[threshold];
      break;
    }
  }
  return multiplier;
}

/**
 * Evaluate the grid and calculate total win
 * @param {Array} grid - 6×5 grid of symbols
 * @param {number} betAmount - Amount bet
 * @returns {Object} - { totalWin, wins: [{symbolId, symbolName, count, multiplier, winAmount, positions}] }
 */
function evaluateGrid(grid, betAmount) {
  const counts = countSymbols(grid);
  const wins = [];
  let totalWin = 0;

  for (const [symbolIdStr, count] of Object.entries(counts)) {
    const symbolId = parseInt(symbolIdStr);
    const symbol = SYMBOLS.find(s => s.id === symbolId);
    if (!symbol) continue;

    const multiplier = getMultiplier(symbol.rarity, count);
    if (multiplier > 0) {
      const winAmount = Math.round(betAmount * multiplier);
      const positions = getWinningPositions(grid, symbolId);
      wins.push({
        symbolId: symbol.id,
        symbolName: symbol.name,
        rarity: symbol.rarity,
        count,
        multiplier,
        winAmount,
        positions,
      });
      totalWin += winAmount;
    }
  }

  return { totalWin, wins };
}

/**
 * Execute a full spin
 * @param {number} betAmount - Amount bet
 * @returns {Object} - Full spin result
 */
function spin(betAmount) {
  const grid = generateGrid();

  // Convert grid to serializable format (just IDs)
  const gridData = grid.map(col => col.map(sym => sym.id));

  const { totalWin, wins } = evaluateGrid(grid, betAmount);

  return {
    grid: gridData,
    totalWin,
    wins,
    betAmount,
    isWin: totalWin > 0,
  };
}

module.exports = {
  spin,
  SYMBOLS,
  PAYOUTS,
  GRID_COLS,
  GRID_ROWS,
};
