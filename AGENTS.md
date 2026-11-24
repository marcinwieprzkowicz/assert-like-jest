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
src/matchers/objects.ts  # value matchers: toBe, toEqual, toStrictEqual, toThrow
src/matchers/mocks.ts    # mock matchers: toHaveBeenCalledXxx, lastCall, not
src/is-mock-function.ts  # runtime type guard for Node.js mock.fn() output
src/types.ts             # shared type aliases (UnknownFunction, LooseMockFunction, etc.)
```

- `expect(value)` is typed with overloads: `Mock<F>` → `MockMatchers`, plain `unknown` → both `ValueMatchers` + `MockMatchers` (functions without `mock` property get the union), everything else → `ValueMatchers`.
- `isMockFunction()` checks the runtime `mock.calls` array — matchers throw `TypeError` if the guard fails rather than silently crashing.
- `.not` support is partial: mock matchers have `.not.toHaveBeenCalled()`. Value matchers do not yet support negation.

## Conventions & gotchas

- **No external deps** — only `node:test` and `node:assert` are allowed.
- **TypeScript 6.0** with `isolatedModules`, `verbatimModuleSyntax`, `rewriteRelativeImportExtensions: true`. All relative imports must keep `.ts` extension.
- **ESLint 10** uses `strictTypeChecked` from `typescript-eslint` with these overrides:
  - `@typescript-eslint/no-explicit-any` → `warn` (not error)
  - `@typescript-eslint/no-use-before-define` → `functions: false` (forward refs are common)
  - `@typescript-eslint/no-floating-promises` → `off` (matchers are sync)
  - `args: "after-used"` (unused trailing params OK if earlier ones are used)
- Test files use Node's native test runner with `describe`/`it` — the test runner provides these, no imports needed.
- Output goes to `dist/` (in `.gitignore`); the package exports `dist/assertions.js` and `dist/assertions.d.ts`.
