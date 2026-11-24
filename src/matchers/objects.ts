import assert, { type AssertPredicate } from "node:assert";
import { isDeepStrictEqual } from "node:util";
import { isFunction } from "../utils/is-function.ts";

/**
 * @param value - the value to check
 * @returns true if value is a non-null object with a `.length` property
 */
function hasLength(value: unknown): value is { length: number } {
  return (
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "length" in value)
  );
}

/**
 * Creates the negated matchers object used by `.not`.
 */
function buildNotMatchers(
  notActual: unknown,
): {
  toBeNull(): void;
  toBeUndefined(): void;
  toHaveLength(receivedLength: number): void;
  toContainEqual(item: unknown): void;
  toBeInstanceOf(klass: Function): void;
  toBeDefined(): void;
} {
  return {
    toBeNull: function () {
      assert.ok(notActual !== null, "Expected value not to be null");
    },

    toBeUndefined: function () {
      assert.strictEqual(notActual, undefined);
    },

    toBeDefined: function () {
      assert.ok(notActual !== undefined, "Expected value to be defined");
    },

    toHaveLength: function (receivedLength: number) {
      if (!hasLength(notActual)) {
        throw new TypeError("Expected value with .length");
      }
      assert.notStrictEqual(notActual.length, receivedLength);
    },

    toContainEqual: function (item: unknown) {
      if (typeof notActual === "string") {
        assert.ok(
          !notActual.includes(String(item)),
          `Expected value not to contain element deeply equal to ${JSON.stringify(item)}`,
        );
        return;
      }

      if (!Array.isArray(notActual)) {
        throw new TypeError(
          `toContainEqual() expects an array or string, received ${typeof notActual}`,
        );
      }

      const found = notActual.some((_item) => {
        try {
          assert.deepStrictEqual(_item, item);
          return true;
        } catch {
          return false;
        }
      });

      assert.ok(
        !found,
        `Expected value not to contain element deeply equal to ${JSON.stringify(item)}`,
      );
    },

    toBeInstanceOf: function (klass: Function) {
      if (typeof klass !== "function") {
        throw new TypeError(
          `toBeInstanceOf() expects a class or constructor, received ${String(klass)}`,
        );
      }
      assert.ok(
        klass.prototype != null,
        `toBeInstanceOf() expects a class or constructor, received ${klass.name}`,
      );
      assert.ok(
        Object.getPrototypeOf(klass.prototype) === klass ||
          typeof klass.prototype === "object" ||
          klass.prototype === Object.prototype,
        `toBeInstanceOf() expects a class or constructor, received ${klass.name}`,
      );
      const notActualName =
        typeof notActual === "object" &&
        notActual !== null &&
        "constructor" in notActual
          ? notActual.constructor.name
          : String(notActual);
      assert.ok(
        !(notActual instanceof klass),
        `Expected ${notActualName} not to be an instance of ${
          typeof klass === "function" ? klass.name : String(klass)
        }`,
      );
    },
  };
}

/**
 * Creates the main value matchers object.
 */
export function buildValueMatchers(actual: unknown): {
  not: ReturnType<typeof buildNotMatchers>;
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toThrow(error?: AssertPredicate): void;
  toBeNull(): void;
  toBeDefined(): void;
  toHaveLength(receivedLength: number): void;
  toContainEqual(item: unknown): void;
  toBeInstanceOf(klass: Function): void;
} {
  const matchers = {
    not: buildNotMatchers(actual),
    toBe: function (expected: unknown) {
      assert.strictEqual(actual, expected);
    },

    toEqual: function (expected: unknown) {
      assert.ok(
        isDeepStrictEqual(actual, expected),
        `Expected ${JSON.stringify(actual)} to be deeply equal to ${JSON.stringify(expected)}`,
      );
    },

    toStrictEqual: function (expected: unknown) {
      assert.deepStrictEqual(actual, expected);
    },

    toThrow: function (error: AssertPredicate) {
      if (!isFunction(actual)) {
        throw new TypeError("toThrow() expects a function");
      }

      assert.throws(actual, error);
    },

    toBeNull: function () {
      assert.strictEqual(actual, null);
    },

    toBeDefined: function () {
      assert.ok(actual !== undefined, "Expected value not to be undefined");
    },

    toHaveLength: function (receivedLength: number) {
      if (!hasLength(actual)) {
        throw new TypeError("Expected value with .length");
      }
      assert.strictEqual(actual.length, receivedLength);
    },

    toContainEqual: function (item: unknown) {
      if (typeof actual === "string") {
        assert.ok(
          actual.includes(String(item)),
          `Expected value to contain element deeply equal to ${JSON.stringify(
            item,
          )}`,
        );
        return;
      }

      if (!Array.isArray(actual)) {
        throw new TypeError(
          `toContainEqual() expects an array or string, received ${typeof actual}`,
        );
      }

      const found = actual.some((_item) => {
        try {
          assert.deepStrictEqual(_item, item);
          return true;
        } catch {
          return false;
        }
      });

      assert.ok(
        found,
        `Expected value to contain element deeply equal to ${JSON.stringify(item)}`,
      );
    },

    toBeInstanceOf: function (klass: Function) {
      if (typeof klass !== "function") {
        throw new TypeError(
          `toBeInstanceOf() expects a class or constructor, received ${String(klass)}`,
        );
      }
      assert.ok(
        klass.prototype != null,
        `toBeInstanceOf() expects a class or constructor, received ${klass.name}`,
      );
      assert.ok(
        Object.getPrototypeOf(klass.prototype) === klass ||
          typeof klass.prototype === "object" ||
          klass.prototype === Object.prototype,
        `toBeInstanceOf() expects a class or constructor, received ${klass.name}`,
      );
      const actualName =
        typeof actual === "object" && actual !== null && "constructor" in actual
          ? actual.constructor.name
          : String(actual);
      assert.ok(
        actual instanceof klass,
        `Expected ${actualName} to be an instance of ${klass.name}`,
      );
    },
  };

  return matchers;
}
