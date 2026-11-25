import { describe, it, mock } from "node:test";
import { expect, mocked } from "../assertions.ts";

// A plain (non-mock) function: typed like a mock via the expect(fn: UnknownFunction)
// overload, which promises MockMatchers & ValueMatchers at runtime.
const notAMock = () => {};

describe("Mock matchers", () => {
  describe("toHaveBeenCalled", () => {
    it("passes for a called mock", () => {
      const fn = mock.fn(() => undefined);
      fn();
      expect(fn).toHaveBeenCalled();
    });

    it("fails for an uncalled mock", () => {
      const fn = mock.fn(() => undefined);
      const call = () => { expect(fn).toHaveBeenCalled(); };
      expect(call).toThrow(/Expected mock to have been called/);
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).toHaveBeenCalled(); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("toHaveBeenCalledTimes", () => {
    it("passes on exact count", () => {
      const fn = mock.fn(() => undefined);
      fn();
      fn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("fails on mismatch", () => {
      const fn = mock.fn(() => undefined);
      fn();
      const call = () => { expect(fn).toHaveBeenCalledTimes(2); };
      expect(call).toThrow();
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).toHaveBeenCalledTimes(1); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("toHaveBeenCalledWith", () => {
    it("passes when any call matches", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn("first");
      fn("hello", 42);
      expect(fn).toHaveBeenCalledWith("hello", 42);
    });

    it("matches arguments by deep equality", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn({ a: 1, b: [2] });
      expect(fn).toHaveBeenCalledWith({ a: 1, b: [2] });
    });

    it("passes with BigInt arguments (safe failure-message formatting)", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn(1n);
      expect(fn).toHaveBeenCalledWith(1n);
    });

    it("fails when no call matches", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn("hello");
      const call = () => { expect(fn).toHaveBeenCalledWith("goodbye"); };
      expect(call).toThrow(/Expected fn to have been called with/);
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).toHaveBeenCalledWith(); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("toHaveBeenLastCalledWith", () => {
    it("passes when the last call matches", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn("a");
      fn("b");
      expect(fn).toHaveBeenLastCalledWith("b");
    });

    it("fails when the last call differs", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn("a");
      fn("b");
      const call = () => { expect(fn).toHaveBeenLastCalledWith("a"); };
      expect(call).toThrow();
    });

    it("fails when the mock was never called", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      const call = () => { expect(fn).toHaveBeenLastCalledWith("a"); };
      expect(call).toThrow(/at least once/);
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).toHaveBeenLastCalledWith(); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("lastCall", () => {
    it("returns the arguments of the last call", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      fn("x", 1);
      const args = expect(fn).lastCall();
      expect(args).toEqual(["x", 1]);
    });

    it("fails when the mock was never called", () => {
      const fn = mock.fn((..._args: unknown[]) => undefined);
      const call = () => { expect(fn).lastCall(); };
      expect(call).toThrow(/at least once/);
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).lastCall(); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("not.toHaveBeenCalled", () => {
    it("passes for an uncalled mock", () => {
      const fn = mock.fn(() => undefined);
      expect(fn).not.toHaveBeenCalled();
    });

    it("fails for a called mock", () => {
      const fn = mock.fn(() => undefined);
      fn();
      const call = () => { expect(fn).not.toHaveBeenCalled(); };
      expect(call).toThrow(/Expected mock not to have been called/);
    });

    it("throws TypeError for non-mock values", () => {
      const call = () => { expect(notAMock).not.toHaveBeenCalled(); };
      expect(call).toThrow(/expects a Node.js mock function/);
    });
  });

  describe("unified dispatch", () => {
    it("mock matchers on non-function values throw the clear TypeError", () => {
      const call = () => { expect("s").toHaveBeenCalled(); };
      expect(call).toThrow(/expects a Node.js mock function/);
      const call2 = () => { expect(42).toHaveBeenCalledTimes(1); };
      expect(call2).toThrow(/expects a Node.js mock function/);
      const call3 = () => { expect("s").not.toHaveBeenCalled(); };
      expect(call3).toThrow(/expects a Node.js mock function/);
    });

    it("value matchers work on mock functions", () => {
      const fn = mock.fn(() => undefined);
      expect(fn).toBe(fn);
      expect(fn).toEqual(fn);
      expect(fn).not.toBeNull();
    });
  });

  describe("mocked", () => {
    it("returns a Node.js mock function unchanged", () => {
      const fn = mock.fn(() => undefined);
      expect(mocked(fn) === fn).toBe(true);
    });

    it("throws TypeError for non-mock values", () => {
      const plain = () => {};
      const call = () => { mocked(plain); };
      expect(call).toThrow(/must be a Node.js mock function/);
    });
  });
});
