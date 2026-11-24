# Jest API Gap Analysis

**Date:** 2026-11-24
**Target:** Jest 30.5 (latest)

> Summary: The `assert-like-jest` project currently implements **9** value matchers and **5** mock matchers,
> all with full TypeScript support and `.not` negation. Full parity would still require ~25+
> additional matchers.

---

## P0 Implemented (High-impact, low-effort) ✅

| Matcher                     | Status                                                 | Notes |
| --------------------------- | ------------------------------------------------------ | ----- |
| `toBeNull()`                | ✅ Checks `value === null`                             |
| `toBeDefined()`             | ✅ Checks `value !== undefined`                        |
| `toHaveLength(n)`           | ✅ Checks `value.length === n` for strings/arrays      |
| `toContainEqual(item)`      | ✅ Deep equality in arrays + substring in strings      |
| `toBeInstanceOf(Class)`     | ✅ Validates class/constructor and checks `instanceof` |
| `not.toBeNull()`            | ✅ Negation of `toBeNull`                              |
| `not.toBeDefined()`         | ✅ Negation of `toBeDefined`                           |
| `not.toHaveLength(n)`       | ✅ Negation of `toHaveLength`                          |
| `not.toContainEqual(item)`  | ✅ Negation of `toContainEqual`                        |
| `not.toBeInstanceOf(Class)` | ✅ Negation of `toBeInstanceOf`                        |

---

## P1 (High-impact, medium-effort)

| Matcher                           | Difficulty | Notes                          |
| --------------------------------- | ---------- | ------------------------------ |
| `toMatch(regexp \| string)`       | Low        | Regex or substring matching    |
| `toMatchObject(object)`           | Low-Medium | Partial object match           |
| `expect.anything()`               | Low        | Matches any non-null/undefined |
| `expect.any(Constructor)`         | Low        | Type constructor matcher       |
| `expect.stringContaining(string)` | Low        | String includes check          |
| `expect.stringMatching(pattern)`  | Low        | Regex/string match             |
| `expect.closeTo(number, digits?)` | Low        | Float comparison               |
| `expect.arrayOf(matcher)`         | Medium     | All array elements match       |

---

## P2 (Medium-impact)

| Matcher                               | Difficulty | Notes                                    |
| ------------------------------------- | ---------- | ---------------------------------------- |
| `.resolves`                           | Medium     | Unwrap promise resolutions               |
| `.rejects`                            | Medium     | Unwrap promise rejections                |
| `toHaveBeenCalledWith()`              | Medium     | Already have, but for non-mock functions |
| `toHaveBeenNthCalledWith(n, ...args)` | Medium     | Nth call args check                      |
| `toHaveReturnedTimes(n)`              | Medium     | Returned exactly n times                 |
| `toHaveReturnedWith(value)`           | Medium     | Returned specific value                  |
| `toHaveLastReturnedWith(value)`       | Medium     | Last return value                        |
| `toHaveNthReturnedWith(n, value)`     | Medium     | Nth return value                         |

---

## P3 (Nice-to-have)

| Matcher                           | Difficulty | Notes                |
| --------------------------------- | ---------- | -------------------- |
| `expect.arrayContaining(array)`   | Medium     | Array subset match   |
| `expect.objectContaining(object)` | Medium     | Object partial match |
| `expect.not.arrayContaining`      | Medium     | Negation             |
| `expect.not.objectContaining`     | Medium     | Negation             |
| `expect.not.stringContaining`     | Low        | Negation             |
| `expect.not.stringMatching`       | Low        | Negation             |
| `expect.not.arrayOf`              | Medium     | Negation             |

---

## P4 (Complex, high-effort)

| Feature                                                          | Effort    | Notes                                               |
| ---------------------------------------------------------------- | --------- | --------------------------------------------------- |
| Snapshot testing (`.toMatchSnapshot` / `.toMatchInlineSnapshot`) | 1–2 weeks | Needs file system, diffing, update on first failure |
| `expect.extend(matchers)`                                        | Medium    | Custom matcher registration                         |
| `expect.addEqualityTesters(testers)`                             | Medium    | Custom equality functions                           |
| `expect.hasAssertions()`                                         | Low       | Track assertion count                               |
| `expect.assertions(n)`                                           | Low       | Track exact count                                   |

---

## Mock Matchers (Missing)

| Matcher                           | Difficulty | Notes                          |
| --------------------------------- | ---------- | ------------------------------ |
| `toHaveReturned()`                | Low        | At least one successful return |
| `toHaveReturnedTimes(n)`          | Low        | Returned exactly n times       |
| `toHaveReturnedWith(value)`       | Low        | Returned specific value        |
| `toHaveLastReturnedWith(value)`   | Low        | Last return matched value      |
| `toHaveNthReturnedWith(n, value)` | Low        | Nth return matched value       |

> Note: Current mock matchers use `UnknownFunction` type; updating to Jest's `Mock` type would require `@jest/types` dependency (which conflicts with the "zero external deps" goal).

---

## Implementation Status

- **Value matchers:** 4 original + 5 P0 = 9 total implemented
- **Mock matchers:** 4 implemented (`toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, `toHaveBeenLastCalledWith`, `lastCall`, `not.toHaveBeenCalled()`)
- **Top-level helpers:** `mocked()` and `expect()` exported
- **Type system:** Full type guards, overloads, and `.not` negation support
- **No external dependencies** — only `node:test` and `node:assert`
- **Test coverage:** 65+ unit tests passing, ESLint clean, TypeScript strict mode
