import { describe, expect, it } from 'bun:test'
import { parseYields, parseYields2 } from '../parse-yields'

describe.skip('parseYields', () => {
  it('should throw for empty input', () => {
    expect(() => parseYields('')).toThrow()
  })

  it('should handle single serving yield', () => {
    expect(parseYields('1 serving')).toBe('1 serving')
  })

  it('should handle plural servings yield', () => {
    expect(parseYields('4 servings')).toBe('4 servings')
  })

  it('should handle item yields', () => {
    expect(parseYields('2 items')).toBe('2 items')
  })

  it('should handle range yields', () => {
    expect(parseYields('4-6 servings')).toBe('4 servings')
  })

  it('1 ', () => {
    expect(parseYields('5 cups (about 120 to 160 crackers)"')).toBe(
      '160 servings',
    )
  })

  it('2', () => {
    expect(parseYields2('5 cups (about 120 to 160 crackers)"')).toBe(
      '160 servings',
    )
  })
})
