import { describe, expect, it } from 'vitest';
import { assetKeys } from '@/entities/asset';
import { budgetKeys } from '@/entities/budget';
import { recordKeys } from '@/entities/record';
import { topicKeys } from '@/entities/topic';

describe('query key factories', () => {
  it('creates stable record list and detail keys', () => {
    expect(recordKeys.list({ keyword: 'coffee' })).toEqual([
      'record',
      'list',
      { keyword: 'coffee' },
    ]);
    expect(recordKeys.detail({ id: '42' })).toEqual(['record', 'detail', '42']);
  });

  it('keeps domain roots separate', () => {
    expect(assetKeys.all).toEqual(['asset']);
    expect(budgetKeys.all).toEqual(['budget']);
    expect(topicKeys.all).toEqual(['topic']);
  });

  it('includes mutation-relevant parameters in keys', () => {
    expect(topicKeys.list(true)).toEqual(['topic', 'list', { recommend: true }]);
    expect(assetKeys.group('cash')).toEqual(['asset', 'group', 'cash']);
  });
});
