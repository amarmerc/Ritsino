import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { gameAPI } from '../../services/api';
import { SYMBOLS } from '../../config/symbols';
import Symbol from './Symbol';
import './SlotMachine.css';

const VALID_BETS = [50, 100, 250, 500];
const GRID_COLS = 6;
const GRID_ROWS = 5;

// Generate empty grid
function emptyGrid() {
  return Array.from({ length: GRID_COLS }, () =>
    Array.from({ length: GRID_ROWS }, () => Math.ceil(Math.random() * 8))
  );
}

// Generate confetti pieces
function createConfetti() {
  const colors = ['#f0c040', '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#06b6d4'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }));
}

export default function SlotMachine() {
  const { user, updatePoints } = useAuth();
  const [grid, setGrid] = useState(emptyGrid);
  const [betAmount, setBetAmount] = useState(VALID_BETS[0]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const spinTimeoutRef = useRef(null);

  const winPositions = useCallback(() => {
    if (!result || !result.wins) return new Set();
    const positions = new Set();
    result.wins.forEach(win => {
      win.positions.forEach(pos => {
        positions.add(`${pos.col}-${pos.row}`);
      });
    });
    return positions;
  }, [result]);

  const handleSpin = async () => {
    if (spinning) return;
    if (!user || user.points < betAmount) return;

    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    // Show random symbols during spin animation
    const spinInterval = setInterval(() => {
      setGrid(emptyGrid());
    }, 100);

    try {
      const spinResult = await gameAPI.spin(betAmount);

      // Stop random symbols after a delay for dramatic effect
      setTimeout(() => {
        clearInterval(spinInterval);

        // Set the actual result grid
        setGrid(spinResult.grid);
        setResult(spinResult);
        setSpinning(false);

        // Update points in context
        updatePoints(spinResult.newPoints);

        // Show confetti for big wins
        if (spinResult.totalWin >= betAmount * 3) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 1200);
    } catch (err) {
      clearInterval(spinInterval);
      setSpinning(false);
      setResult({ error: err.message });
    }
  };

  const winPos = winPositions();

  return (
    <div className="slot-container">
      {/* Points bar */}
      <div className="points-bar">
        <div className="points-bar-left">
          <span className="points-bar-amount">
            💰 {user?.points?.toLocaleString('es-ES') || 0}
          </span>
          <span className="points-bar-label">puntos</span>
        </div>
        <div className="points-bar-left">
          <span className="points-bar-label">Tiradas: {user?.totalSpins || 0}</span>
        </div>
      </div>

      {/* Machine */}
      <div className="slot-machine">
        <div className="slot-grid">
          {/* Render grid column by column, row by row */}
          {Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => {
              const symbolId = grid[col]?.[row] || 1;
              const posKey = `${col}-${row}`;
              const isWinning = !spinning && result?.isWin && winPos.has(posKey);
              return (
                <Symbol
                  key={`${col}-${row}`}
                  symbolId={symbolId}
                  isWinning={isWinning}
                  spinning={spinning}
                  delay={spinning ? 0 : col * 80 + row * 30}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="slot-controls">
        <div className="bet-selector">
          <span className="bet-label">Apuesta:</span>
          <div className="bet-options">
            {VALID_BETS.map(bet => (
              <button
                key={bet}
                className={`bet-btn ${betAmount === bet ? 'active' : ''}`}
                onClick={() => !spinning && setBetAmount(bet)}
                disabled={spinning || (user?.points || 0) < bet}
              >
                {bet}
              </button>
            ))}
          </div>
        </div>
        <button
          className="btn-primary spin-btn"
          onClick={handleSpin}
          disabled={spinning || !user || user.points < betAmount}
        >
          {spinning ? '⏳ GIRANDO...' : '🎰 GIRAR'}
        </button>
      </div>

      {/* Result display */}
      {result && !spinning && (
        <div className={`win-display ${result.rescued ? 'rescue' : result.isWin ? 'win' : 'lose'}`}>
          {result.error ? (
            <div style={{ color: 'var(--accent-red)' }}>{result.error}</div>
          ) : result.isWin ? (
            <>
              <div className="win-amount">+{result.totalWin.toLocaleString('es-ES')} puntos</div>
              <div className="win-breakdown">
                {result.wins.map((win, i) => (
                  <span key={i} className="win-item">
                    {SYMBOLS[win.symbolId]?.emoji} ×{win.count} = +{win.winAmount}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="win-details" style={{ color: 'var(--text-muted)' }}>
              Sin premio esta vez... ¡Sigue intentando! 🍀
            </div>
          )}
          {result.rescued && (
            <div className="rescue-message">
              {result.rescueMessage}
            </div>
          )}
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {createConfetti().map(piece => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                left: `${piece.left}%`,
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
