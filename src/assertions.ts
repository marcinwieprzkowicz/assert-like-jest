import type { Mock } from "node:test";
import { isMockFunction } from "./is-mock-function";
import { buildMockMatchers } from "./matchers/mocks";
import { buildValueMatchers } from "./matchers/objects";
import type {
  LooseMockFunction,
  UnknownFunction,
  MockMatchers,
  ValueMatchers,
} from "./types";

export function mocked<F extends UnknownFunction>(fn: unknown) {
  if (!isMockFunction<F>(fn)) {
    throw new TypeError(
      "mocked() argument must be a Node.js mock function (created via mock.fn())",
    );
  }

  return fn;
}

export function expect<F extends UnknownFunction>(fn: Mock<F>): MockMatchers<F>;
export function expect(
  fn: UnknownFunction,
): MockMatchers<LooseMockFunction> & ValueMatchers;
export function expect(value: unknown): ValueMatchers;
export function expect(
  fnOrValue: unknown,
): MockMatchers<LooseMockFunction> | ValueMatchers {
  if (isMockFunction<LooseMockFunction>(fnOrValue)) {
    return buildMockMatchers<LooseMockFunction>(fnOrValue);
  }
  return buildValueMatchers(fnOrValue);
}
