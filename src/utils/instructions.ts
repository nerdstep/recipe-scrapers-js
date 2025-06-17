import { splitToList } from './parsing'

/**
 * List of possible headings to remove from instructions.
 */
const INSTRUCTION_HEADINGS = [
  'Preparation',
  'Directions',
  'Instructions',
  'Method',
  'Steps',
]

/**
 * Removes any heading from the start of the instructions string.
 */
export function removeInstructionHeading(value: string) {
  for (const heading of INSTRUCTION_HEADINGS) {
    const regex = new RegExp(`^\\s*${heading}\\s*:?\\s*`, 'i')
    if (regex.test(value)) {
      return value.replace(regex, '')
    }
  }
  return value
}

/**
 * Splits a recipe instructions string into an array of steps.
 * Removes known headings and trims whitespace.
 */
export function splitInstructions(value: string) {
  if (!value) return []

  const cleaned = removeInstructionHeading(value).trim()

  // Split on double newlines or paragraph breaks
  let steps = splitToList(cleaned, /\n\s*\n+/)

  // If only one step, try splitting on sentence boundaries as fallback
  if (steps.length === 1) {
    steps = splitToList(cleaned, /(?<=\.)\s+(?=[A-Z])/)
  }

  return steps
}
