// ============================================
// RITSINO — Slot Engine (7×4 Cluster Pays + Scatter Bonus)
// ============================================

const SYMBOLS = [
  { id: 1,  name: 'symbol_1',  rarity: 'common', weight: 20 },
  { id: 2,  name: 'symbol_2',  rarity: 'common', weight: 20 },
  { id: 3,  name: 'symbol_3',  rarity: 'common', weight: 18 },
  { id: 4,  name: 'symbol_4',  rarity: 'common', weight: 18 },
  { id: 5,  name: 'symbol_5',  rarity: 'uncommon', weight: 6 },
  { id: 6,  name: 'symbol_6',  rarity: 'uncommon', weight: 6 },
  { id: 7,  name: 'symbol_7',  rarity: 'uncommon', weight: 5 },
  { id: 8,  name: 'symbol_8',  rarity: 'rare', weight: 3 },
  { id: 9,  name: 'symbol_9',  rarity: 'rare', weight: 3 },
  { id: 10, name: 'symbol_10', rarity: 'epic', weight: 2 },
  { id: 11, name: 'symbol_11', rarity: 'epic', weight: 2 },
  { id: 12, name: 'symbol_12', rarity: 'legendary', weight: 1 },
  { id: 13, name: 'scatter',   rarity: 'scatter', weight: 2 },
];

const PAYOUTS = {
  common:    { 4: 0.2, 6: 0.5, 8: 1,  12: 2.5 },
  uncommon:  { 4: 0.5, 6: 1,   8: 2.5, 12: 6 },
  rare:      { 4: 1,   6: 3,   8: 6,   12: 15 },
  epic:      { 4: 3,   6: 8,   8: 15,  12: 40 },
  legendary: { 4: 5,   6: 15,  8: 30,  12: 60 },
  scatter:   { 3: 5,   4: 20,  5: 50 },
};

const GRID_COLS = 7;
const GRID_ROWS = 4;
const TOTAL_WEIGHT = SYMBOLS.reduce((s, sym) => s + sym.weight, 0);

// === BONUS CONFIG ===
const BONUS_CELLS = [
  { type: 'points', mult: 0.1, weight: 22 },
  { type: 'points', mult: 0.2, weight: 18 },
  { type: 'points', mult: 0.5, weight: 10 },
  { type: 'points', mult: 1,   weight: 5 },
  { type: 'points', mult: 2,   weight: 2 },
  { type: 'points', mult: 5,   weight: 1 },
  { type: 'marmot', weight: 3 },
  { type: 'empty',  weight: 30 },
];
const BONUS_TOTAL_W = BONUS_CELLS.reduce((s, c) => s + c.weight, 0);

function pickSymbol() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) { r -= s.weight; if (r <= 0) return s; }
  return SYMBOLS[0];
}

function generateGrid() {
  const grid = [];
  for (let c = 0; c < GRID_COLS; c++) {
    const col = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      col.push(r > 0 && Math.random() < 0.30 ? col[r - 1] : pickSymbol());
    }
    grid.push(col);
  }
  for (let c = 1; c < GRID_COLS; c++)
    for (let r = 0; r < GRID_ROWS; r++)
      if (Math.random() < 0.15) grid[c][r] = grid[c - 1][r];
  return grid;
}

function findClusters(grid) {
  const vis = Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(false));
  const clusters = [];
  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < GRID_ROWS; r++) {
      if (vis[c][r]) continue;
      const sid = grid[c][r].id;
      const pos = [];
      const q = [{ col: c, row: r }];
      vis[c][r] = true;
      while (q.length) {
        const cur = q.shift();
        pos.push(cur);
        for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
          const nc = cur.col + dc, nr = cur.row + dr;
          if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS && !vis[nc][nr] && grid[nc][nr].id === sid) {
            vis[nc][nr] = true;
            q.push({ col: nc, row: nr });
          }
        }
      }
      clusters.push({ symbolId: sid, positions: pos });
    }
  }
  return clusters;
}

function getMultiplier(rarity, count) {
  const tiers = PAYOUTS[rarity];
  if (!tiers) return 0;
  for (const t of Object.keys(tiers).map(Number).sort((a, b) => b - a))
    if (count >= t) return tiers[t];
  return 0;
}

function countScatters(grid) {
  let count = 0; const pos = [];
  for (let c = 0; c < GRID_COLS; c++)
    for (let r = 0; r < GRID_ROWS; r++)
      if (grid[c][r].rarity === 'scatter') { count++; pos.push({ col: c, row: r }); }
  return { count, positions: pos };
}

function evaluateGrid(grid, betAmount) {
  const wins = []; let totalWin = 0;
  for (const cl of findClusters(grid)) {
    const sym = SYMBOLS.find(s => s.id === cl.symbolId);
    if (!sym || sym.rarity === 'scatter') continue;
    const m = getMultiplier(sym.rarity, cl.positions.length);
    if (m > 0) {
      const w = Math.round(betAmount * m);
      wins.push({ symbolId: sym.id, symbolName: sym.name, rarity: sym.rarity, count: cl.positions.length, multiplier: m, winAmount: w, positions: cl.positions });
      totalWin += w;
    }
  }
  const sc = countScatters(grid);
  if (sc.count >= 3) {
    const ss = SYMBOLS.find(s => s.rarity === 'scatter');
    const m = getMultiplier('scatter', sc.count);
    if (m > 0) { const w = Math.round(betAmount * m); wins.push({ symbolId: ss.id, symbolName: ss.name, rarity: 'scatter', count: sc.count, multiplier: m, winAmount: w, positions: sc.positions }); totalWin += w; }
  }
  return { totalWin, wins };
}

// === BONUS SPIN GENERATION ===
function pickBonusCell(betAmount) {
  let r = Math.random() * BONUS_TOTAL_W;
  for (const bc of BONUS_CELLS) {
    r -= bc.weight;
    if (r <= 0) {
      if (bc.type === 'points') return { type: 'points', value: Math.round(betAmount * bc.mult) };
      if (bc.type === 'marmot') return { type: 'marmot' };
      return { type: 'empty', displayId: Math.ceil(Math.random() * 12) };
    }
  }
  return { type: 'empty', displayId: 1 };
}

function generateBonusGrid(betAmount) {
  const grid = [];
  for (let c = 0; c < GRID_COLS; c++) {
    const col = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      if (r > 0 && col[r - 1].type === 'points' && Math.random() < 0.35) {
        col.push({ ...col[r - 1] });
      } else {
        col.push(pickBonusCell(betAmount));
      }
    }
    grid.push(col);
  }
  for (let c = 1; c < GRID_COLS; c++)
    for (let r = 0; r < GRID_ROWS; r++)
      if (grid[c - 1][r].type === 'points' && Math.random() < 0.2)
        grid[c][r] = { ...grid[c - 1][r] };
  return grid;
}

function evaluateBonusGrid(grid, phase) {
  let totalPts = 0, marmots = 0;
  const marmotPos = [], pointPos = [];
  for (let c = 0; c < GRID_COLS; c++)
    for (let r = 0; r < GRID_ROWS; r++) {
      const cell = grid[c][r];
      if (cell.type === 'points') { totalPts += cell.value; pointPos.push({ col: c, row: r }); }
      else if (cell.type === 'marmot') { marmots++; marmotPos.push({ col: c, row: r }); }
    }
  let spinWin = 0;
  const winPos = [];
  if (marmots > 0) {
    const phaseMult = phase + 1;
    spinWin = totalPts * Math.pow(phaseMult, marmots);
    winPos.push(...pointPos, ...marmotPos);
  } else {
    // Only clustered points pay
    const vis = Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(false));
    for (let c = 0; c < GRID_COLS; c++)
      for (let r = 0; r < GRID_ROWS; r++) {
        if (vis[c][r] || grid[c][r].type !== 'points') { vis[c][r] = true; continue; }
        const pos = []; let val = 0;
        const q = [{ col: c, row: r }]; vis[c][r] = true;
        while (q.length) {
          const cur = q.shift(); pos.push(cur);
          val += grid[cur.col][cur.row].value;
          for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
            const nc = cur.col + dc, nr = cur.row + dr;
            if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS && !vis[nc][nr] && grid[nc][nr].type === 'points') {
              vis[nc][nr] = true; q.push({ col: nc, row: nr });
            }
          }
        }
        if (pos.length >= 4) { spinWin += val; winPos.push(...pos); }
      }
  }
  return { spinWin: Math.round(spinWin), marmotCount: marmots, totalScreenPoints: totalPts, winningPositions: winPos, marmotPositions: marmotPos };
}

function generateBonusSequence(betAmount) {
  let phase = 1, spinsLeft = 10, phaseMarmots = 0, totalBonusWin = 0;
  const spins = [];
  while (spinsLeft > 0) {
    spinsLeft--;
    const grid = generateBonusGrid(betAmount);
    const ev = evaluateBonusGrid(grid, phase);
    totalBonusWin += ev.spinWin;
    phaseMarmots += ev.marmotCount;
    const spinData = { grid, ...ev, phase, phaseMarmots, spinsLeft, totalBonusWin, phaseUp: false };
    if (phaseMarmots >= 4 && phase < 4) {
      phase++; phaseMarmots = 0; spinsLeft += 10;
      spinData.phaseUp = true; spinData.newPhase = phase; spinData.spinsLeft = spinsLeft;
    }
    spins.push(spinData);
  }
  return { bonusSpins: spins, totalBonusWin };
}

function spin(betAmount) {
  const grid = generateGrid();
  const gridData = grid.map(col => col.map(s => s.id));
  const { totalWin, wins } = evaluateGrid(grid, betAmount);
  const sc = countScatters(grid);
  const bonusTriggered = sc.count >= 3;
  const result = { grid: gridData, totalWin, wins, betAmount, isWin: totalWin > 0, bonusTriggered };
  if (bonusTriggered) {
    const bonus = generateBonusSequence(betAmount);
    result.bonusSpins = bonus.bonusSpins;
    result.totalBonusWin = bonus.totalBonusWin;
    result.totalWin += bonus.totalBonusWin;
  }
  return result;
}

module.exports = { spin, SYMBOLS, PAYOUTS, GRID_COLS, GRID_ROWS };
