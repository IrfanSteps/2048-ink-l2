import { useState } from 'react';
import { WalletButton } from './components/WalletButton';
import { Game2048 } from './components/Game2048';
import { Leaderboard } from './components/Leaderboard';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleScoreSubmitted = () => {
    // Trigger Leaderboard to refetch after a short delay (wait for indexing)
    setTimeout(() => setRefreshKey(k => k + 1), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-ink-950 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-ink-300 to-purple-300 bg-clip-text text-transparent">
            2048
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-ink-900 text-ink-300 border border-ink-700 font-medium">
            Ink
          </span>
        </div>
        <WalletButton />
      </header>

      {/* Main */}
      <main className="flex flex-col lg:flex-row items-start justify-center gap-8 px-4 pb-12 max-w-5xl mx-auto pt-4">
        {/* Game */}
        <section className="flex-1 flex flex-col items-center">
          <Game2048 onScoreSubmitted={handleScoreSubmitted} />
        </section>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* How to play */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-gray-400 space-y-1">
            <p className="text-white font-semibold text-sm mb-2">How to play</p>
            <p>↑ ↓ ← → arrow keys or swipe to move tiles.</p>
            <p>Merge matching tiles to reach <span className="text-ink-300 font-bold">2048</span>!</p>
            <p>Connect your wallet to save your best score on-chain.</p>
          </div>
          {/* Leaderboard */}
          <Leaderboard refreshKey={refreshKey} />
        </aside>
      </main>
    </div>
  );
}
