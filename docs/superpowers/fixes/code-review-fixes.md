# Code Review Fixes — feat/implement-p0

Source: code review of `d6eb905..5a9692b` (verdict: not ready to merge).
Method: TDD (red-green-refactor) for behavior changes; refactor keeps tests green.

## Review findings — ALL FIXED

- [x] 1. CRITICAL: `not.toBeDefined()` inverted — corrected test (watched RED), fixed impl (GREEN)
- [x] 2. `.not.toBeUndefined()` inverted → added positive `toBeUndefined()` + true negation (RED→GREEN)
- [x] 3. Eager `JSON.stringify` crashed passing assertions → `src/utils/format.ts` (`util.inspect`) used by all failure messages incl. `toEqual` and mocks (RED→GREEN)
- [x] 4. Test gaps: `.not.toContainEqual` string branch, `toBeInstanceOf(42)` validation, `toHaveLength` array-like, duplicate test line

## types.ts cleanup

- [x] 5. Deleted 10 dead exports (`ToBe*`, `ToContain*`, `ToHaveOrNotLength`, ...)
- [x] 6. Replaced 5 scrambled `Negated*` types with one flat `NegatedValueMatchers`
- [x] 7. `toThrow(error?: any)` → `AssertPredicate` (lint warning gone)

## Refactor

- [x] 8. Extracted `containsDeep`, `validateConstructor`, `describeValue`, `getLength` — pos/neg bodies now thin
- [x] 9. Constructor validation: two checks, consistent `TypeError`
- [x] 10. Builders annotated with `ValueMatchers` / `NegatedValueMatchers` (single source of truth)
- [x] 11. Method shorthand restored (matches `mocks.ts`)
- [x] 12. `hasLength` doc fixed + honest `{ length: unknown }` predicate

## Config / docs

- [x] 13. `no-unsafe-function-type` scoped to 3 files that use `Function`
- [x] 14. gap-analysis.md: summary, P0 rows, implementation counts, test count
- [x] 15. README.md: matchers table, negation section, TS example, `toEqual` description
- [x] 16. AGENTS.md: `.not` status, overload wording ("union" → intersection), architecture list, eslint overrides, test imports claim

## Discovered during fixes (beyond review) — ALL FIXED

- [x] 17. **CRITICAL pre-existing:** `isMockFunction()` returned false for real `mock.fn()`
      output on Node 26 (`in` operator can't see the exotic `mock` context) — every mock
      matcher was broken in production. Fixed via property access (RED→GREEN).
- [x] 18. Positive `toHaveBeenCalled()` documented in README + plan but never implemented.
      Added with tests (user approved).
- [x] 19. **Zero tests for any mock matcher** → new `src/matchers/mocks.test.ts` (20 tests)
- [x] 20. `expect()` never reached mock matchers' guard TypeErrors (dead code) and the plain-
      function overload promised `MockMatchers & ValueMatchers` at type level but returned
      only value matchers → dispatch now merges both + merged `not` (RED→GREEN).
- [x] 21. eslint `argsIgnorePattern: "^_"` added (underscore convention only covered vars)

## Verification

- [x] `npm test` (types + static + unit) green, pristine output — 117 tests, 1 pre-existing warning
- [x] `npm run build` green

---

# Round 2 — follow-up review (verdict: "With fixes")

## Important

- [x] I1. Failure-path tests for the four original matchers (`toBe`, `toEqual`,
      `toStrictEqual`, `toThrow`) — plan Task 4 cases, all green (regression guards)
- [x] I2. **Unified dispatch (user-approved, Jest/plan parity):** every `expect()`
      input now gets value + mock matchers (single code path, overloads all
      intersections); mock matchers throw the clear TypeError on non-mocks;
      added "unified dispatch" tests (RED→GREEN)

## Minor

- [x] M3. `not.toHaveLength` failing-case test + custom messages on both directions (RED→GREEN)
- [x] M4. Bound constructors accepted in `toBeInstanceOf` (native `instanceof` verified
      empirically; arrow functions still rejected via caught native TypeError → clear message) (RED→GREEN)
- [x] M5. Unimplemented negations throw `Cannot negate matcher "X" yet.` via Proxy on `.not`
      (plan Review Focus row 3) (RED→GREEN)
- [x] M6. BigInt passing test for mocks' `format()` path
- [x] M7. `mocked()` tests (accepts mock, rejects plain function)
- [x] M8. `.ts` extension added to `is-mock-function.ts` import
- [x] M9. Doc nits: AGENTS.md utils list + eslint scope wording + unified overload
      wording; README TS example; gap-analysis `toHaveLength` note + `toHaveBeenCalledWith` row

## Round 2 verification

- [x] `npm test` green — 117 tests, 1 pre-existing warning, tsc clean
- [x] `npm run build` green
