import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { useState, useEffect, useCallback } from 'react';
import { LEADERBOARD_ADDRESS, LEADERBOARD_ABI } from '../config/contracts';
import { inkMainnet } from '../config/chains';
import type { Address } from 'viem';

// ─── Standalone publicClient (no wallet required) ────────────────────────────
// Uses primary RPC with fallback so reads always work regardless of wallet state.

const publicClient = createPublicClient({
  chain: inkMainnet,
  transport: http('https://rpc-qnd.inkonchain.com', { timeout: 8_000 }),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  address: Address;
  score: bigint;
}

// ─── getTopScores ─────────────────────────────────────────────────────────────
// Reads via the standalone publicClient with automatic retry and empty-state guard.

export function useGetTopScores() {
  const [entries, setEntries]     = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<Error | null>(null);
  const [tick, setTick]           = useState(0);              // bump to re-fetch

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load(attempt = 1): Promise<void> {
      try {
        if (!cancelled) setIsLoading(true);

        // First check playerCount so an empty board never shows an error.
        const count = await publicClient.readContract({
          address: LEADERBOARD_ADDRESS,
          abi: LEADERBOARD_ABI,
          functionName: 'playerCount',
        }) as bigint;

        if (count === 0n) {
          if (!cancelled) {
            setEntries([]);
            setError(null);
            setIsLoading(false);
          }
          return;
        }

        const result = await publicClient.readContract({
          address: LEADERBOARD_ADDRESS,
          abi: LEADERBOARD_ABI,
          functionName: 'getTopScores',
        }) as [Address[], bigint[]];

        const [players, scores] = result;
        const parsed: LeaderboardEntry[] = players.map((addr, i) => ({
          address: addr,
          score: scores[i],
        }));

        if (!cancelled) {
          setEntries(parsed);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        // Retry up to 3 times with exponential back-off before surfacing the error.
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 500 * 2 ** (attempt - 1)));
          return load(attempt + 1);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  return { entries, isLoading, error, refetch };
}

// ─── bestScore ───────────────────────────────────────────────────────────────

export function useBestScore(address?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: LEADERBOARD_ADDRESS,
    abi: LEADERBOARD_ABI,
    functionName: 'bestScore',
    args: address ? [address] : undefined,
    chainId: inkMainnet.id,
    query: { enabled: !!address },
  });

  return {
    bestScore: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// ─── submitScore ─────────────────────────────────────────────────────────────

export function useSubmitScore() {
  const { writeContractAsync, isPending, data: txHash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const submitScore = async (score: bigint) => {
    await writeContractAsync({
      address: LEADERBOARD_ADDRESS,
      abi: LEADERBOARD_ABI,
      functionName: 'submitScore',
      args: [score],
      chainId: inkMainnet.id,
    });
  };

  return {
    submitScore,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    error,
  };
}
