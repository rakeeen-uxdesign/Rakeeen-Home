import { describe, it, expect } from 'vitest';
import { computeSafeToSpend } from '@/domain/finance/safeToSpend';
import type { Subscription, Debt } from '@/domain/finance/types';

const banks = { cib: 3000, ahly_main: 2000, ahly_meeza: 0, bm: 0 };
const buckets = { tawarr2: 500, mustaqbal: 2000, basmala: 0, sadaqa: 0 };
const now = new Date('2026-09-10T12:00:00');

function sub(overrides: Partial<Subscription>): Subscription {
  return {
    id: '1', name: 'X', cost: 100, renewalDay: 1, reminderTime: '09:00',
    bank: 'CIB', intervalMonths: 1, ...overrides,
  };
}

describe('computeSafeToSpend', () => {
  it('liquid minus reserved buckets, no subs or debts', () => {
    const r = computeSafeToSpend({ banks, buckets, subscriptions: [], now });
    expect(r.totalLiquid).toBe(5000);
    expect(r.reserved).toBe(2500);
    expect(r.amount).toBe(2500);
  });

  it('subtracts a subscription renewing within the week', () => {
    const netflix = sub({ cost: 300, renewalDay: 12 }); // 2 days out
    const r = computeSafeToSpend({ banks, buckets, subscriptions: [netflix], now });
    expect(r.dueSoon).toBe(300);
    expect(r.amount).toBe(2200);
  });

  it('ignores a subscription renewing outside the window', () => {
    const yearly = sub({ cost: 1200, renewalDay: 10, intervalMonths: 12, startDate: '2026-01-10' });
    const r = computeSafeToSpend({ banks, buckets, subscriptions: [yearly], now });
    expect(r.dueSoon).toBe(0);
  });

  it('subtracts debts owed by me but not debts owed to me', () => {
    const debts: Debt[] = [
      { id: '1', personName: 'Ali', amount: 1000, type: 'owed_by_me' },
      { id: '2', personName: 'Sara', amount: 5000, type: 'owed_to_me' },
    ];
    const r = computeSafeToSpend({ banks, buckets, subscriptions: [], debts, now });
    expect(r.owedByMe).toBe(1000);
    expect(r.amount).toBe(1500);
  });

  it('never goes negative even if obligations exceed liquid cash', () => {
    const tight = { cib: 100, ahly_main: 0, ahly_meeza: 0, bm: 0 };
    const r = computeSafeToSpend({ banks: tight, buckets, subscriptions: [], now });
    expect(r.raw).toBeLessThan(0);
    expect(r.amount).toBe(0);
  });

  it('respects a custom lookahead window', () => {
    const inThreeWeeks = sub({ cost: 900, renewalDay: 1, intervalMonths: 1, startDate: '2026-09-01' });
    const short = computeSafeToSpend({ banks, buckets, subscriptions: [inThreeWeeks], now, lookaheadDays: 3 });
    const long = computeSafeToSpend({ banks, buckets, subscriptions: [inThreeWeeks], now, lookaheadDays: 30 });
    expect(short.dueSoon).toBe(0);
    expect(long.dueSoon).toBe(900);
  });
});
