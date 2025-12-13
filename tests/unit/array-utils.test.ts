import { chunk, unique, flatten, sum, average, sortNumbers } from '../../src/array-utils';

describe('Array Utils', () => {
  describe('chunk', () => {
    test('chunks array into specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    test('handles chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe('unique', () => {
    test('removes duplicates from array', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    test('handles array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });

    test('handles empty array', () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe('flatten', () => {
    test('flattens nested arrays', () => {
      expect(flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    test('handles empty arrays', () => {
      expect(flatten([])).toEqual([]);
    });
  });

  describe('sum', () => {
    test('calculates sum of numbers', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });

    test('handles empty array', () => {
      expect(sum([])).toBe(0);
    });

    test('handles negative numbers', () => {
      expect(sum([-1, -2, 3])).toBe(0);
    });
  });

  describe('average', () => {
    test('calculates average of numbers', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
    });

    test('handles empty array', () => {
      expect(average([])).toBe(0);
    });
  });

  describe('sortNumbers', () => {
    test('sorts numbers in ascending order', () => {
      expect(sortNumbers([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5]);
    });

    test('sorts numbers in descending order', () => {
      expect(sortNumbers([3, 1, 4, 1, 5], false)).toEqual([5, 4, 3, 1, 1]);
    });

    test('handles empty array', () => {
      expect(sortNumbers([])).toEqual([]);
    });
  });
});
