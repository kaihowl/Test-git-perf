import { chunk, unique, flatten, sum, sortNumbers } from '../../src/array-utils';

describe('Array Utils Performance Tests', () => {
  const PERF_THRESHOLD_MS = 100;

  describe('chunk performance', () => {
    test('handles large array efficiently', () => {
      const largeArray = Array.from({ length: 100000 }, (_, i) => i);

      const start = performance.now();
      chunk(largeArray, 100);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });
  });

  describe('unique performance', () => {
    test('removes duplicates from large array efficiently', () => {
      const largeArray = Array.from({ length: 50000 }, (_, i) => i % 1000);

      const start = performance.now();
      unique(largeArray);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });

    test('handles array with many duplicates', () => {
      const arrayWithDuplicates = Array(100000).fill(1);

      const start = performance.now();
      const result = unique(arrayWithDuplicates);
      const duration = performance.now() - start;

      expect(result).toEqual([1]);
      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });
  });

  describe('flatten performance', () => {
    test('flattens large nested array efficiently', () => {
      const nestedArray = Array.from({ length: 1000 }, (_, i) =>
        Array.from({ length: 100 }, (_, j) => i * 100 + j)
      );

      const start = performance.now();
      const result = flatten(nestedArray);
      const duration = performance.now() - start;

      expect(result.length).toBe(100000);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('sum performance', () => {
    test('calculates sum of large array efficiently', () => {
      const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

      const start = performance.now();
      const result = sum(largeArray);
      const duration = performance.now() - start;

      expect(result).toBe(499999500000);
      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });
  });

  describe('sortNumbers performance', () => {
    test('sorts large array efficiently', () => {
      const largeArray = Array.from({ length: 50000 }, () => Math.random() * 1000);

      const start = performance.now();
      sortNumbers(largeArray);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });

    test('handles already sorted array', () => {
      const sortedArray = Array.from({ length: 50000 }, (_, i) => i);

      const start = performance.now();
      const result = sortNumbers(sortedArray);
      const duration = performance.now() - start;

      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(49999);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('memory efficiency', () => {
    test('chunk does not cause memory issues with large datasets', () => {
      const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

      expect(() => {
        const chunks = chunk(largeArray, 1000);
        expect(chunks.length).toBe(1000);
      }).not.toThrow();
    });
  });
});
