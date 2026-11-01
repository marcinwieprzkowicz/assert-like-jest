import type { Mock } from "node:test";
import type { UnknownFunction } from "./types";

interface MockInternal {
  mock: {
    calls: Array<{ arguments: unknown[] }>;
  };
}

export function isMockFunction<F extends UnknownFunction>(
  fn: unknown,
): fn is Mock<F> {
  if (typeof fn !== "function" || fn === null) {
    return false;
  }

  const candidate = fn as unknown as MockInternal;

  return (
    candidate.mock !== undefined &&
    candidate.mock !== null &&
    typeof candidate.mock === "object" &&
    Array.isArray(candidate.mock.calls)
  );
}
