import { buildMockMatchers } from "./matchers/mocks.ts";
import { buildValueMatchers } from "./matchers/objects.ts";

export type UnknownFunction = (...args: any[]) => unknown;
export type LooseMockFunction = (...args: unknown[]) => unknown;
export type MockMatchers<F extends UnknownFunction> = ReturnType<
  typeof buildMockMatchers<F>
>;
export type ValueMatchers = ReturnType<typeof buildValueMatchers>;
