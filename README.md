# Demo Utils

A demonstration utility library with comprehensive testing and build tools.

## Features

- String manipulation utilities
- Array processing functions
- Full TypeScript support
- Comprehensive unit tests
- Performance benchmarks

## Installation

```bash
npm install
```

## Build

Build the TypeScript source to JavaScript:

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

## Testing

### Run all tests
```bash
npm test
```

### Run only unit tests
```bash
npm run test:unit
```

### Run only performance tests
```bash
npm run test:perf
```

### Run all tests (unit + performance)
```bash
npm run test:all
```

## API Reference

### String Utils

#### `capitalize(str: string): string`
Capitalizes the first letter of a string.

```typescript
import { capitalize } from 'demo-utils';
capitalize('hello'); // 'Hello'
```

#### `reverseString(str: string): string`
Reverses a string.

```typescript
import { reverseString } from 'demo-utils';
reverseString('hello'); // 'olleh'
```

#### `isPalindrome(str: string): boolean`
Checks if a string is a palindrome.

```typescript
import { isPalindrome } from 'demo-utils';
isPalindrome('racecar'); // true
```

#### `truncate(str: string, maxLength: number): string`
Truncates a string to the specified length.

```typescript
import { truncate } from 'demo-utils';
truncate('This is a long string', 10); // 'This is...'
```

### Array Utils

#### `chunk<T>(array: T[], size: number): T[][]`
Splits an array into chunks of specified size.

```typescript
import { chunk } from 'demo-utils';
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```

#### `unique<T>(array: T[]): T[]`
Returns unique values from an array.

```typescript
import { unique } from 'demo-utils';
unique([1, 2, 2, 3, 3]); // [1, 2, 3]
```

#### `flatten<T>(arrays: T[][]): T[]`
Flattens a nested array.

```typescript
import { flatten } from 'demo-utils';
flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]
```

#### `sum(numbers: number[]): number`
Calculates the sum of an array of numbers.

```typescript
import { sum } from 'demo-utils';
sum([1, 2, 3, 4, 5]); // 15
```

#### `average(numbers: number[]): number`
Calculates the average of an array of numbers.

```typescript
import { average } from 'demo-utils';
average([1, 2, 3, 4, 5]); // 3
```

#### `sortNumbers(numbers: number[], ascending?: boolean): number[]`
Sorts an array of numbers.

```typescript
import { sortNumbers } from 'demo-utils';
sortNumbers([3, 1, 4, 1, 5]); // [1, 1, 3, 4, 5]
sortNumbers([3, 1, 4, 1, 5], false); // [5, 4, 3, 1, 1]
```

## Project Structure

```
demo-utils/
├── src/
│   ├── index.ts          # Main entry point
│   ├── string-utils.ts   # String utility functions
│   └── array-utils.ts    # Array utility functions
├── tests/
│   ├── unit/             # Unit tests
│   │   ├── string-utils.test.ts
│   │   └── array-utils.test.ts
│   └── performance/      # Performance tests
│       ├── string-performance.test.ts
│       └── array-performance.test.ts
├── dist/                 # Built output (generated)
├── package.json
├── tsconfig.json
└── jest.config.js
```

## License

MIT