import type { FinanceBanks, FinanceBuckets, Subscription, Debt } from '@/domain/finance/types';
import { nextRenewal } from '@/domain/finance/subscriptions';

export interface SafeToSpendInput {
  banks: FinanceBanks;
  buckets: FinanceBuckets;
  subscriptions: Subscription[];
  debts?: Debt[];
  now?: Date;
  /** How far ahead to reserve upcoming subscriptions for. Default 7 days. */
  lookaheadDays?: number;
}

export interface SafeToSpendResult {
  amount: number;            // never negative — the number to actually show
  raw: number;                // the unclamped value, for diagnostics
  totalLiquid: number;        // sum of bank balances
  reserved: number;           // sum of virtual buckets (already earmarked, same money)
  dueSoon: number;            // subscriptions renewing within the lookahead window
  owedByMe: number;           // debts you owe others — not really "yours" to spend
}

/**
 * "How much can I actually spend right now without touching money that's
 * already spoken for?" — the one number that answers a spending decision,
 * instead of making you do bank-minus-buckets-minus-bills math in your head.
 *
 *   safe = liquid banks − virtual buckets (Tawarr2/Mustaqbal/…)
 *          − subscriptions renewing within `lookaheadDays`
 *          − debts you owe others
 *
 * Buckets aren't separate money — a deposit adds to both the bank balance and
 * its bucket share — so they have to be subtracted back out here, not added.
 */
export function computeSafeToSpend(input: SafeToSpendInput): SafeToSpendResult {
  const now = input.now ?? new Date();
  const lookaheadMs = (input.lookaheadDays ?? 7) * 24 * 60 * 60 * 1000;

  const totalLiquid = sum(Object.values(input.banks));
  const reserved = sum(Object.values(input.buckets));

  const dueSoon = sum(
    (input.subscriptions ?? [])
      .filter(sub => {
        const ms = nextRenewal(sub, now).getTime() - now.getTime();
        return ms >= 0 && ms <= lookaheadMs;
      })
      .map(sub => sub.cost)
  );

  const owedByMe = sum(
    (input.debts ?? [])
      .filter(d => d.type === 'owed_by_me')
      .map(d => d.amount)
  );

  const raw = totalLiquid - reserved - dueSoon - owedByMe;
  return {
    amount: Math.max(0, Math.round(raw)),
    raw,
    totalLiquid,
    reserved,
    dueSoon,
    owedByMe,
  };
}

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + (Number(b) || 0), 0);
}
