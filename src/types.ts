import type { buildMockMatchers } from "./matchers/mocks.ts";

export type UnknownFunction = (...args: any[]) => unknown;
export type LooseMockFunction = (...args: unknown[]) => unknown;

export type ToBeNull = () => void;
export type ToBeDefined = () => void;
export type ToHaveLength = (receivedLength: number) => void;
export type ToContainEqual = (item: unknown) => void;
export type ToBeInstanceOf = (klass: Function) => void;
export type ToBeUndefined = () => void;

export type ToBeOrEqual = ToBeDefined | ToBeNull;

export type ToContainOrEqual = ToContainEqual | NegatedToContainEqual;

export type ToHaveOrNotLength = ToHaveLength | NegatedToHaveLength;

export type ToContainOrNotContainEqual = ToContainEqual | NegatedToContainEqual;

type NegatedToBeNull = { toBeUndefined(): void };
type NegatedToBeDefined = { toBeNull(): void; toBeDefined(): void };
type NegatedToHaveLength = { toHaveLength(n: number): void };
type NegatedToContainEqual = { toContainEqual(item: unknown): void };
type NegatedToBeInstanceOf = { toBeInstanceOf(klass: Function): void };

type ValueMatchersBase = {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toThrow(error?: any): void;
  toBeNull(): void;
  toBeDefined(): void;
  toHaveLength(receivedLength: number): void;
  toContainEqual(item: unknown): void;
  toBeInstanceOf(klass: Function): void;
};

export type ValueMatchers = ValueMatchersBase & {
  not: NegatedToBeNull & NegatedToBeDefined & NegatedToHaveLength & NegatedToContainEqual & NegatedToBeInstanceOf;
};

export type MockMatchers<F extends UnknownFunction> = ReturnType<typeof buildMockMatchers<F>>;
