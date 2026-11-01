import assert, { type AssertPredicate } from "node:assert";
import { isDeepStrictEqual } from "node:util";
import { isFunction } from "../utils/is-function.ts";

export function buildValueMatchers(actual: unknown) {
  return {
    toBe(expected: unknown) {
      assert.strictEqual(actual, expected);
    },

    toEqual(expected: unknown) {
      assert.ok(
        isDeepStrictEqual(actual, expected),
        `Expected ${JSON.stringify(actual)} to be deeply equal to ${JSON.stringify(expected)}`,
      );
    },

    toStrictEqual(expected: unknown) {
      assert.deepStrictEqual(actual, expected);
    },

    toThrow(error: AssertPredicate) {
      if (!isFunction(actual)) {
        throw new TypeError("toThrow() expects a function");
      }

      assert.throws(actual, error);
    },
  };
}
