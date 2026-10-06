/** The shapes finance data takes. No behaviour — just contracts. */

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
  mariam: number;
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
  reminderTime: string;   // "HH:MM"
  bank: string;
  intervalMonths: number; // 1 = monthly, 3 = quarterly, 12 = yearly …
  startDate?: string;     // "YYYY-MM-DD"
}

export interface FinanceLog {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  bank: string;
  bucket?: string;
  mode?: 'split' | 'manual';
  category?: string;      // 'Salary' | 'Freelance' for split deposits
  timestamp: string;      // ISO
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: 'owed_to_me' | 'owed_by_me';
  notes?: string;
}
