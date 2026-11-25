# assert-like-jest — Refactor & Package

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current builder-function matcher architecture with a registry-based system, package the library properly, and add missing matchers — all while keeping the same Jest-compatible API the existing tests rely on.

**Architecture:** A single registry object holds all matcher definitions (`{ fn, negate? }`). The `expect()` builder reads from this registry and composes the return object. Types are explicit interfaces, independent of the runtime implementation. This makes adding matchers a two-step process: add to registry + add to type.

**Tech Stack:** TypeScript (strict), `node:test` (for mock functions), `node:assert` (for assertions), `lodash` (for `isEqual` — small exception).

**Spec:** `assert-like-jest/DESIGN.md`

## Global Constraints

- Native Node.js only — `node:test`, `node:assert`
- TypeScript strict mode (current project setting)
- Backwards compatible API — existing tests must pass after refactor
- Lodash stays (small exception to "no deps" goal, replaceable later)

## Review Focus

| Failure Mode                                             | Expected Behavior                                                                 |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Non-mock function passed to mock matchers                | Runtime TypeError with clear message ("not a mock function")                      |
| Mock function on non-mock value (was compile-time error) | Now a runtime error (breaking change for type-only usage)                         |
| `.not` on matcher without `negate` in registry           | Clear error ("Cannot negate this matcher")                                        |
| `expect()` on `null` or `undefined`                      | Returns matcher object with value matchers (mock matchers fail at runtime)        |
| `toStrictEqual()` with `Date`, `RegExp`, `Error`         | Correct comparison (lodash `isEqual` handles Date; RegExp needs special handling) |

---

### Task 1: Types Refactor

**Goal:** Replace `ReturnType`-derived types with explicit interface declarations. This is the foundation — everything else depends on these types.

**Files:**

- Write: `assert-like-jest/types.ts` (complete rewrite)

**Interfaces:**

- `Expect<Value>` — unified matcher interface (all matchers, value + mock)
- `ExpectNot<Value>` — type representing the `.not` property return type (all matchers, negated versions present)

```typescript
// EXACT SIGNATURES

import type { AssertPredicate } from "node:assert";

interface Expect<Value> {
  // === Value matchers (all types) ===
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toThrow(error?: AssertPredicate): void;

  // === Mock matchers (all types — fail at runtime if not a mock) ===
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(count: number): void;
  toHaveBeenCalledWith(...values: unknown[]): void;
  toHaveBeenLastCalledWith(...values: unknown[]): void;
  lastCall(): unknown[];

  // === Negation ===
  get not(): ExpectNot<Value>;
}

// `not` exposes all the same matchers (but they call `negate` instead)
interface ExpectNot<Value> {
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toThrow(error?: AssertPredicate): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(count: number): void;
  toHaveBeenCalledWith(...values: unknown[]): void;
  toHaveBeenLastCalledWith(...values: unknown[]): void;
  // lastCall() — NOT on `.not` (query method, no meaningful negation)
  // toBe — future matcher
}

type UnknownFunction = (...args: unknown[]) => unknown;
```

**Overloads (unchanged):**

```typescript
expect<F extends UnknownFunction>(fn: Mock<F>): Expect<F>;
expect(fn: UnknownFunction): Expect<UnknownFunction>;
expect(value: unknown): Expect<unknown>;
```

**Notes:**

- Remove `MockMatchers` and `ValueMatchers` type aliases (they existed solely for `ReturnType` derivation).
- Remove `LooseMockFunction` type alias (no longer needed).
- Keep `UnknownFunction`.
- Add `toHaveBeenCalled()` (positive form) to the interface.
- `lastCall()` is NOT on `ExpectNot<Value>` (query method, no meaningful negation).
- `AssertPredicate` comes from `node:assert`.

**Files:**

- Write: `assert-like-jest/types.ts` (rewrite with explicit interfaces)

---

### Task 2: Registry Refactor

**Goal:** Replace `buildValueMatchers` and `buildMockMatchers` with a single registry file. All matchers declared in one file as `{ fn, negate? }`. Add positive `toHaveBeenCalled()`.

**Files:**

- Create: `assert-like-jest/matchers/registry.ts`
- Delete: `assert-like-jest/matchers/objects.ts`
- Delete: `assert-like-jest/matchers/mocks.ts`

**Registry shape (exact):**

```typescript
import assert, { type AssertPredicate } from "node:assert";
import _ from "lodash";
import { isMockFunction } from "../is-mock-function";
import type { UnknownFunction } from "../types";

type Matcher<Value, Args extends unknown[]> = {
  fn: (actual: Value, ...args: Args) => void;
  negate?: (actual: Value, ...args: Args) => void;
};

type Matchers = {
  toEqual: Matcher<unknown, [unknown]>;
  toStrictEqual: Matcher<unknown, [unknown]>;
  toThrow: Matcher<unknown, [AssertPredicate?]>;
  toHaveBeenCalled: Matcher<unknown, []>;
  toHaveBeenCalledTimes: Matcher<unknown, [number]>;
  toHaveBeenCalledWith: Matcher<unknown, [...unknown[]]>;
  toHaveBeenLastCalledWith: Matcher<unknown, [...unknown[]]>;
  lastCall: Matcher<unknown, []>;
};

const registry: Matchers = {
  // --- Value matchers ---
  toEqual: {
    fn(actual, expected) {
      assert.ok(
        _.isEqual(actual, expected),
        `Expected ${JSON.stringify(actual)} to be deeply equal to ${JSON.stringify(expected)}`,
      );
    },
    negate(actual, expected) {
      assert.ok(
        !_.isEqual(actual, expected),
        `Expected ${JSON.stringify(actual)} NOT to be deeply equal to ${JSON.stringify(expected)}`,
      );
    },
  },
  toStrictEqual: {
    fn(actual, expected) {
      assert.deepStrictEqual(actual, expected);
    },
    negate(actual, expected) {
      assert.notDeepStrictEqual(actual, expected);
    },
  },
  toThrow: {
    fn(actual, error?) {
      if (!_.isFunction(actual)) {
        throw new TypeError("toThrow() expects a function");
      }
      assert.throws(actual, error);
    },
    negate(actual, error?) {
      if (!_.isFunction(actual)) {
        throw new TypeError("toThrow() expects a function");
      }
      assert.doesNotThrow(actual, error);
    },
  },
  // --- Mock matchers ---
  toHaveBeenCalled: {
    fn(actual) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalled() expects a Node.js mock function",
        );
      }
      assert.ok(actual.mock.calls.length > 0);
    },
    negate(actual) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalled() expects a Node.js mock function",
        );
      }
      assert.strictEqual(actual.mock.calls.length, 0);
    },
  },
  toHaveBeenCalledTimes: {
    fn(actual, count) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalledTimes() expects a Node.js mock function",
        );
      }
      assert.strictEqual(
        actual.mock.calls.length,
        count,
        `Expected ${count} calls, but received ${actual.mock.calls.length}`,
      );
    },
    negate(actual, count) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalledTimes() expects a Node.js mock function",
        );
      }
      assert.notStrictEqual(
        actual.mock.calls.length,
        count,
        `Expected NOT ${count} calls, but received ${actual.mock.calls.length}`,
      );
    },
  },
  toHaveBeenCalledWith: {
    fn(actual, ...values) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalledWith() expects a Node.js mock function",
        );
      }
      const match = actual.mock.calls.some((call) => {
        if (call.arguments.length !== values.length) return false;
        return values.every(
          (value, index) =>
            assert.deepStrictEqual(call.arguments[index], value) === undefined,
        );
      });
      assert.ok(
        match,
        `Expected fn to have been called with ${JSON.stringify(values)}, but calls were: ${JSON.stringify(actual.mock.calls.map((c) => c.arguments))}`,
      );
    },
    negate(actual, ...values) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenCalledWith() expects a Node.js mock function",
        );
      }
      const match = actual.mock.calls.some((call) => {
        if (call.arguments.length !== values.length) return false;
        return values.every(
          (value, index) =>
            assert.deepStrictEqual(call.arguments[index], value) === undefined,
        );
      });
      assert.ok(
        !match,
        `Expected fn NOT to have been called with ${JSON.stringify(values)}, but it was`,
      );
    },
  },
  toHaveBeenLastCalledWith: {
    fn(actual, ...values) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenLastCalledWith() expects a Node.js mock function",
        );
      }
      assert(
        actual.mock.calls.length > 0,
        "Expected mock to have been called at least once",
      );
      const lastCallArgs =
        actual.mock.calls[actual.mock.calls.length - 1].arguments;
      assert.deepStrictEqual(lastCallArgs, values);
    },
    negate(actual, ...values) {
      if (!isMockFunction(actual)) {
        throw new TypeError(
          "toHaveBeenLastCalledWith() expects a Node.js mock function",
        );
      }
      assert(
        actual.mock.calls.length > 0,
        "Expected mock to have been called at least once",
      );
      const lastCallArgs =
        actual.mock.calls[actual.mock.calls.length - 1].arguments;
      assert.ok(
        !values.every(
          (value, index) =>
            assert.deepStrictEqual(lastCallArgs[index], value) === undefined,
        ),
        `Expected mock NOT to have been last called with ${JSON.stringify(values)}`,
      );
    },
  },
  lastCall: {
    fn(actual) {
      if (!isMockFunction(actual)) {
        throw new TypeError("lastCall() expects a Node.js mock function");
      }
      assert(
        actual.mock.calls.length > 0,
        "Expected mock to have been called at least once",
      );
      return actual.mock.calls[actual.mock.calls.length - 1].arguments;
    },
    // NOTE: no `negate` — lastCall() on `.not` throws
  },
};

export { registry };
export type { Matcher, Matchers };
```

**Key changes from current code:**

- Single file (no `objects.ts` / `mocks.ts` split)
- `toHaveBeenCalled()` (positive form) added
- All value matchers have `negate`
- All mock matchers have `negate` (except `lastCall`)
- Removed per-matcher `isMockFunction` checks from builders (runtime type guard moved to matcher `fn`)
- Removed partial `get not()` from mock matchers (negation handled at builder level)

**Files:**

- Create: `assert-like-jest/matchers/registry.ts`
- Delete: `assert-like-jest/matchers/objects.ts`
- Delete: `assert-like-jest/matchers/mocks.ts`

---

### Task 3: Expect() Builder Rewrite

**Goal:** Rewrite the single `expect()` builder to read from the registry and compose the return object. Implement `.not` via the registry's `negate` functions.

**Files:**

- Write: `assert-like-jest/assertions.ts` (complete rewrite)

**Implementation (exact logic):**

```typescript
import assert from "node:assert";
import type { AssertPredicate } from "node:assert";
import { mock, type Mock } from "node:test";
import { isMockFunction } from "./is-mock-function";
import { registry } from "./matchers/registry";
import type { Expect, ExpectNot, UnknownFunction } from "./types";
import type { Matchers } from "./matchers/registry";

// Helper: build the expect object from the registry
function buildExpect<Value>(actual: Value): Expect<Value> {
  const result = {} as Expect<Value>;

  for (const [name, matcher] of Object.entries(registry) as [
    keyof Matchers,
    Matchers[keyof Matchers],
  ][]) {
    if (name === "lastCall") {
      (result as Record<string, unknown>)[name] = function (
        ...args: unknown[]
      ) {
        return matcher.fn(actual, ...args);
      };
    } else {
      (result as Record<string, unknown>)[name] = function (
        ...args: unknown[]
      ) {
        matcher.fn(actual, ...args);
      };
    }
  }

  // Add `.not` getter
  Object.defineProperty(result, "not", {
    get(): ExpectNot<Value> {
      const notResult = {} as ExpectNot<Value>;
      for (const [name, matcher] of Object.entries(registry) as [
        keyof Matchers,
        Matchers[keyof Matchers],
      ][]) {
        if (name === "lastCall") continue;
        if (!matcher.negate) {
          (notResult as Record<string, unknown>)[name] = () => {
            throw new Error(`Cannot negate matcher "${name}".`);
          };
        } else {
          (notResult as Record<string, unknown>)[name] = function (
            ...args: unknown[]
          ) {
            matcher.negate!(actual, ...args);
          };
        }
      }
      return notResult;
    },
    configurable: true,
  });

  return result;
}

// THREE OVERLOADS (same signatures as before)
export function expect<F extends UnknownFunction>(fn: Mock<F>): Expect<F>;
export function expect(fn: UnknownFunction): Expect<UnknownFunction>;
export function expect(value: unknown): Expect<unknown>;
export function expect(value: unknown): Expect<unknown> {
  return buildExpect(value);
}

export { mocked } from "./mocked"; // re-export if exists, or skip
```

**Files:**

- Write: `assert-like-jest/assertions.ts` (complete rewrite)

---

### Task 4: Tests

**Goal:** Write tests for the new architecture, covering backward compatibility, `.not` support, and edge cases.

**Files:**

- Create: `assert-like-jest/assert.test.ts` (new test file)

**Test cases (exact):**

```typescript
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { mock } from "node:test";
import { expect } from "./assertions";

describe("assert-like-jest — value matchers", () => {
  it("toEqual deep equality", () => expect({ a: 1 }).toEqual({ a: 1 }));
  it("toEqual fails on mismatch", () =>
    assert.throws(() => expect({ a: 1 }).toEqual({ a: 2 })));
  it("not.toEqual", () => expect({ a: 1 }).not.toEqual({ a: 2 }));
  it("toStrictEqual strict equality", () => expect(1).toStrictEqual(1));
  it("toStrictEqual fails on type mismatch", () =>
    assert.throws(() => expect(1).toStrictEqual("1")));
  it("not.toStrictEqual", () => expect(1).not.toStrictEqual("1"));
  it("toThrow on function", () =>
    expect(() => {
      throw new Error("boom");
    }).toThrow(/boom/));
  it("not.toThrow", () => expect(() => {}).not.toThrow());
  it("toThrow on non-function throws TypeError", () =>
    assert.throws(() => expect(42).toThrow()));
});

describe("assert-like-jest — mock matchers", () => {
  let fn: ReturnType<typeof mock.fn>;
  beforeEach(() => {
    fn = mock.fn(() => undefined);
  });

  it("toHaveBeenCalled on called mock", () => {
    fn();
    expect(fn).toHaveBeenCalled();
  });
  it("not.toHaveBeenCalled on uncalled mock", () =>
    expect(fn).not.toHaveBeenCalled());
  it("toHaveBeenCalledTimes", () => {
    fn();
    fn();
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("not.toHaveBeenCalledTimes", () => {
    fn();
    expect(fn).not.toHaveBeenCalledTimes(2);
  });
  it("toHaveBeenCalledWith", () => {
    fn("hello", 42);
    expect(fn).toHaveBeenCalledWith("hello", 42);
  });
  it("not.toHaveBeenCalledWith", () => {
    fn("hello");
    expect(fn).not.toHaveBeenCalledWith("other");
  });
  it("toHaveBeenLastCalledWith", () => {
    fn("a");
    fn("b");
    expect(fn).toHaveBeenLastCalledWith("b");
  });
  it("lastCall returns args", () => {
    fn("x");
    const args = (expect(fn) as any).lastCall();
    assert.deepStrictEqual(args, ["x"]);
  });
  it("mock matchers on non-mock throw TypeError", () => {
    assert.throws(() => expect("s").toHaveBeenCalled());
  });
});

describe("edge cases", () => {
  it("expect(null) works", () => {
    expect(null).toEqual(null);
    expect(null).not.toEqual("null");
  });
  it("expect(undefined) works", () => {
    expect(undefined).toEqual(undefined);
  });
});
```

**Also verify existing tests still pass:**

- `server/ConnectionHandler.test.ts`
- `server/extension/ExtensionManager.test.ts`
- `server/engine/StrategyEngine.test.ts`

**Files:**

- Write: `assert-like-jest/assert.test.ts` (new test file)

---

### Task 5: Package Setup

**Goal:** Create a proper package.json with clean exports, a README, and ensure the library is importable via `tsx`.

**Files:**

- Create: `assert-like-jest/package.json`
- Create: `assert-like-jest/index.ts` (library entry point)
- Create: `assert-like-jest/README.md`

**package.json (exact):**

```json
{
  "name": "@scalper/assert-like-jest",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./index.ts"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

**index.ts (exact):**

```typescript
export { expect, mocked } from "./assertions";
export type { UnknownFunction, Expect, ExpectNot } from "./types";
export type { Matcher, Matchers } from "./matchers/registry";
```

**README.md:**

````markdown
# @scalper/assert-like-jest

Jest-compatible test matchers on top of `node:test`.

## Features

- `toEqual()`, `toStrictEqual()` — deep and strict equality
- `toThrow()` — function throws assertion
- `toHaveBeenCalled()`, `toHaveBeenCalledTimes()`, `toHaveBeenCalledWith()` — mock matchers
- `toHaveBeenLastCalledWith()`, `lastCall()` — mock inspection
- `.not` — automatic negation for all matchers

## Usage

```typescript
import { mock } from "node:test";
import { expect } from "@scalper/assert-like-jest";

const fn = mock.fn(() => "hello");
fn();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith();

expect("world").not.toEqual("hello");
```
````

## Why

Zero Jest dependencies. Native Node.js. Fast startup. Familiar API.

```

**Files:**
- Write: `assert-like-jest/package.json`
- Write: `assert-like-jest/index.ts`
- Write: `assert-like-jest/README.md`

---

## Execution Notes

### Task dependency order
1 → 2 → 3 → 4 → 5 (strict)

### How to verify each task
- After Task 1: `npx tsc --noEmit` (types compile)
- After Task 2: `npx tsc --noEmit` (registry compiles, errors in assertions.ts expected)
- After Task 3: `NODE_ENV=test node --test --import tsx` (existing tests pass)
- After Task 4: `NODE_ENV=test node --test assert-like-jest/assert.test.ts --import tsx` (new tests pass)
- After Task 5: verify imports work via `tsx` from test files

### Backward compatibility checklist
- All existing test matchers still work: `toEqual()`, `toStrictEqual()`, `toThrow()`, `toHaveBeenCalledTimes()`, `toHaveBeenCalledWith()`, `toHaveBeenLastCalledWith()`, `lastCall()`
- Existing test files must pass unchanged
- Import paths must stay the same (currently `import { expect, mocked } from "../assert-like-jest/assertions"`)
```
