# assert-like-jest

Jest-compatible test matchers backed by `node:test` — zero dependencies, TypeScript-first.

## Installation

```bash
npm install --save-dev assert-like-jest
```

## Usage

```ts
import { mock } from "node:test";
import { expect } from "assert-like-jest";

// Value matchers
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
expect(42).toStrictEqual(42);
expect(() => { throw new Error("boom"); }).toThrow(/boom/);

// Mock matchers
const fn = mock.fn((x: number) => x * 2);
fn(21);

expect(fn).toHaveBeenCalledTimes(1);
expect(fn).toHaveBeenCalledWith(21);
```

## Matchers

### Value Matchers

| Matcher | Description |
| --- | --- |
| `toEqual(expected)` | Deep structural equality (handles `BigInt` and cycles) |
| `toStrictEqual(expected)` | Strict deep equality (exact types) |
| `toBe(expected)` | Strict reference/value equality |
| `toThrow(error?)` | Asserts a function throws, optionally matching an error pattern |
| `toBeNull()` | Value is `null` |
| `toBeUndefined()` | Value is `undefined` |
| `toBeDefined()` | Value is not `undefined` |
| `toHaveLength(n)` | Value's `length` is `n` (strings, arrays, array-like) |
| `toContainEqual(item)` | Array contains a deeply equal element; string contains substring |
| `toBeInstanceOf(Class)` | Value is an instance of `Class` |

### Mock Matchers

| Matcher | Description |
| --- | --- |
| `toHaveBeenCalled()` | Mock has been called at least once |
| `toHaveBeenCalledTimes(count)` | Mock called exactly `count` times |
| `toHaveBeenCalledWith(...args)` | Mock called with these arguments (at least once) |
| `toHaveBeenLastCalledWith(...args)` | Last invocation used these arguments |
| `lastCall()` | Returns the arguments of the last call |

### Negation

The P0 value matchers and `toHaveBeenCalled()` support `.not`:

```ts
expect(undefined).not.toBeDefined();
expect(fn).not.toHaveBeenCalled();
```

> **Note:** `.not` for `toBe`, `toEqual`, `toStrictEqual`, and `toThrow` is not yet implemented.

## `mocked()` Helper

Type-guards a `node:test` mock function at runtime:

```ts
import { mocked } from "assert-like-jest";

const unsafe = something as unknown;
const safe = mocked(unsafe); // throws if not a mock
```

## Architecture

- **`node:test`** — uses `mock.fn()` for spy creation, `node:assert` for assertions
- **TypeScript strict mode** — typed overloads distinguish mock vs. non-mock values
- **No dependencies** — pure standard library

## TypeScript Support

Full type inference with overloads:

```ts
// Mock function → all matchers work
const fn = mock.fn(() => "hello");
expect(fn).toHaveBeenCalled();
expect(fn).toBe(fn);

// Regular function → value matchers work; mock matchers throw a clear
// TypeError at runtime because it is not a mock (as Jest does)
const fn2 = () => {};
expect(fn2).toEqual(fn2);
// expect(fn2).toHaveBeenCalled(); // TypeError: toHaveBeenCalled() expects a Node.js mock function

// Any other value → value matchers; mock matchers behave the same way
expect("data").toEqual("data");
```

## Design Goals

- Zero Jest dependencies
- Native Node.js only (`node:test`, `node:assert`)
- Fast startup — no bootstrapping overhead
- Familiar Jest API — learn once, use with native Node.js

## License

MIT NON-AI
