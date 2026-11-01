export function isFunction(
  value: unknown,
): value is (...args: unknown[]) => unknown {
  if (typeof value !== "function") {
    return false;
  }

  const tag = Object.prototype.toString.call(value);
  return (
    tag === "[object Function]" ||
    tag === "[object AsyncFunction]" ||
    tag === "[object GeneratorFunction]"
  );
}
