export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Extracts the host name from a URL string.
 */
export function getHostName(value: string) {
  try {
    const url = new URL(value)
    return url.host
  } catch {
    throw new Error(`Invalid URL: ${value}`)
  }
}
