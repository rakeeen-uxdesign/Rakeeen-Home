import { describe, it, expect } from 'vitest';
import { removeById, upsertById } from '@/domain/finance/collections';

const list = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }];

describe('upsertById', () => {
  it('replaces an existing item in place', () => {
    expect(upsertById(list, { id: 'b', v: 9 })).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 9 }]);
  });
  it('appends a new one, and never mutates the input', () => {
    expect(upsertById(list, { id: 'c', v: 3 })).toHaveLength(3);
    expect(list).toHaveLength(2);
  });
});

describe('removeById', () => {
  it('drops just that item', () => {
    expect(removeById(list, 'a')).toEqual([{ id: 'b', v: 2 }]);
    expect(removeById(list, 'zzz')).toEqual(list);
  });
});
