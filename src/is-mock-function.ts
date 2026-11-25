import type { Mock } from "node:test";
import type { UnknownFunction } from "./types.ts";
import { isFunction } from "./utils/is-function.ts";

/**
 * Type guard for Node.js `mock.fn()` output.
 *
 * The `mock` context is read via property access rather than the `in`
 * operator: current Node.js versions serve `mock` through an exotic
 * `[[Get]]` (Proxy-style) that `in` cannot see, even though `fn.mock`
 * resolves normally. Property access works on both old and new Node.
 *
 * @param fn - the value to check
 * @returns true if fn is a Node.js mock function
 */
export function isMockFunction<F extends UnknownFunction>(
  fn: unknown,
): fn is Mock<F> {
  if (!isFunction(fn)) {
    return false;
  }
  const context = (fn as { mock?: unknown }).mock;
  return (
    typeof context === "object" &&
    context !== null &&
    "calls" in context &&
    Array.isArray(context.calls)
  );
}
