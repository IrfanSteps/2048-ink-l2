import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useSubmitScore, useBestScore } from '../hooks/useLeaderboard';
import { inkSepolia } from '../config/chains';

// ─── Types ────────────────────────────────────────────────────────────────────

type Grid = (number | null)[][];
type Direction = 'up' | 'down' | 'left' | 'right';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function randomEmpty(grid: Grid): [number, number] | null {
  const empties: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] === null) empties.push([r, c]);
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function addTile(grid: Grid): Grid {
  const pos = randomEmpty(grid);
  if (!pos) return grid;
  const copy = grid.map(r => [...r]);
  copy[pos[0]][pos[1]] = Math.random() < 0.9 ? 2 : 4;
  return copy;
}

function initGrid(): Grid {
  let g = emptyGrid();
  g = addTile(g);
  g = addTile(g);
  return g;
}

/** Slide one row/column left (the primitive operation). Returns { row, score }. */
function slideLeft(row: (number | null)[]): { row: (number | null)[]; score: number } {
  const nums = row.filter((v): v is number => v !== null);
  let score = 0;
  const merged: (number | null)[] = [];

  let i = 0;
  while (i < nums.length) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      const val = nums[i] * 2;
      merged.push(val);
      score += val;
      i += 2;
    } else {
      merged.push(nums[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(null);
  return { row: merged, score };
}

function rotate90(grid: Grid): Grid {
  return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
}

function rotateN(grid: Grid, n: number): Grid {
  let g = grid;
  for (let i = 0; i < n; i++) g = rotate90(g);
  return g;
}

function move(grid: Grid, dir: Direction): { grid: Grid; score: number; moved: boolean } {
  const rotations: Record<Direction, number> = { left: 0, up: 3, right: 2, down: 1 };
  const rot = rotations[dir];
  const rotated = rotateN(grid, rot);

  let totalScore = 0;
  const newGrid = rotated.map(row => {
    const { row: newRow, score } = slideLeft(row);
    totalScore += score;
    return newRow;
  });

  const unrotated = rotateN(newGrid, (4 - rot) % 4);
  const moved = JSON.stringify(unrotated) !== JSON.stringify(grid);
  return { grid: unrotated, score: totalScore, moved };
}

function canMove(grid: Grid): boolean {
  if (randomEmpty(grid) !== null) return true;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const v = grid[r][c];
      if ((c < 3 && grid[r][c + 1] === v) || (r < 3 && grid[r + 1][c] === v)) return true;
    }
  return false;
}

// ─── Tile colours ─────────────────────────────────────────────────────────────

const TILE_STYLES: Record<number, string> = {
  2:    'bg-slate-200 text-slate-800',
  4:    'bg-yellow-100 text-slate-800',
  8:    'bg-orange-300 text-white',
  16:   'bg-orange-400 text-white',
  32:   'bg-orange-500 text-white',
  64:   'bg-red-500 text-white',
  128:  'bg-ink-400 text-white',
  256:  'bg-ink-500 text-white',
  512:  'bg-ink-600 text-white',
  1024: 'bg-ink-700 text-white',
  2048: 'bg-gradient-to-br from-yellow-400 to-ink-500 text-white shadow-lg shadow-ink-500/50',
};

function tileClass(val: number): string {
  return TILE_STYLES[val] ?? 'bg-ink-800 text-white';
}

function tileFontSize(val: number): string {
  if (val >= 1024) return 'text-xl';
  if (val >= 128)  return 'text-2xl';
  return 'text-3xl';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Game2048Props {
  onScoreSubmitted?: () => void;
}

export function Game2048({ onScoreSubmitted }: Game2048Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { submitScore, isPending, isConfirming, isConfirmed, error: txError } = useSubmitScore();
  const { bestScore, refetch: refetchBest } = useBestScore(address);

  const [grid, setGrid]           = useState<Grid>(initGrid);
  const [score, setScore]         = useState(0);
  const [localBest, setLocalBest] = useState(0);
  const [gameOver, setGameOver]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Touch tracking for swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // When tx confirmed, refetch best score and bubble up
  useEffect(() => {
    if (isConfirmed) {
      refetchBest();
      onScoreSubmitted?.();
    }
  }, [isConfirmed, refetchBest, onScoreSubmitted]);

  const applyMove = useCallback((dir: Direction) => {
    if (gameOver) return;
    setGrid(prev => {
      const { grid: next, score: delta, moved } = move(prev, dir);
      if (!moved) return prev;
      const withTile = addTile(next);
      setScore(s => {
        const newScore = s + delta;
        setLocalBest(b => Math.max(b, newScore));
        return newScore;
      });
      if (!canMove(withTile)) setGameOver(true);
      return withTile;
    });
  }, [gameOver]);

  // Keyboard handler
  useEffect(() => {
    const MAP: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const handler = (e: KeyboardEvent) => {
      const dir = MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      applyMove(dir);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [applyMove]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      applyMove(dx > 0 ? 'right' : 'left');
    } else {
      applyMove(dy > 0 ? 'down' : 'up');
    }
  };

  const handleNewGame = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setSubmitted(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!address) return;
    setSubmitError(null);

    if (chainId !== inkSepolia.id) {
      switchChain({ chainId: inkSepolia.id });
      return;
    }

    try {
      await submitScore(BigInt(score));
      setSubmitted(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  const onChainBest = bestScore !== undefined ? Number(bestScore) : 0;
  const displayBest = Math.max(localBest, onChainBest);
  const isWrongNetwork = !!address && chainId !== inkSepolia.id;

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">

      {/* Score Bar */}
      <div className="flex items-center gap-3 w-full max-w-sm">
        <ScoreBox label="Score" value={score} />
        <ScoreBox label="Best"  value={displayBest} highlight />
        <button
          onClick={handleNewGame}
          className="ml-auto px-4 py-2 rounded-xl bg-ink-600 hover:bg-ink-500 text-white text-sm font-semibold transition-colors active:scale-95"
        >
          New Game
        </button>
      </div>

      {/* Wrong network banner */}
      {isWrongNetwork && (
        <div className="w-full max-w-sm flex items-center gap-3 bg-orange-900/50 border border-orange-500/40 rounded-xl px-4 py-2 text-sm text-orange-300">
          <span>⚠️ Wrong network.</span>
          <button
            onClick={() => switchChain({ chainId: inkSepolia.id })}
            className="ml-auto underline hover:text-orange-100"
          >
            Switch to Ink Sepolia
          </button>
        </div>
      )}

      {/* Board */}
      <div
        className="relative bg-slate-800/80 rounded-2xl p-3 shadow-xl border border-white/10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2" style={{ width: 'min(88vw, 360px)' }}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{ aspectRatio: '1/1' }}
                className={`flex items-center justify-center rounded-xl font-extrabold transition-all
                  ${cell ? `${tileClass(cell)} ${tileFontSize(cell)} animate-slide-in` : 'bg-slate-700/60'}
                `}
              >
                {cell ?? ''}
              </div>
            ))
          )}
        </div>

        {/* Game Over overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 backdrop-blur-sm animate-fade-in gap-4">
            <p className="text-3xl font-black text-white">Game Over</p>
            <p className="text-ink-300 font-bold text-xl">{score.toLocaleString()} pts</p>

            {address ? (
              <>
                {!submitted && !isConfirmed && (
                  <button
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming}
                    className="px-6 py-2 rounded-xl bg-ink-500 hover:bg-ink-400 text-white font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming
                      ? (isPending ? '⏳ Confirm in wallet…' : '⏳ Confirming…')
                      : '📤 Submit Score'}
                  </button>
                )}
                {(submitted || isConfirmed) && (
                  <p className="text-green-400 font-semibold text-sm">✅ Score submitted!</p>
                )}
                {submitError && (
                  <p className="text-red-400 text-xs max-w-[200px] text-center">{submitError}</p>
                )}
                {txError && !submitError && (
                  <p className="text-red-400 text-xs max-w-[200px] text-center">{txError.message}</p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm">Connect wallet to submit score</p>
            )}

            <button
              onClick={handleNewGame}
              className="px-6 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors text-sm"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-xs mt-1">
        ← → ↑ ↓ or swipe to play
      </p>
    </div>
  );
}

function ScoreBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex-1 rounded-xl py-2 px-3 text-center ${highlight ? 'bg-ink-800' : 'bg-slate-800'} border border-white/10`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`font-black text-lg leading-tight ${highlight ? 'text-ink-300' : 'text-white'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
