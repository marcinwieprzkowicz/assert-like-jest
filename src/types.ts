import type { AssertPredicate } from "node:assert";
import type { buildMockMatchers } from "./matchers/mocks.ts";

export type UnknownFunction = (...args: any[]) => unknown;
export type LooseMockFunction = (...args: unknown[]) => unknown;

type ValueMatchersBase = {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toThrow(error?: AssertPredicate): void;
  toBeNull(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toHaveLength(receivedLength: number): void;
  toContainEqual(item: unknown): void;
  toBeInstanceOf(klass: Function): void;
};

/**
 * The matchers exposed on `expect(value).not`.
 *
 * Mirrors the runtime object built by `buildNotMatchers` — every matcher
 * listed here is a true negation of its positive counterpart. `toBe`,
 * `toEqual`, `toStrictEqual`, and `toThrow` have no negation yet.
 */
export type NegatedValueMatchers = {
  toBeNull(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toHaveLength(receivedLength: number): void;
  toContainEqual(item: unknown): void;
  toBeInstanceOf(klass: Function): void;
};

export type ValueMatchers = ValueMatchersBase & {
  not: NegatedValueMatchers;
};

export type MockMatchers<F extends UnknownFunction> = ReturnType<typeof buildMockMatchers<F>>;
