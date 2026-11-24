# Jest API Gap Analysis

**Date:** 2026-11-24
**Target:** Jest 30.5 (latest)

> Summary: The `assert-like-jest` project currently implements **4** value matchers and **4** mock matchers,
> all with full TypeScript support and `.not` negation. Full parity would still require ~30+
> additional matchers.

---

## P0 Implemented (High-impact, low-effort)

| Matcher                     | Status             | Notes |
| --------------------------- | ------------------ | ----- |
| `toBeNull()`                | ❌ Not implemented |
| `toBeDefined()`             | ❌ Not implemented |
| `toHaveLength(n)`           | ❌ Not implemented |
| `toContainEqual(item)`      | ❌ Not implemented |
| `toBeInstanceOf(Class)`     | ❌ Not implemented |
| `not.toBeNull()`            | ❌ Not implemented |
| `not.toBeDefined()`         | ❌ Not implemented |
| `not.toHaveLength(n)`       | ❌ Not implemented |
| `not.toContainEqual(item)`  | ❌ Not implemented |
| `not.toBeInstanceOf(Class)` | ❌ Not implemented |

---

## P1 Implemented (High-impact, medium-effort)

| Matcher           | Status             | Notes                |
| ----------------- | ------------------ | -------------------- |
| `toMatch()`       | ❌ Not implemented | Regex/string match   |
| `toMatchObject()` | ❌ Not implemented | Partial object match |
| `toThrow()`       | ✅ Implemented     | Error throwing check |

---

## P2 Implemented (Medium-impact)

| Matcher                          | Status             | Notes                            |
| -------------------------------- | ------------------ | -------------------------------- |
| `.resolves`                      | ❌ Not implemented | Unwrap promise resolutions       |
| `.rejects`                       | ❌ Not implemented | Unwrap promise rejections        |
| `toHaveBeenCalledWith()`         | ✅ Implemented     | Mock called with given arguments |
| `toHaveBeenNthCalledWith(n,...)` | ❌ Not implemented | Nth call args check              |
| `toHaveReturnedTimes(n)`         | ❌ Not implemented | Returned exactly n times         |
| `toHaveReturnedWith(value)`      | ❌ Not implemented | Returned specific value          |
| `toHaveLastReturnedWith(value)`  | ❌ Not implemented | Last return value                |
| `toHaveNthReturnedWith(n, val)`  | ❌ Not implemented | Nth return value                 |

---

## P3 Implemented (Nice-to-have)

| Matcher                           | Status             | Notes                |
| --------------------------------- | ------------------ | -------------------- |
| `expect.arrayContaining(array)`   | ❌ Not implemented | Array subset match   |
| `expect.objectContaining(object)` | ❌ Not implemented | Object partial match |
| `expect.not.arrayContaining`      | ❌ Not implemented | Negation             |
| `expect.not.objectContaining`     | ❌ Not implemented | Negation             |
| `expect.not.stringContaining`     | ❌ Not implemented | Negation             |
| `expect.not.stringMatching`       | ❌ Not implemented | Negation             |
| `expect.not.arrayOf`              | ❌ Not implemented | Negation             |

---

## P4 (Complex, high-effort)

| Feature                                                          | Effort    | Status | Notes                                               |
| ---------------------------------------------------------------- | --------- | ------ | --------------------------------------------------- |
| Snapshot testing (`.toMatchSnapshot` / `.toMatchInlineSnapshot`) | 1–2 weeks | ❌     | Needs file system, diffing, update on first failure |
| `expect.extend(matchers)`                                        | Medium    | ❌     | Custom matcher registration                         |
| `expect.addEqualityTesters(testers)`                             | Medium    | ❌     | Custom equality functions                           |
| `expect.hasAssertions()`                                         | Low       | ❌     | Track assertion count                               |
| `expect.assertions(n)`                                           | Low       | ❌     | Track exact count                                   |

---

## Mock Matchers (Missing)

| Matcher                           | Difficulty | Status | Notes                          |
| --------------------------------- | ---------- | ------ | ------------------------------ |
| `toHaveReturned()`                | Low        | ❌     | At least one successful return |
| `toHaveReturnedTimes(n)`          | Low        | ❌     | Returned exactly n times       |
| `toHaveReturnedWith(value)`       | Low        | ❌     | Returned specific value        |
| `toHaveLastReturnedWith(value)`   | Low        | ❌     | Last return matched value      |
| `toHaveNthReturnedWith(n, value)` | Low        | ❌     | Nth return matched value       |

> Note: Current mock matchers use `UnknownFunction` type; updating to Jest's `Mock` type would require `@jest/types` dependency (which conflicts with the "zero external deps" goal).

---

## Implementation Status

- **Value matchers:** 4 implemented (`toBe`, `toEqual`, `toStrictEqual`, `toThrow`)
- **Mock matchers:** 4 implemented (`toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, `toHaveBeenLastCalledWith`, `lastCall`, `not.toHaveBeenCalled()`)
- **Top-level helpers:** `mocked()` and `expect()` exported
- **Type system:** Full type guards, overloads, and negation support for mock matchers
- **No external dependencies** — only `node:test` and `node:assert`
- **Test coverage:** Existing tests pass (TypeScript, ESLint, Node tests)
