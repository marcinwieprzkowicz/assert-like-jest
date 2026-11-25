import assert, { type AssertPredicate } from "node:assert";
import { isDeepStrictEqual } from "node:util";
import { format } from "../utils/format.ts";
import { isFunction } from "../utils/is-function.ts";
import type { NegatedValueMatchers, ValueMatchers } from "../types.ts";

/**
 * @param value - the value to check
 * @returns true if value is a string or a non-null object with a `length` property
 */
function hasLength(value: unknown): value is { length: unknown } {
  return (
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "length" in value)
  );
}

/**
 * Reads the `length` of a string or array-like object.
 *
 * @param value - the value to read the length from
 * @returns the value's `length` property
 * @throws {TypeError} if value has no `length` property
 */
function getLength(value: unknown): unknown {
  if (!hasLength(value)) {
    throw new TypeError("Expected value with .length");
  }
  return value.length;
}

/**
 * Checks whether a string or array contains an item.
 *
 * Strings use substring matching; arrays use deep equality.
 *
 * @param collection - a string or array to search
 * @param item - the substring or deeply compared element to look for
 * @returns true if the collection contains the item
 */
function containsDeep(collection: string | unknown[], item: unknown): boolean {
  if (typeof collection === "string") {
    return collection.includes(String(item));
  }
  return collection.some((element) => {
    try {
      assert.deepStrictEqual(element, item);
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Validates that a value can be used as the right-hand side of `instanceof`.
 *
 * @param klass - the candidate class or constructor
 * @throws {TypeError} if klass is not a function
 */
function validateConstructor(klass: Function): void {
  if (typeof klass !== "function") {
    throw new TypeError(
      `toBeInstanceOf() expects a class or constructor, received ${String(klass)}`,
    );
  }
}

/**
 * `instanceof` that re-throws V8's native "non-object prototype" error
 * (raised for arrow functions) with the matcher's own clear message.
 * Bound constructors are valid — the spec resolves them to their target.
 *
 * @param value - the value to test
 * @param klass - the class or constructor to test against
 * @returns true if value is an instance of klass
 * @throws {TypeError} if klass cannot be used with `instanceof`
 */
function isInstanceOf(value: unknown, klass: Function): boolean {
  try {
    return value instanceof klass;
  } catch {
    throw new TypeError(
      `toBeInstanceOf() expects a class or constructor, received ${klass.name}`,
    );
  }
}

/**
 * Renders a value for assertion messages using its constructor name when
 * available (e.g. `Date` for `new Date()`), falling back to `String()`.
 *
 * @param value - the value to describe
 * @returns a short human-readable name for the value
 */
function describeValue(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "constructor" in value &&
    typeof value.constructor === "function"
  ) {
    return value.constructor.name;
  }
  return String(value);
}

/**
 * Creates the negated matchers object used by `.not`.
 */
function buildNotMatchers(notActual: unknown): NegatedValueMatchers {
  return {
    toBeNull() {
      assert.ok(notActual !== null, "Expected value not to be null");
    },

    toBeDefined() {
      assert.ok(notActual === undefined, "Expected value to be undefined");
    },

    toBeUndefined() {
      assert.notStrictEqual(
        notActual,
        undefined,
        "Expected value to be defined",
      );
    },

    toHaveLength(receivedLength: number) {
      const length = getLength(notActual);
      assert.notStrictEqual(
        length,
        receivedLength,
        `Expected value not to have length ${String(receivedLength)}, but received ${String(length)}`,
      );
    },

    toContainEqual(item: unknown) {
      if (typeof notActual !== "string" && !Array.isArray(notActual)) {
        throw new TypeError(
          `toContainEqual() expects an array or string, received ${typeof notActual}`,
        );
      }

      assert.ok(
        !containsDeep(notActual, item),
        typeof notActual === "string"
          ? `Expected value not to contain substring ${format(item)}`
          : `Expected value not to contain element deeply equal to ${format(item)}`,
      );
    },

    toBeInstanceOf(klass: Function) {
      validateConstructor(klass);
      assert.ok(
        !isInstanceOf(notActual, klass),
        `Expected ${describeValue(notActual)} not to be an instance of ${klass.name}`,
      );
    },
  };
}

/**
 * Creates the main value matchers object.
 */
export function buildValueMatchers(actual: unknown): ValueMatchers {
  return {
    not: buildNotMatchers(actual),

    toBe(expected: unknown) {
      assert.strictEqual(actual, expected);
    },

    toEqual(expected: unknown) {
      assert.ok(
        isDeepStrictEqual(actual, expected),
        `Expected ${format(actual)} to be deeply equal to ${format(expected)}`,
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

    toBeNull() {
      assert.strictEqual(actual, null);
    },

    toBeDefined() {
      assert.ok(actual !== undefined, "Expected value to be defined");
    },

    toBeUndefined() {
      assert.strictEqual(actual, undefined, "Expected value to be undefined");
    },

    toHaveLength(receivedLength: number) {
      const length = getLength(actual);
      assert.strictEqual(
        length,
        receivedLength,
        `Expected value to have length ${String(receivedLength)}, but received ${String(length)}`,
      );
    },

    toContainEqual(item: unknown) {
      if (typeof actual !== "string" && !Array.isArray(actual)) {
        throw new TypeError(
          `toContainEqual() expects an array or string, received ${typeof actual}`,
        );
      }

      assert.ok(
        containsDeep(actual, item),
        typeof actual === "string"
          ? `Expected value to contain substring ${format(item)}`
          : `Expected value to contain element deeply equal to ${format(item)}`,
      );
    },

    toBeInstanceOf(klass: Function) {
      validateConstructor(klass);
      assert.ok(
        isInstanceOf(actual, klass),
        `Expected ${describeValue(actual)} to be an instance of ${klass.name}`,
      );
    },
  };
}
