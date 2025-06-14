import { describe, expect, it } from 'bun:test'
import { splitInstructions } from '../instructions'

describe('splitInstructions', () => {
  it('removes heading "Preparation" with optional colon', () => {
    const input = 'Preparation: Step one.\n\nStep two.'
    const output = splitInstructions(input)
    expect(output).toEqual(['Step one.', 'Step two.'])
  })

  it('leaves string without known heading untouched', () => {
    const input = 'NoHeadingHere Step. Another step.'
    const output = splitInstructions(input)
    // single paragraph, should split on sentence boundary
    expect(output).toEqual(['NoHeadingHere Step.', 'Another step.'])
  })

  it('splits on double newlines into steps', () => {
    const input = 'First step.\n\nSecond step.\n\nThird step.'
    expect(splitInstructions(input)).toEqual([
      'First step.',
      'Second step.',
      'Third step.',
    ])
  })

  it('splits single paragraph into sentences when only one block', () => {
    const input = 'Cook noodles. Add sauce. Serve immediately.'
    expect(splitInstructions(input)).toEqual([
      'Cook noodles.',
      'Add sauce.',
      'Serve immediately.',
    ])
  })

  it('trims excess whitespace and collapses internal newlines', () => {
    const input = '   Preparation   \n   Mix  ingredients\nand stir.   '
    expect(splitInstructions(input)).toEqual(['Mix ingredients and stir.'])
  })

  it('returns empty array for empty input', () => {
    expect(splitInstructions('')).toEqual([])
  })
})
