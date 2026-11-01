import { describe, it } from "node:test";
import { expect } from "../assertions.ts";
import { isFunction } from "./is-function.ts";

describe("isFunction", () => {
  describe("returns true for real functions", () => {
    it("regular function declaration", () => {
      function foo() {}
      expect(isFunction(foo)).toBe(true);
    });

    it("arrow function", () => {
      const fn = () => {};
      expect(isFunction(fn)).toBe(true);
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    it("async function", async () => {
      const fn = async function () {};
      expect(isFunction(fn)).toBe(true);
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    it("async arrow function", async () => {
      const fn = async () => {};
      expect(isFunction(fn)).toBe(true);
    });

    it("generator function assigned to const", () => {
      const gen = function* () {};
      expect(isFunction(gen)).toBe(true);
    });

    it("class constructor", () => {
      class Foo {
        bar = () => {
          return "hello";
        };
      }
      expect(isFunction(Foo)).toBe(true);
    });

    it("class method", () => {
      class Foo {
        bar = () => {
          return "hello";
        };
      }
      expect(isFunction(new Foo().bar)).toBe(true);
    });

    it("function expression", () => {
      const fn = function () {};
      expect(isFunction(fn)).toBe(true);
    });

    it("built-in constructors: Array", () => {
      expect(isFunction(Array)).toBe(true);
    });

    it("built-in constructors: Object", () => {
      expect(isFunction(Object)).toBe(true);
    });

    it("built-in constructors: Map", () => {
      expect(isFunction(Map)).toBe(true);
    });

    it("built-in constructors: Set", () => {
      expect(isFunction(Set)).toBe(true);
    });

    it("built-in constructors: Date", () => {
      expect(isFunction(Date)).toBe(true);
    });

    it("built-in constructors: RegExp", () => {
      expect(isFunction(RegExp)).toBe(true);
    });

    it("built-in constructors: Error", () => {
      expect(isFunction(Error)).toBe(true);
    });

    it("built-in constructors: Promise", () => {
      expect(isFunction(Promise)).toBe(true);
    });

    it("built-in constructors: Number", () => {
      expect(isFunction(Number)).toBe(true);
    });

    it("built-in constructors: String", () => {
      expect(isFunction(String)).toBe(true);
    });

    it("built-in constructors: Boolean", () => {
      expect(isFunction(Boolean)).toBe(true);
    });
  });

  describe("returns false for non-functions", () => {
    it("null", () => {
      expect(isFunction(null)).toBe(false);
    });

    it("undefined", () => {
      expect(isFunction(undefined)).toBe(false);
    });

    it("string primitive", () => {
      expect(isFunction("hello")).toBe(false);
    });

    it("number primitive", () => {
      expect(isFunction(42)).toBe(false);
    });

    it("boolean primitive", () => {
      expect(isFunction(true)).toBe(false);
    });

    it("symbol", () => {
      expect(isFunction(Symbol("x"))).toBe(false);
    });

    it("plain object", () => {
      expect(isFunction({})).toBe(false);
    });

    it("array", () => {
      expect(isFunction([])).toBe(false);
    });

    it("Date instance", () => {
      expect(isFunction(new Date())).toBe(false);
    });

    it("RegExp instance", () => {
      expect(isFunction(/foo/)).toBe(false);
    });

    it("Promise instance", () => {
      expect(isFunction(Promise.resolve())).toBe(false);
    });

    it("Map instance", () => {
      expect(isFunction(new Map())).toBe(false);
    });

    it("Set instance", () => {
      expect(isFunction(new Set())).toBe(false);
    });

    it("Number instance", () => {
      expect(isFunction(new Number(42))).toBe(false);
    });

    it("String instance", () => {
      expect(isFunction(new String("hello"))).toBe(false);
    });

    it("Boolean instance", () => {
      expect(isFunction(new Boolean(true))).toBe(false);
    });
  });

  describe("rejects function-like imposters", () => {
    it("object with .call property (not a real function)", () => {
      const fake = { call: () => {} };
      expect(isFunction(fake)).toBe(false);
    });

    it("object with .apply property (not a real function)", () => {
      const fake = { apply: () => {} };
      expect(isFunction(fake)).toBe(false);
    });

    it("object with .toString property returning [object Function]", () => {
      const fake = { toString: () => "[object Function]" };
      expect(isFunction(fake)).toBe(false);
    });
  });
});
