import { describe, it, expect } from 'vitest';
import { SALARY_SPLIT, FREELANCE_SPLIT, splitFor } from '@/domain/finance/split';

describe('deposit splits', () => {
  it('salary sends 10% to Tawarr2, 43% to Mustaqbal', () => {
    expect(SALARY_SPLIT.tawarr2).toBe(0.10);
    expect(SALARY_SPLIT.mustaqbal).toBe(0.43);
  });

  it('freelance sends 10% / 80%', () => {
    expect(FREELANCE_SPLIT.tawarr2).toBe(0.10);
    expect(FREELANCE_SPLIT.mustaqbal).toBe(0.80);
  });

  it('splitFor picks the right table', () => {
    expect(splitFor('Salary')).toBe(SALARY_SPLIT);
    expect(splitFor('Freelance')).toBe(FREELANCE_SPLIT);
  });

  it('a 10,000 salary deposit allocates 1,000 + 4,300, leaving 4,700 liquid', () => {
    const amount = 10000;
    const s = SALARY_SPLIT;
    const toBuckets = amount * s.tawarr2 + amount * s.mustaqbal;
    expect(toBuckets).toBe(5300);
    expect(amount - toBuckets).toBe(4700);
  });
});
