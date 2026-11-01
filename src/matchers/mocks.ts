import assert from "node:assert";
import { isMockFunction } from "../is-mock-function";
import type { UnknownFunction } from "../types";

type ExpectedArguments<F extends UnknownFunction> = [
  ...Parameters<F>,
  ...unknown[],
];

export function buildMockMatchers<F extends UnknownFunction>(fn: unknown) {
  return {
    toHaveBeenCalledTimes(count: number) {
      if (isMockFunction<F>(fn)) {
        const actual = fn.mock.calls.length;
        assert.strictEqual(
          actual,
          count,
          `Expected ${count} calls, but received ${actual}`,
        );
      } else {
        throw new TypeError(
          "toHaveBeenCalledTimes() expects a Node.js mock function",
        );
      }
    },

    toHaveBeenCalledWith(...values: ExpectedArguments<F>) {
      if (isMockFunction<F>(fn)) {
        const { calls } = fn.mock;
        const match = calls.some((_call) => {
          if (_call.arguments.length !== values.length) return false;
          try {
            return values.every(
              (value, index) =>
                assert.deepStrictEqual(_call.arguments[index], value) ===
                undefined,
            );
          } catch {
            return false;
          }
        });
        assert.ok(
          match,
          `Expected fn to have been called with ${JSON.stringify(values)}, but calls were: ${JSON.stringify(calls.map((c) => c.arguments))}`,
        );
      } else {
        throw new TypeError(
          "toHaveBeenCalledWith() expects a Node.js mock function",
        );
      }
    },

    toHaveBeenLastCalledWith(...values: ExpectedArguments<F>) {
      if (isMockFunction<F>(fn)) {
        const { calls } = fn.mock;
        assert(
          calls.length > 0,
          "Expected mock to have been called at least once",
        );
        const lastCallArgs = calls[calls.length - 1].arguments;
        assert.deepStrictEqual(lastCallArgs, values);
      } else {
        throw new TypeError(
          "toHaveBeenLastCalledWith() expects a Node.js mock function",
        );
      }
    },

    lastCall(): unknown[] {
      if (isMockFunction<F>(fn)) {
        const { calls } = fn.mock;
        assert(
          calls.length > 0,
          "Expected mock to have been called at least once",
        );
        return calls[calls.length - 1].arguments;
      } else {
        throw new TypeError("lastCall() expects a Node.js mock function");
      }
    },

    get not() {
      return {
        toHaveBeenCalled() {
          if (isMockFunction<F>(fn)) {
            const actual = fn.mock.calls.length;
            assert(
              actual === 0,
              `Expected mock not to have been called, but it was called ${actual} time(s)`,
            );
          } else {
            throw new TypeError(
              "not.toHaveBeenCalled() expects a Node.js mock function",
            );
          }
        },
      };
    },
  };
}
