import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useCheckIn, useStreak } from '../hooks/useLeaderboard';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCountdown(secondsLeft: number): string {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

const STREAK_COLORS: Record<number, string> = {
  1: 'from-orange-500 to-amber-400',
  2: 'from-orange-500 to-yellow-300',
  3: 'from-pink-500 to-orange-400',
  4: 'from-purple-500 to-pink-400',
  5: 'from-indigo-500 to-purple-400',
  6: 'from-cyan-500 to-indigo-400',
  7: 'from-emerald-400 to-cyan-400',
};

// ─── component ───────────────────────────────────────────────────────────────

export function CheckIn() {
  const { address } = useAccount();
  const { streak, lastCheckIn, multiplier, refetch } = useStreak(address);
  const { checkIn, isPending, isConfirming, isConfirmed, error } = useCheckIn();

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Recompute countdown every second based on lastCheckIn timestamp.
  useEffect(() => {
    if (lastCheckIn === undefined) {
      setSecondsLeft(null);
      return;
    }
    const SECONDS_IN_DAY = 86400;
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const nextCheckIn = Number(lastCheckIn) + SECONDS_IN_DAY;
      const diff = nextCheckIn - nowSec;
      setSecondsLeft(diff > 0 ? diff : 0);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastCheckIn]);

  // Refetch streak data after a confirmed tx.
  useEffect(() => {
    if (isConfirmed) refetch();
  }, [isConfirmed, refetch]);

  const handleCheckIn = async () => {
    setSubmitError(null);
    try {
      await checkIn();
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Transaction failed');
    }
  };

  const alreadyCheckedIn = secondsLeft !== null && secondsLeft > 0;
  const currentStreak = streak ?? 0;
  const gradientClass = STREAK_COLORS[currentStreak] ?? 'from-slate-500 to-slate-400';
  const displayMultiplier = multiplier ?? 'x1.0';

  // ── Not connected ──────────────────────────────
  if (!address) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center text-sm text-gray-500">
        <p className="text-lg mb-1">🔥 Daily Check-In</p>
        <p>Connect your wallet to start your streak.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-sm">🔥 Daily Check-In</span>
        {/* Multiplier badge */}
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${gradientClass} text-white shadow-sm`}
        >
          {displayMultiplier}
        </span>
      </div>

      {/* Streak dots */}
      <div className="flex items-center gap-1.5 justify-center">
        {Array.from({ length: 7 }, (_, i) => {
          const active = i < currentStreak;
          return (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                active
                  ? `bg-gradient-to-r ${gradientClass} shadow-sm`
                  : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      {/* Streak label */}
      <p className="text-center text-xs text-gray-400">
        {currentStreak === 0
          ? 'No streak yet — check in to start!'
          : `Day ${currentStreak} streak${currentStreak === 7 ? ' 🏆 Max!' : ''}`}
      </p>

      {/* Button / status */}
      {alreadyCheckedIn ? (
        <div className="text-center space-y-0.5">
          <p className="text-green-400 text-sm font-medium">✅ Come back tomorrow!</p>
          <p className="text-gray-500 text-xs">
            Next check-in in{' '}
            <span className="font-mono text-gray-400">
              {secondsLeft !== null ? formatCountdown(secondsLeft) : '—'}
            </span>
          </p>
        </div>
      ) : (
        <button
          onClick={handleCheckIn}
          disabled={isPending || isConfirming}
          className="w-full py-2 rounded-xl font-bold text-sm text-white transition-all active:scale-95
            bg-gradient-to-r from-ink-600 to-purple-600 hover:from-ink-500 hover:to-purple-500
            disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isPending
            ? '⏳ Confirm in wallet…'
            : isConfirming
            ? '⏳ Confirming…'
            : isConfirmed
            ? '✅ Checked in!'
            : '🔥 Check In'}
        </button>
      )}

      {/* Errors */}
      {(submitError || error) && (
        <p className="text-red-400 text-xs text-center break-all">
          {submitError ?? error?.message}
        </p>
      )}
    </div>
  );
}
