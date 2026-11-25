# AGENTS.md — assert-like-jest

## Project summary

A Jest-compatible test matcher library using **only** Node.js native modules
(`node:test`, `node:assert`). No external dependencies. TypeScript 6, strict mode.

## Commands (exact)

```bash
npm run build          # clean + compile (the full release pipeline)
npm test               # types + static + unit (parallel)
npm run test:unit      # node --test --experimental-strip-types 'src/**/*.test.ts'
npm run test:types     # tsc --noEmit
npm run test:static    # eslint ./src
```

`npm test` runs all three in parallel — they should all pass independently.

## Architecture

```
src/assertions.ts        # exports: expect(), mocked()
src/matchers/objects.ts  # value matchers: toBe, toEqual, toStrictEqual, toThrow + P0 (toBeNull, toBeDefined, toBeUndefined, toHaveLength, toContainEqual, toBeInstanceOf)
src/matchers/mocks.ts    # mock matchers: toHaveBeenCalled, toHaveBeenCalledTimes, toHaveBeenCalledWith, toHaveBeenLastCalledWith, lastCall, not
src/is-mock-function.ts  # runtime type guard for Node.js mock.fn() output
src/types.ts             # shared type aliases (UnknownFunction, LooseMockFunction, etc.)
src/utils/is-function.ts # tag-based function check (rejects function-like imposters)
src/utils/format.ts      # safe failure-message formatting via util.inspect
```

- `expect(value)` is typed with overloads: `Mock<F>` → `MockMatchers<F> & ValueMatchers`, everything else → `MockMatchers<LooseMockFunction> & ValueMatchers` — a unified Jest-style surface where every input gets both matcher sets; mock matchers throw a clear `TypeError` when called on a non-mock.
- `isMockFunction()` checks the runtime `mock.calls` array — matchers throw `TypeError` if the guard fails rather than silently crashing. The check reads `fn.mock` via property access (not the `in` operator): current Node.js serves `mock` through an exotic `[[Get]]` that `in` cannot see.
- `.not` support is partial: P0 value matchers (`toBeNull`, `toBeDefined`, `toBeUndefined`, `toHaveLength`, `toContainEqual`, `toBeInstanceOf`) and `toHaveBeenCalled()` support negation. `toBe`, `toEqual`, `toStrictEqual`, and `toThrow` do not yet.

## Conventions & gotchas

- **No external deps** — only `node:test` and `node:assert` are allowed.
- **TypeScript 6.0** with `isolatedModules`, `verbatimModuleSyntax`, `rewriteRelativeImportExtensions: true`. All relative imports must keep `.ts` extension.
- **ESLint 10** uses `strictTypeChecked` from `typescript-eslint` with these overrides:
  - `@typescript-eslint/no-explicit-any` → `warn` (not error)
  - `@typescript-eslint/no-use-before-define` → `functions: false` (forward refs are common)
  - `@typescript-eslint/no-floating-promises` → `off` (matchers are sync)
  - `@typescript-eslint/no-unsafe-function-type` → `off` only for `types.ts`, `matchers/objects.ts`, and `matchers/objects.test.ts` (`Function` types constructor parameters)
  - `args: "after-used"` with `argsIgnorePattern: "^_"` (unused trailing params OK; underscore-prefixed params skipped)
- Test files use Node's native test runner with `describe`/`it` — both must be imported from `node:test` (they are not globals).
- Output goes to `dist/` (in `.gitignore`); the package exports `dist/assertions.js` and `dist/assertions.d.ts`.
