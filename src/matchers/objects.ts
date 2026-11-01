import assert, { type AssertPredicate } from "node:assert";
import _ from "lodash";

export function buildValueMatchers(actual: unknown) {
  return {
    toEqual(expected: unknown) {
      assert.ok(
        _.isEqual(actual, expected),
        `Expected ${JSON.stringify(actual)} to be deeply equal to ${JSON.stringify(expected)}`,
      );
    },

    toStrictEqual(expected: unknown) {
      assert.deepStrictEqual(actual, expected);
    },

    toThrow(error: AssertPredicate) {
      if (!_.isFunction(actual)) {
        throw new TypeError("toThrow() expects a function");
      }

      assert.throws(actual, error);
    },
  };
}
