// Minimal typing for bun's test runner so the typecheck doesn't need full Bun globals
// (full @types/bun overrides `fetch` and breaks the app's typings).
declare module "bun:test" {
  type Fn = () => unknown | Promise<unknown>;
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: Fn, timeout?: number): void;
  export const it: typeof test;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function expect(value: unknown): any;
}
