import type { Mock } from "node:test";
import { isMockFunction } from "./is-mock-function.ts";
import { buildMockMatchers } from "./matchers/mocks.ts";
import { buildValueMatchers } from "./matchers/objects.ts";
import type {
  LooseMockFunction,
  UnknownFunction,
  MockMatchers,
  ValueMatchers,
} from "./types.ts";

export function mocked<F extends UnknownFunction>(fn: unknown) {
  if (!isMockFunction<F>(fn)) {
    throw new TypeError(
      "mocked() argument must be a Node.js mock function (created via mock.fn())",
    );
  }

  return fn;
}

export function expect<F extends UnknownFunction>(
  fn: Mock<F>,
): MockMatchers<F> & ValueMatchers;
export function expect(
  value: unknown,
): MockMatchers<LooseMockFunction> & ValueMatchers;
export function expect(
  fnOrValue: unknown,
): MockMatchers<LooseMockFunction> & ValueMatchers {
  // Unified Jest-style surface: every input gets both matcher sets. The mock
  // matchers guard at runtime and throw a clear TypeError when called on a
  // non-mock; value matchers work on any value.
  const valueMatchers = buildValueMatchers(fnOrValue);
  const mockMatchers = buildMockMatchers<LooseMockFunction>(fnOrValue);
  return {
    ...valueMatchers,
    ...mockMatchers,
    not: withClearNegationErrors({
      ...valueMatchers.not,
      ...mockMatchers.not,
    }),
  };
}

/**
 * Wraps the merged `.not` object so accessing a matcher that has no
 * negation yet throws a clear error instead of "is not a function".
 *
 * @param negated - the merged negated matchers object
 * @returns a proxy that throws on unknown matcher properties
 */
function withClearNegationErrors<T extends object>(negated: T): T {
  return new Proxy(negated, {
    get(target, prop) {
      // Symbols (inspection etc.) and `then` (thenable detection) pass
      // through untouched; existing matchers resolve normally.
      if (
        typeof prop === "symbol" ||
        prop === "then" ||
        Reflect.has(target, prop)
      ) {
        return Reflect.get(target, prop);
      }
      throw new Error(`Cannot negate matcher "${prop}" yet.`);
    },
  });
}
