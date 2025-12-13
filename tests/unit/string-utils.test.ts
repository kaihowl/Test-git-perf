import { capitalize, reverseString, isPalindrome, truncate } from '../../src/string-utils';

describe('String Utils', () => {
  describe('capitalize', () => {
    test('capitalizes first letter of string', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    test('handles already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('reverseString', () => {
    test('reverses a simple string', () => {
      expect(reverseString('hello')).toBe('olleh');
    });

    test('handles palindrome', () => {
      expect(reverseString('racecar')).toBe('racecar');
    });

    test('handles empty string', () => {
      expect(reverseString('')).toBe('');
    });
  });

  describe('isPalindrome', () => {
    test('identifies simple palindrome', () => {
      expect(isPalindrome('racecar')).toBe(true);
    });

    test('identifies palindrome with spaces', () => {
      expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
    });

    test('identifies non-palindrome', () => {
      expect(isPalindrome('hello')).toBe(false);
    });

    test('handles empty string', () => {
      expect(isPalindrome('')).toBe(true);
    });
  });

  describe('truncate', () => {
    test('truncates long string', () => {
      expect(truncate('This is a very long string', 10)).toBe('This is...');
    });

    test('does not truncate short string', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    test('handles exact length match', () => {
      expect(truncate('Exactly10!', 10)).toBe('Exactly10!');
    });
  });
});
