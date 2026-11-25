import { inspect } from "node:util";

/**
 * Formats a value for use in assertion failure messages.
 *
 * Unlike `JSON.stringify`, `util.inspect` never throws on BigInt values,
 * circular references, functions, or symbols, so building a message for a
 * *passing* assertion is always safe.
 *
 * @param value - the value to format
 * @returns a single-line, human-readable representation of the value
 */
export function format(value: unknown): string {
  return inspect(value, { depth: 10, breakLength: Infinity, compact: true });
}
