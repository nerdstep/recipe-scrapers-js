const SERVE_REGEX_NUMBER = /(?:\D*(?<items>\d+(?:\.\d*)?)\D*)/
const SERVE_REGEX_NUMBER2 = /\D*(?<items>\d+(\.\d*)?)?\D*/

const SERVE_REGEX_ITEMS =
  /\bsandwiches\b|\btacquitos\b|\bmakes\b|\bcups\b|\bappetizer\b|\bporzioni\b|\bcookies\b|\b(large |small )?buns\b/gi

const SERVE_REGEX_TO = /\d+(\s+to\s+|-)\d+/gi

const RECIPE_YIELD_TYPES: [string, string][] = [
  ['dozen', 'dozen'],
  ['batch', 'batches'],
  ['cake', 'cakes'],
  ['sandwich', 'sandwiches'],
  ['bun', 'buns'],
  ['cookie', 'cookies'],
  ['muffin', 'muffins'],
  ['cupcake', 'cupcakes'],
  ['loaf', 'loaves'],
  ['pie', 'pies'],
  ['cup', 'cups'],
  ['pint', 'pints'],
  ['gallon', 'gallons'],
  ['ounce', 'ounces'],
  ['pound', 'pounds'],
  ['gram', 'grams'],
  ['liter', 'liters'],
  ['piece', 'pieces'],
  ['layer', 'layers'],
  ['scoop', 'scoops'],
  ['bar', 'bars'],
  ['patty', 'patties'],
  ['hamburger bun', 'hamburger buns'],
  ['pancake', 'pancakes'],
  ['item', 'items'],
  // ... add more types as needed, in [singular, plural] format ...
]

/**
 * Returns a string of servings or items. If the recipe is for a number of
 * items (not servings), it returns "x item(s)" where x is the quantity.
 * This function handles cases where the yield is in dozens,
 * such as "4 dozen cookies", returning "4 dozen" instead of "4 servings".
 * Additionally accommodates yields specified in batches
 * (e.g., "2 batches of brownies"), returning the yield as stated.
 *
 * @param value The yield string from the recipe
 * @returns The number of servings, items, dozen, batches, etc...
 */
export function parseYields(value: string): string {
  let yieldText = value.trim()

  console.log({ yieldText })

  if (!yieldText) {
    throw new Error('Cannot extract yield information from empty string')
  }

  // Handle range formats like "4-6 servings" or "4 to 6 servings"
  const toMatch = yieldText.match(SERVE_REGEX_TO)

  if (toMatch) {
    console.log('Found range:', toMatch[0])
    const parts = yieldText.split(toMatch[0])

    if (parts.length > 1) {
      yieldText = parts[1]
    }
  }

  // Find all numbers in the text
  const allNumbers = yieldText.match(/\d+(?:\.\d+)?/g)
  console.log('All numbers found:', allNumbers)

  // Default to the last number found, or 0
  const matched = allNumbers ? allNumbers[allNumbers.length - 1] : '0'
  console.log('Selected number:', matched) // Debug log

  const numberMatch = yieldText.match(SERVE_REGEX_NUMBER)
  //const matched = numberMatch?.groups?.items ?? '0'
  const yieldTextLower = yieldText.toLowerCase()

  console.log({ numberMatch, matched, yieldTextLower })

  let bestMatch: string | null = null
  let bestMatchLength = 0

  // Find the best matching yield type
  for (const [singular, plural] of RECIPE_YIELD_TYPES) {
    if (yieldTextLower.includes(singular) || yieldTextLower.includes(plural)) {
      const matchLength = yieldTextLower.includes(singular)
        ? singular.length
        : plural.length
      if (matchLength > bestMatchLength) {
        bestMatchLength = matchLength
        const count = Number.parseInt(matched)
        bestMatch = `${matched} ${count === 1 ? singular : plural}`
      }
    }
  }

  if (bestMatch) {
    return bestMatch
  }

  // Default handling for items vs servings
  const count = Number.parseFloat(matched)
  const plural = count > 1 || count === 0 ? 's' : ''

  if (SERVE_REGEX_ITEMS.test(yieldText)) {
    return `${matched} item${plural}`
  }

  return `${matched} serving${plural}`
}

export function parseYields2(element: string): string {
  if (!element) throw new Error('Element is required')

  let serveText = element

  if (SERVE_REGEX_TO.test(serveText)) {
    const splitMatch = serveText.match(SERVE_REGEX_TO)
    if (splitMatch && splitMatch.index !== undefined) {
      serveText = serveText
        .slice(splitMatch.index + splitMatch[0].length)
        .trim()
    }
  }

  const match = serveText.match(SERVE_REGEX_NUMBER)
  const matched = match?.groups?.items || '0'

  const serveTextLower = serveText.toLowerCase()
  let bestMatch: string | null = null
  let bestMatchLength = 0

  for (const [singular, plural] of RECIPE_YIELD_TYPES) {
    if (serveTextLower.includes(singular) || serveTextLower.includes(plural)) {
      const matchLength = serveTextLower.includes(singular)
        ? singular.length
        : plural.length
      if (matchLength > bestMatchLength) {
        bestMatchLength = matchLength
        bestMatch = `${matched} ${Number.parseFloat(matched) === 1 ? singular : plural}`
      }
    }
  }

  if (bestMatch) return bestMatch

  const plural =
    Number.parseFloat(matched) > 1 || Number.parseFloat(matched) === 0
      ? 's'
      : ''
  if (SERVE_REGEX_ITEMS.test(serveText)) {
    return `${matched} item${plural}`
  }

  return `${matched} serving${plural}`
}
