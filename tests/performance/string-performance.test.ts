import { capitalize, reverseString, isPalindrome, truncate } from '../../src/string-utils';

describe('String Utils Performance Tests', () => {
  const PERF_THRESHOLD_MS = 50;

  describe('capitalize performance', () => {
    test('handles very long string efficiently', () => {
      const longString = 'a'.repeat(1000000);

      const start = performance.now();
      capitalize(longString);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });
  });

  describe('reverseString performance', () => {
    test('reverses long string efficiently', () => {
      const longString = 'abcdefgh'.repeat(100000);

      const start = performance.now();
      reverseString(longString);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('isPalindrome performance', () => {
    test('checks long palindrome efficiently', () => {
      const halfString = 'abcde'.repeat(10000);
      const palindrome = halfString + halfString.split('').reverse().join('');

      const start = performance.now();
      const result = isPalindrome(palindrome);
      const duration = performance.now() - start;

      expect(result).toBe(true);
      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });

    test('checks long non-palindrome efficiently', () => {
      const longString = 'abcdefgh'.repeat(100000);

      const start = performance.now();
      const result = isPalindrome(longString);
      const duration = performance.now() - start;

      expect(result).toBe(false);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('truncate performance', () => {
    test('truncates very long string efficiently', () => {
      const longString = 'x'.repeat(1000000);

      const start = performance.now();
      truncate(longString, 100);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });

    test('handles multiple truncations efficiently', () => {
      const testString = 'test string for truncation that is moderately long';

      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        truncate(testString, 20);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(PERF_THRESHOLD_MS);
    });
  });
});
