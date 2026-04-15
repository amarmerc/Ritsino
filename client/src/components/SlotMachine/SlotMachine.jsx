import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gameAPI } from '../../services/api';
import { SYMBOLS } from '../../config/symbols';
import Symbol from './Symbol';
import './SlotMachine.css';

const VALID_BETS = [50, 100, 250, 500];
const AUTO_SPIN_OPTIONS = [10, 25, 50, 100, Infinity];
const GRID_COLS = 7;
const GRID_ROWS = 4;

function emptyGrid() {
  return Array.from({ length: GRID_COLS }, () =>
    Array.from({ length: GRID_ROWS }, () => Math.ceil(Math.random() * 12))
  );
}

function createConfetti() {
  const colors = ['#f0c040', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#06b6d4'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8, duration: 2 + Math.random() * 2,
  }));
}

export default function SlotMachine() {
  const { user, updatePoints } = useAuth();
  const [grid, setGrid] = useState(emptyGrid);
  const [betAmount, setBetAmount] = useState(VALID_BETS[0]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-spin
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [showAutoMenu, setShowAutoMenu] = useState(false);
  const autoSpinRef = useRef(false);
  const spinningRef = useRef(false);

  // Bonus mode
  const [bonusMode, setBonusMode] = useState('none'); // none | intro | playing | phaseUp | complete
  const [bonusSpins, setBonusSpins] = useState([]);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [bonusTotalWin, setBonusTotalWin] = useState(0);
  const [bonusCurrentSpin, setBonusCurrentSpin] = useState(null);
  const [phaseUpInfo, setPhaseUpInfo] = useState(null);

  const winPositions = useCallback(() => {
    if (!result || !result.wins) return new Set();
    const positions = new Set();
    result.wins.forEach(win => {
      win.positions.forEach(pos => positions.add(`${pos.col}-${pos.row}`));
    });
    return positions;
  }, [result]);

  const doSpin = useCallback(async () => {
    if (spinningRef.current || bonusMode !== 'none') return;
    if (!user || user.points < betAmount) { stopAutoSpin(); return; }

    spinningRef.current = true;
    setSpinning(true); setResult(null); setShowConfetti(false);
    const spinInterval = setInterval(() => setGrid(emptyGrid()), 100);

    try {
      const spinResult = await gameAPI.spin(betAmount);
      setTimeout(() => {
        clearInterval(spinInterval);
        setGrid(spinResult.grid);
        setResult(spinResult);
        setSpinning(false);
        spinningRef.current = false;
        
        // Exclude the bonus win from the immediate balance update so it doesn't give away the total
        const preBonusPoints = spinResult.newPoints - (spinResult.totalBonusWin || 0);
        updatePoints(preBonusPoints);

        if (spinResult.totalWin >= betAmount * 3 && !spinResult.bonusTriggered) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }

        if (spinResult.rescued) stopAutoSpin();

        // Trigger bonus mode
        if (spinResult.bonusTriggered && spinResult.bonusSpins) {
          stopAutoSpin();
          setTimeout(() => {
            setBonusSpins(spinResult.bonusSpins);
            setBonusTotalWin(spinResult.totalBonusWin);
            setBonusIndex(0);
            setBonusCurrentSpin(null);
            setBonusMode('intro');
          }, 3500);
        }
      }, 1000);
    } catch (err) {
      clearInterval(spinInterval);
      setSpinning(false); spinningRef.current = false;
      setResult({ error: err.message }); stopAutoSpin();
    }
  }, [betAmount, user, updatePoints, bonusMode]);

  // Auto-spin loop
  useEffect(() => {
    if (!autoSpinning || spinning || bonusMode !== 'none') return;
    if (autoSpinsLeft <= 0 && autoSpinsLeft !== Infinity) { stopAutoSpin(); return; }
    if (!user || user.points < betAmount) { stopAutoSpin(); return; }
    const timer = setTimeout(() => {
      if (autoSpinRef.current) {
        setAutoSpinsLeft(prev => prev === Infinity ? Infinity : prev - 1);
        doSpin();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [autoSpinning, spinning, autoSpinsLeft, doSpin, user, betAmount, bonusMode]);

  // Bonus auto-play
  useEffect(() => {
    if (bonusMode !== 'playing') return;
    if (bonusIndex >= bonusSpins.length) {
      setBonusMode('complete');
      if (result) updatePoints(result.newPoints); // Apply the total final bonus points now
      return;
    }
    const timer = setTimeout(() => {
      // Start 'spinning' phase for bonus
      setBonusCurrentSpin(null);
      
      setTimeout(() => {
        const spin = bonusSpins[bonusIndex];
        setBonusCurrentSpin(spin);

        // Check for phase up
        if (spin.phaseUp) {
          setPhaseUpInfo({ phase: spin.newPhase, multiplier: spin.newPhase + 1 });
          setBonusMode('phaseUp');
          // Resume after showing phase up
          setTimeout(() => {
            setPhaseUpInfo(null);
            setBonusIndex(prev => prev + 1);
            setBonusMode('playing');
          }, 3000);
        } else {
          setBonusIndex(prev => prev + 1);
        }
      }, 500); // 500ms of spinning animation
    }, 1500); // time between spins
    return () => clearTimeout(timer);
  }, [bonusMode, bonusIndex, bonusSpins]);

  // Bonus intro auto-dismiss
  useEffect(() => {
    if (bonusMode === 'intro') {
      const timer = setTimeout(() => setBonusMode('playing'), 3000);
      return () => clearTimeout(timer);
    }
  }, [bonusMode]);

  const startAutoSpin = (count) => {
    setShowAutoMenu(false); setAutoSpinsLeft(count);
    autoSpinRef.current = true; setAutoSpinning(true);
    setAutoSpinsLeft(prev => prev === Infinity ? Infinity : prev - 1);
    doSpin();
  };

  const stopAutoSpin = () => {
    autoSpinRef.current = false; setAutoSpinning(false);
    setAutoSpinsLeft(0); setShowAutoMenu(false);
  };

  const handleSpin = () => {
    if (spinning || autoSpinning || bonusMode !== 'none') return;
    doSpin();
  };

  // Spacebar to spin
  const handleSpinRef = useRef(handleSpin);
  handleSpinRef.current = handleSpin;
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault(); handleSpinRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const winPos = winPositions();
  const inBonus = bonusMode !== 'none';
  const currentBonusSpin = bonusCurrentSpin;

  // Bonus winning positions
  const bonusWinPos = new Set();
  if (currentBonusSpin?.winningPositions) {
    currentBonusSpin.winningPositions.forEach(p => bonusWinPos.add(`${p.col}-${p.row}`));
  }

  return (
    <div className="slot-container">
      {/* Bonus intro screen */}
      {bonusMode === 'intro' && (
        <div className="bonus-screen">
          <div className="bonus-emoji">✊</div>
          <h2>YOU'VE BEEN</h2>
          <h2>MOCION-DE-PROCEDIMENTED</h2>
          <p>10 tiradas especiales ✊</p>
        </div>
      )}

      {/* Bonus complete screen */}
      {bonusMode === 'complete' && (
        <div className="bonus-screen" onClick={() => setBonusMode('none')}>
          <div className="bonus-emoji">🎉</div>
          <h2>¡BONUS COMPLETADO!</h2>
          <div className="bonus-total-win">+{bonusTotalWin.toLocaleString('es-ES')} puntos</div>
          <p>Pulsa para continuar</p>
        </div>
      )}

      {/* Phase up banner */}
      {bonusMode === 'phaseUp' && phaseUpInfo && (
        <div className="phase-up-banner">
          <h3>✊ ¡FASE {phaseUpInfo.phase}! ✊</h3>
          <p>Moción ×{phaseUpInfo.multiplier} · +10 tiradas</p>
        </div>
      )}

      {/* Points bar */}
      <div className="points-bar">
        <div className="points-bar-left">
          <span className="points-bar-amount">💰 {user?.points?.toLocaleString('es-ES') || 0}</span>
          <span className="points-bar-label">puntos</span>
        </div>
        {autoSpinning && !inBonus && (
          <div className="auto-spin-indicator">🔄 Auto: {autoSpinsLeft === Infinity ? '∞' : autoSpinsLeft}</div>
        )}
        {inBonus && currentBonusSpin && (
          <div className="auto-spin-indicator" style={{ background: 'var(--accent-purple-dim)', borderColor: 'rgba(168,85,247,0.3)' }}>
            🦫 Bonus: {currentBonusSpin.spinsLeft + 1} tiradas · Fase {currentBonusSpin.phase} (×{currentBonusSpin.phase + 1})
          </div>
        )}
      </div>

      {/* Machine */}
      <div className={`slot-machine ${inBonus && bonusMode === 'playing' ? 'bonus-active' : ''}`}>
        {/* Bonus overlay */}
        {inBonus && bonusMode === 'playing' && currentBonusSpin && (
          <div className="bonus-overlay">
            <div className="bonus-title">✊ MOCIÓN DE PROCEDIMIENTO</div>
            <div className="bonus-info">
              <span className="bonus-phase-badge">FASE {currentBonusSpin.phase} · ×{currentBonusSpin.phase + 1}</span>
              <span>Tiradas: {currentBonusSpin.spinsLeft + 1}</span>
              <span>Ganado: +{currentBonusSpin.totalBonusWin.toLocaleString('es-ES')}</span>
            </div>
            <div className="bonus-marmot-progress">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`marmot-dot ${i < currentBonusSpin.phaseMociones ? 'filled' : ''}`}>
                  {i < currentBonusSpin.phaseMociones ? '✊' : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="slot-grid" style={inBonus && bonusMode === 'playing' ? { marginTop: '80px' } : {}}>
          {/* NORMAL MODE */}
          {!inBonus && Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => {
              const symbolId = grid[col]?.[row] || 1;
              const posKey = `${col}-${row}`;
              const isWinning = !spinning && result?.isWin && winPos.has(posKey);
              return (
                <Symbol key={`${col}-${row}`} symbolId={symbolId} isWinning={isWinning}
                  spinning={spinning} delay={spinning ? 0 : col * 60 + row * 25} />
              );
            })
          )}

          {/* BONUS MODE */}
          {inBonus && bonusMode === 'playing' && currentBonusSpin && Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => {
              const cell = currentBonusSpin.grid[col]?.[row];
              if (!cell) return <div key={`${col}-${row}`} className="slot-cell" />;
              const posKey = `${col}-${row}`;
              const isWin = bonusWinPos.has(posKey);

              if (cell.type === 'mocion') {
                return (
                  <div key={`${col}-${row}`} className={`slot-cell bonus-cell-marmot slot-cell-appear ${isWin ? 'winning' : ''}`}
                    style={{ animationDelay: `${col * 60 + row * 25}ms` }}>
                    <span className="symbol-emoji">✊</span>
                  </div>
                );
              }
              if (cell.type === 'points') {
                return (
                  <div key={`${col}-${row}`} className={`slot-cell bonus-cell-points slot-cell-appear ${isWin ? 'winning' : ''}`}
                    style={{ animationDelay: `${col * 60 + row * 25}ms` }}>
                    <span className="bonus-value">{cell.value}</span>
                  </div>
                );
              }
              // empty
              return (
                <div key={`${col}-${row}`} className="slot-cell bonus-cell-empty slot-cell-appear"
                  style={{ animationDelay: `${col * 60 + row * 25}ms` }}>
                  <span className="symbol-emoji">{SYMBOLS[cell.displayId]?.emoji || '·'}</span>
                </div>
              );
            })
          )}

          {/* Bonus mode but no spin yet */}
          {inBonus && !currentBonusSpin && Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => (
              <div key={`${col}-${row}`} className="slot-cell spinning">
                {/* Randomly changing symbols generated by the normal grid interval */}
                <span className="symbol-emoji">{SYMBOLS[grid[col]?.[row] || 1]?.emoji}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Controls — hidden during bonus */}
      {!inBonus && (
        <div className="slot-controls">
          <div className="bet-selector">
            <span className="bet-label">Apuesta:</span>
            <div className="bet-options">
              {VALID_BETS.map(bet => (
                <button key={bet} className={`bet-btn ${betAmount === bet ? 'active' : ''}`}
                  onClick={() => !spinning && !autoSpinning && setBetAmount(bet)}
                  disabled={spinning || autoSpinning || (user?.points || 0) < bet}>
                  {bet}
                </button>
              ))}
            </div>
          </div>
          <div className="spin-buttons">
            <button className="btn-primary spin-btn" onClick={handleSpin}
              disabled={spinning || autoSpinning || !user || user.points < betAmount}>
              {spinning ? '⏳ GIRANDO...' : '🎰 GIRAR'}
            </button>
            {autoSpinning ? (
              <button className="btn-auto-stop" onClick={stopAutoSpin}>⏹ PARAR</button>
            ) : (
              <div className="auto-spin-wrapper">
                <button className="btn-auto" onClick={() => setShowAutoMenu(prev => !prev)}
                  disabled={spinning || !user || user.points < betAmount}>🔄 AUTO</button>
                {showAutoMenu && (
                  <div className="auto-spin-menu">
                    {AUTO_SPIN_OPTIONS.map(count => (
                      <button key={count} className="auto-spin-option" onClick={() => startAutoSpin(count)}>
                        {count === Infinity ? '∞ Infinito' : `${count} tiradas`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonus spin result */}
      {inBonus && bonusMode === 'playing' && currentBonusSpin && currentBonusSpin.spinWin > 0 && (
        <div className="win-display win">
          <div className="win-amount">+{currentBonusSpin.spinWin.toLocaleString('es-ES')}</div>
          {currentBonusSpin.mocionCount > 0 && (
            <div className="win-details">
              ✊ ×{currentBonusSpin.mocionCount} moción{currentBonusSpin.mocionCount > 1 ? 'es' : ''} ·
              {currentBonusSpin.totalScreenPoints} pts × {1 + (currentBonusSpin.mocionCount * currentBonusSpin.phase)}
            </div>
          )}
        </div>
      )}

      {/* Normal result display */}
      {!inBonus && (
        <div className={`win-display ${result?.rescued ? 'rescue' : result?.isWin && !spinning ? 'win' : !result && !spinning ? 'lose' : 'lose'}`}>
          {result?.error ? (
            <div style={{ color: 'var(--accent-red)' }}>{result.error}</div>
          ) : result?.isWin && !spinning ? (
            <>
              <div className="win-amount">+{(result.totalWin - (result.totalBonusWin || 0)).toLocaleString('es-ES')} puntos</div>
              <div className="win-breakdown">
                {result.wins.map((win, i) => {
                  const sym = SYMBOLS[win.symbolId];
                  return (
                    <span key={i} className="win-item">
                      {sym && <img src={`/symbols/${sym.name}.png`} alt={sym.label} style={{ width: '18px', height: '18px', objectFit: 'contain' }} draggable={false} />}
                      ×{win.count} = +{win.winAmount}
                    </span>
                  );
                })}
              </div>
              {result.bonusTriggered && <div className="rescue-message" style={{ animation: 'pulse 1.5s infinite' }}>🎰 ¡SCATTER BONUS activado!</div>}
            </>
          ) : result && !spinning ? (
            <div className="win-details" style={{ color: 'var(--text-muted)' }}>Sin premio esta vez... 🍀</div>
          ) : spinning ? (
            <div className="win-details" style={{ color: 'var(--text-muted)' }}>Girando... 🎰</div>
          ) : (
            <div className="win-details" style={{ color: 'var(--text-secondary)' }}>¡Bienvenido a Ritsino! 🎰 Elige tu apuesta y a jugar.</div>
          )}
          {result?.rescued && <div className="rescue-message">{result.rescueMessage}</div>}
        </div>
      )}

      {showConfetti && (
        <div className="confetti-container">
          {createConfetti().map(piece => (
            <div key={piece.id} className="confetti-piece"
              style={{ left: `${piece.left}%`, width: `${piece.size}px`, height: `${piece.size}px`,
                backgroundColor: piece.color, animationDelay: `${piece.delay}s`, animationDuration: `${piece.duration}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
