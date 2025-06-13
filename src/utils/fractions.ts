const FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 0.25,
  '¾': 0.75,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

/**
 * Extracts fractional values from strings, handling unicode fractions
 * and mixed numbers.
 */
export function parseFraction(value: string): number {
  const fractionText = value.trim()

  // Handling mixed numbers with unicode fractions e.g., '1⅔'
  for (const [unicodeFraction, fractionPart] of Object.entries(FRACTIONS)) {
    if (fractionText.includes(unicodeFraction)) {
      const [wholeNumberPart] = fractionText.split(unicodeFraction)
      const wholeNumber = Number.parseFloat(wholeNumberPart ?? '0')
      return wholeNumber + fractionPart
    }
  }

  if (fractionText in FRACTIONS) {
    return FRACTIONS[fractionText]
  }

  const numericValue = Number.parseFloat(fractionText)

  if (!Number.isNaN(numericValue)) {
    return numericValue
  }

  if (fractionText.includes(' ') && fractionText.includes('/')) {
    const [wholePart, fractionalPart] = fractionText.split(' ', 2)
    const [numerator, denominator] = fractionalPart.split('/')
    return (
      Number.parseFloat(wholePart) +
      Number.parseFloat(numerator) / Number.parseFloat(denominator)
    )
  }

  if (fractionText.includes('/')) {
    const [numerator, denominator] = fractionText.split('/')
    return Number.parseFloat(numerator) / Number.parseFloat(denominator)
  }

  throw new Error(`Unrecognized fraction format: ${fractionText}`)
}
