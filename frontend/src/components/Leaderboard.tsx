import { useGetTopScores } from '../hooks/useLeaderboard';
import { useEffect } from 'react';

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatScore(score: bigint) {
  return Number(score).toLocaleString();
}

const medals = ['🥇', '🥈', '🥉'];

interface LeaderboardProps {
  /** Refetch trigger — increment to force a fresh read after score submit */
  refreshKey?: number;
}

export function Leaderboard({ refreshKey }: LeaderboardProps) {
  const { entries, isLoading, error, refetch } = useGetTopScores();

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-bold text-ink-300 mb-3 flex items-center gap-2">
        🏆 <span>Leaderboard</span>
        <span className="text-xs text-gray-500 font-normal ml-auto">Top 10</span>
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-500 text-sm animate-pulse">
          Loading scores…
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm py-4 text-center">
          Failed to load scores. Check your network.
        </div>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="text-gray-500 text-sm text-center py-8">
          No scores yet — be the first! 🎮
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="py-2 px-4 text-left w-10">#</th>
                <th className="py-2 px-4 text-left">Player</th>
                <th className="py-2 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.address}
                  className={`border-b border-white/5 last:border-0 transition-colors ${
                    i === 0
                      ? 'bg-ink-900/60'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="py-3 px-4 font-mono">
                    {i < 3 ? medals[i] : <span className="text-gray-600">{i + 1}</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-300">
                    {shortAddr(entry.address)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-ink-300">
                    {formatScore(entry.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
