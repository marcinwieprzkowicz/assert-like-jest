import { describe, it } from "node:test";
import { expect } from "../assertions.ts";

describe("Value matchers", () => {
  describe("toBe", () => {
    it("passes for identical values", () => {
      expect(42).toBe(42);
      const obj = { a: 1 };
      expect(obj).toBe(obj);
    });

    it("fails for different values", () => {
      const fn = () => { expect(1).toBe(2); };
      expect(fn).toThrow();
      const fn2 = () => { expect({ a: 1 }).toBe({ a: 1 }); };
      expect(fn2).toThrow();
    });
  });

  describe("toEqual", () => {
    it("passes for deeply equal values", () => {
      expect({ a: 1, b: [2] }).toEqual({ a: 1, b: [2] });
      expect("hello").toEqual("hello");
    });

    it("fails on mismatch", () => {
      const fn = () => { expect({ a: 1 }).toEqual({ a: 2 }); };
      expect(fn).toThrow(/to be deeply equal/);
      const fn2 = () => { expect({ a: 1 }).toEqual({ a: "1" }); };
      expect(fn2).toThrow();
    });
  });

  describe("toStrictEqual", () => {
    it("passes for strict deep equality", () => {
      expect(1).toStrictEqual(1);
      expect({ a: 1 }).toStrictEqual({ a: 1 });
    });

    it("fails on type mismatch", () => {
      const fn = () => { expect(1).toStrictEqual("1"); };
      expect(fn).toThrow();
      const fn2 = () => { expect(undefined).toStrictEqual(null); };
      expect(fn2).toThrow();
    });
  });

  describe("toThrow", () => {
    it("passes when the function throws a matching error", () => {
      expect(() => { throw new Error("boom"); }).toThrow(/boom/);
      expect(() => { throw new Error("boom"); }).toThrow();
      expect(() => { throw new TypeError("boom"); }).toThrow(TypeError);
    });

    it("fails when the function does not throw", () => {
      const fn = () => { expect(() => {}).toThrow(); };
      expect(fn).toThrow();
    });

    it("fails when the error does not match", () => {
      const fn = () => { expect(() => { throw new Error("boom"); }).toThrow(/bang/); };
      expect(fn).toThrow();
    });

    it("throws TypeError for non-functions", () => {
      const fn = () => { expect(42).toThrow(); };
      expect(fn).toThrow(/expects a function/);
    });
  });

  describe("toBeNull", () => {
    it("passes for null", () => {
      expect(null).toBeNull();
    });

    it("fails for non-null values", () => {
      const fn = () => { expect(42).toBeNull(); };
      expect(fn).toThrow();
      const fn2 = () => { expect("hello").toBeNull(); };
      expect(fn2).toThrow();
      const fn3 = () => { expect(undefined).toBeNull(); };
      expect(fn3).toThrow();
    });
  });

  describe("toBeDefined", () => {
    it("passes for non-undefined values", () => {
      expect(42).toBeDefined();
      expect("hello").toBeDefined();
      expect(null).toBeDefined();
      expect({}).toBeDefined();
    });

    it("fails for undefined", () => {
      const fn = () => { expect(undefined).toBeDefined(); };
      expect(fn).toThrow();
    });
  });

  describe("toBeUndefined", () => {
    it("passes for undefined", () => {
      expect(undefined).toBeUndefined();
    });

    it("fails for defined values", () => {
      const fn = () => { expect(42).toBeUndefined(); };
      expect(fn).toThrow(/Expected value to be undefined/);
      const fn2 = () => { expect(null).toBeUndefined(); };
      expect(fn2).toThrow();
      const fn3 = () => { expect("").toBeUndefined(); };
      expect(fn3).toThrow();
    });
  });

  describe("toHaveLength", () => {
    it("passes for strings", () => {
      expect("hello").toHaveLength(5);
      expect("abc").toHaveLength(3);
    });

    it("passes for arrays", () => {
      expect([1, 2, 3]).toHaveLength(3);
      expect([]).toHaveLength(0);
    });

    it("fails for values without .length", () => {
      const fn = () => { expect(42).toHaveLength(5); };
      expect(fn).toThrow(/Expected value with .length/);
    });

    it("fails for wrong length", () => {
      const fn = () => { expect("hello").toHaveLength(3); };
      expect(fn).toThrow();
    });

    it("works for array-like objects", () => {
      expect({ length: 2 }).toHaveLength(2);
      const fn = () => { expect({ length: 2 }).toHaveLength(3); };
      expect(fn).toThrow();
      const fn2 = () => { expect({}).toHaveLength(1); };
      expect(fn2).toThrow(/Expected value with .length/);
    });
  });

  describe("toContainEqual", () => {
    it("passes when item is in array", () => {
      expect([1, 2, 3]).toContainEqual(2);
      expect([{ a: 1 }, { a: 2 }]).toContainEqual({ a: 1 });
    });

    it("passes when item is in string (substring match)", () => {
      expect("hello world").toContainEqual("world");
    });

    it("fails when item is not in array", () => {
      const fn = () => { expect([1, 2, 3]).toContainEqual(4); };
      expect(fn).toThrow(/Expected value to contain/);
    });

    it("fails for non-array/non-string values", () => {
      const fn = () => { expect(42).toContainEqual(1); };
      expect(fn).toThrow(/expects an array or string/);
    });

    it("string branch: fails for non-array/non-string values", () => {
      const fn = () => { expect(42).not.toContainEqual(1); };
      expect(fn).toThrow(/expects an array or string/);
    });

    it("does deep equality comparison", () => {
      expect([{ a: 1 }, { a: 2 }]).toContainEqual({ a: 1 });
    });

    it("does deep equality comparison with nested objects", () => {
      expect([{ a: { b: 1 } }]).toContainEqual({ a: { b: 1 } });
    });
  });

  describe("toBeInstanceOf", () => {
    it("passes for actual instances", () => {
      expect(new Error()).toBeInstanceOf(Error);
      expect([]).toBeInstanceOf(Array);
    });

    it("fails for non-instances", () => {
      const fn = () => { expect(42).toBeInstanceOf(Error); };
      expect(fn).toThrow();
      const fn2 = () => { expect("hello").toBeInstanceOf(Error); };
      expect(fn2).toThrow();
    });

    it("rejects non-constructor arguments", () => {
      const fn = () => { expect(new Error()).toBeInstanceOf(42 as unknown as Function); };
      expect(fn).toThrow(/expects a class or constructor/);
      const fn2 = () => { expect(new Error()).not.toBeInstanceOf("nope" as unknown as Function); };
      expect(fn2).toThrow(/expects a class or constructor/);
    });

    it("accepts bound constructors", () => {
      class Bound {
        value = 1;
      }
      const bound = Bound.bind(null);
      expect(new Bound()).toBeInstanceOf(bound);
      expect(new Bound()).not.toBeInstanceOf(String);
    });

    it("rejects arrow functions with a clear error", () => {
      const fn = () => { expect({}).toBeInstanceOf(() => {}); };
      expect(fn).toThrow(/expects a class or constructor/);
      const fn2 = () => { expect({}).not.toBeInstanceOf(() => {}); };
      expect(fn2).toThrow(/expects a class or constructor/);
    });
  });

  describe("not", () => {
    describe("not.toBeNull", () => {
      it("passes for non-null values", () => {
        expect(42).not.toBeNull();
        expect("hello").not.toBeNull();
      });

      it("fails for null", () => {
        const fn = () => { expect(null).not.toBeNull(); };
        expect(fn).toThrow();
      });
    });

    describe("not.toBeDefined", () => {
      it("passes for undefined", () => {
        expect(undefined).not.toBeDefined();
      });

      it("fails for defined values", () => {
        const fn = () => { expect(42).not.toBeDefined(); };
        expect(fn).toThrow(/Expected value to be undefined/);
        const fn2 = () => { expect("hello").not.toBeDefined(); };
        expect(fn2).toThrow();
        const fn3 = () => { expect(null).not.toBeDefined(); };
        expect(fn3).toThrow();
      });
    });

    describe("not.toBeUndefined", () => {
      it("passes for defined values", () => {
        expect(42).not.toBeUndefined();
        expect("hello").not.toBeUndefined();
        expect(null).not.toBeUndefined();
      });

      it("fails for undefined", () => {
        const fn = () => { expect(undefined).not.toBeUndefined(); };
        expect(fn).toThrow(/Expected value to be defined/);
      });
    });

    describe("not.toHaveLength", () => {
      it("passes for strings", () => {
        expect("hello").not.toHaveLength(10);
      });

      it("passes for arrays", () => {
        expect([1, 2, 3]).not.toHaveLength(7);
      });

      it("fails for values without .length", () => {
        const fn = () => { expect(42).not.toHaveLength(1); };
        expect(fn).toThrow(/Expected value with .length/);
      });

      it("fails when lengths are equal", () => {
        const fn = () => { expect("hello").not.toHaveLength(5); };
        expect(fn).toThrow(/not to have length 5/);
        const fn2 = () => { expect([1, 2]).not.toHaveLength(2); };
        expect(fn2).toThrow(/not to have length 2/);
      });
    });

    describe("not.toContainEqual", () => {
      it("passes when item is not in array", () => {
        expect([1, 2, 3]).not.toContainEqual(4);
      });

      it("fails when item is in array", () => {
        const fn = () => { expect([1, 2, 3]).not.toContainEqual(2); };
        expect(fn).toThrow(/Expected value not to contain/);
      });

      it("passes when substring is not in string", () => {
        expect("hello world").not.toContainEqual("nope");
      });

      it("fails when substring is in string", () => {
        const fn = () => { expect("hello").not.toContainEqual("ell"); };
        expect(fn).toThrow(/Expected value not to contain substring/);
      });
    });

    describe("not.toBeInstanceOf", () => {
      it("passes for non-instances", () => {
        expect(42).not.toBeInstanceOf(String);
        expect("hello").not.toBeInstanceOf(Array);
      });

      it("fails for actual instances", () => {
        const fn = () => { expect(new String("hello")).not.toBeInstanceOf(String); };
        expect(fn).toThrow();
      });
    });

    it("clear error for matchers that have no negation yet", () => {
      const not = expect(1).not as unknown as Record<
        string,
        (...args: unknown[]) => void
      >;
      const fn = () => { not.toBe(2); };
      expect(fn).toThrow(/Cannot negate matcher "toBe"/);
      const fn2 = () => { not.toEqual({}); };
      expect(fn2).toThrow(/Cannot negate matcher "toEqual"/);
    });
  });

  describe("complex values in failure messages", () => {
    it("toContainEqual passes with BigInt items", () => {
      expect([1n]).toContainEqual(1n);
      expect([1n]).not.toContainEqual(2n);
    });

    it("toContainEqual passes with circular items", () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect([circular]).toContainEqual(circular);
      expect([circular]).not.toContainEqual({ other: true });
    });

    it("toEqual passes with BigInt values", () => {
      expect({ a: 1n }).toEqual({ a: 1n });
      expect({ a: 1n }).toStrictEqual({ a: 1n });
    });

    it("reports BigInt items readably when the assertion fails", () => {
      const fn = () => { expect([1n]).toContainEqual(2n); };
      expect(fn).toThrow(/2n/);
      const fn2 = () => { expect([1n]).not.toContainEqual(1n); };
      expect(fn2).toThrow(/1n/);
    });
  });
});
