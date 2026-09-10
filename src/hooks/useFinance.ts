import { useEffect } from 'react';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';

export interface FinanceBanks {
  cib: number;
  ahly_main: number;
  ahly_meeza: number;
  bm: number;
}

export interface FinanceBuckets {
  tawarr2: number;
  mustaqbal: number;
  basmala: number;
  sadaqa: number;
}

export interface FinanceTransaction {
  id: string;
  type: 'deposit' | 'debit';
  bank: string;
  amount: number;
  description: string;
  category?: string;
  timestamp: string;
}

export interface GoldAsset {
  id: string;
  quantity: number;
  carat: 24 | 21;
  notes?: string;
  purchasePrice?: number; // price per gram at time of purchase
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  renewalDay: number;
  reminderTime: string; // "HH:MM" e.g. "09:00"
  bank: string;
  intervalMonths: number; // 1=monthly, 2=every 2m, 3=every 3m, 12=yearly
  startDate?: string; // "YYYY-MM-DD" — the date the subscription started, used to calculate next renewal
}

export interface FinanceLog {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  bank: string;
  bucket?: string;
  mode?: 'split' | 'manual';
  category?: string; // 'Salary' | 'Freelance' for split deposits
  timestamp: string; // ISO date string
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owed_to_me' | 'owed_by_me';
  notes?: string;
}

const DEFAULT_BANKS: FinanceBanks = { cib: 0, ahly_main: 0, ahly_meeza: 0, bm: 0 };
const DEFAULT_BUCKETS: FinanceBuckets = { tawarr2: 0, mustaqbal: 0, basmala: 0, sadaqa: 0 };

const VALID_BUCKET_KEYS = new Set<string>(['tawarr2', 'mustaqbal', 'basmala', 'sadaqa']);

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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useFinance() {
  const [banks, setBanks] = useFirebaseSync<FinanceBanks>('finance_banks', DEFAULT_BANKS);
  const [buckets, setBuckets] = useFirebaseSync<FinanceBuckets>('finance_buckets', DEFAULT_BUCKETS);
  const [transactions] = useFirebaseSync<FinanceTransaction[]>('finance_transactions', []);
  const [gold, setGold] = useFirebaseSync<GoldAsset[]>('finance_gold', []);
  const [subscriptions, setSubscriptionsRaw] = useFirebaseSync<Subscription[]>('finance_subscriptions', []);
  const [debts, setDebts] = useFirebaseSync<Debt[]>('finance_debts', []);
  const [logs, setLogs] = useFirebaseSync<FinanceLog[]>('finance_logs', []);

  // Migrate old bucket structure to new 4-bucket schema (zeros everything)
  useEffect(() => {
    if (!buckets) return;
    const hasOldKey = Object.keys(buckets).some(k => !VALID_BUCKET_KEYS.has(k));
    if (hasOldKey) {
      setBuckets(DEFAULT_BUCKETS);
    }
  }, [buckets]);

  // Push subscriptions to the local reminder bot whenever they change
  // (best-effort — the bot is optional and may be offline).
  useEffect(() => {
    if (!subscriptions) return;
    fetch(`${BACKEND_URL}/api/subscriptions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptions),
    }).catch(() => {});
  }, [subscriptions]);

  const totalPhysical = (Object.values(banks) as number[]).reduce((a, b) => a + b, 0);
  const totalVirtual = (Object.values(buckets) as number[]).reduce((a, b) => a + b, 0);

  const updateBankBalance = async (bankKey: keyof FinanceBanks, amount: number) => {
    await setBanks({ ...banks, [bankKey]: amount });
  };

  const updateBucketBalance = async (bucketKey: keyof FinanceBuckets, amount: number) => {
    await setBuckets({ ...buckets, [bucketKey]: amount });
  };

  const removeLog = async (id: string) => {
    await setLogs(prev => (prev || []).filter(l => l.id !== id));
  };

  const addLog = async (entry: Omit<FinanceLog, 'id' | 'timestamp'>) => {
    const log: FinanceLog = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    await setLogs(prev => [log, ...(prev || [])]);
  };

  return {
    banks,
    buckets,
    transactions,
    totalPhysical,
    totalVirtual,
    gold,
    setGold,
    subscriptions,
    setSubscriptions: setSubscriptionsRaw,
    debts,
    setDebts,
    updateBankBalance,
    updateBucketBalance,
    logs,
    addLog,
    removeLog,
  };
}
