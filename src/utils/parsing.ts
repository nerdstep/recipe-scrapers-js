/*******************************************************************************
 * Utility functions for common parsing tasks
 ******************************************************************************/
import { parse as parseDuration, toSeconds } from 'iso8601-duration'

export function normalizeString(str: string | null | undefined): string {
  return str?.trim().replace(/\s+/g, ' ') ?? ''
}

export function splitToList(value: string, separator: string): string[] {
  if (!value) return []

  const items: string[] = []

  for (const item of value.split(separator)) {
    const str = normalizeString(item)

    if (str) {
      items.push(str)
    }
  }

  return items
}

/**
 * @TODO Implement [Temporal.Duration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration) once it lands.
 */
export function parseMinutes(value: string) {
  const duration = parseDuration(value)
  const totalSeconds = toSeconds(duration)
  return Math.round(totalSeconds / 60)
}
