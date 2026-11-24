import { describe, it } from "node:test";
import { expect } from "../assertions.ts";

describe("Value matchers", () => {
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
      expect(new Error()).toBeInstanceOf(Error);
    });

    it("fails for non-instances", () => {
      const fn = () => { expect(42).toBeInstanceOf(Error); };
      expect(fn).toThrow();
      const fn2 = () => { expect("hello").toBeInstanceOf(Error); };
      expect(fn2).toThrow();
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
      it("passes for defined values", () => {
        expect(42).not.toBeDefined();
        expect("hello").not.toBeDefined();
      });

      it("fails for undefined", () => {
        const fn = () => { expect(undefined).not.toBeDefined(); };
        expect(fn).toThrow();
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
    });

    describe("not.toContainEqual", () => {
      it("passes when item is not in array", () => {
        expect([1, 2, 3]).not.toContainEqual(4);
      });

      it("fails when item is in array", () => {
        const fn = () => { expect([1, 2, 3]).not.toContainEqual(2); };
        expect(fn).toThrow(/Expected value not to contain/);
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
  });
});
