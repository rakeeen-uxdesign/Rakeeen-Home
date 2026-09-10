import type { FinanceBuckets } from '@/domain/finance/types';

/**
 * How an incoming deposit is sliced into the virtual buckets.
 * Whatever isn't allocated here stays as liquid balance in the bank.
 *
 *   Salary   → 10% Tawarr2, 43% Mustaqbal
 *   Freelance→ 10% Tawarr2, 80% Mustaqbal
 */
export const SALARY_SPLIT: Record<keyof Omit<FinanceBuckets, 'basmala'>, number> = {
  tawarr2: 0.10,
  mustaqbal: 0.43,
  sadaqa: 0.00,
};

export const FREELANCE_SPLIT: Record<string, number> = {
  tawarr2: 0.10,
  mustaqbal: 0.80,
  sadaqa: 0.00,
};

export type DepositCategory = 'Salary' | 'Freelance';

export function splitFor(category: DepositCategory): Record<string, number> {
  return category === 'Salary' ? SALARY_SPLIT : FREELANCE_SPLIT;
}
