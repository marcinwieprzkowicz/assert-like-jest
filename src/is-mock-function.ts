import type { Mock } from "node:test";
import type { UnknownFunction } from "./types";
import { isFunction } from "./utils/is-function.ts";

export function isMockFunction<F extends UnknownFunction>(
  fn: unknown,
): fn is Mock<F> {
  return (
    isFunction(fn) &&
    "mock" in fn &&
    typeof fn.mock === "object" &&
    fn.mock !== null &&
    "calls" in fn.mock &&
    Array.isArray(fn.mock.calls)
  );
}
