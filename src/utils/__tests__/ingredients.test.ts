import { describe, expect, it } from 'bun:test'
import * as cheerio from 'cheerio'
import {
  bestMatch,
  groupIngredients,
  ingredientsToObject,
  scoreSentenceSimilarity,
} from '../ingredients'

describe('ingredientsToObject', () => {
  it('should convert ingredient list to array', () => {
    const ingredientsList = new Set(['flour', 'sugar', 'eggs'])
    const result = ingredientsToObject(ingredientsList)
    expect(result).toEqual(['flour', 'sugar', 'eggs'])
  })

  it('should convert ingredient group to object', () => {
    const ingredientsGroup = new Map([
      ['dry', new Set(['flour', 'sugar'])],
      ['wet', new Set(['eggs', 'milk'])],
    ])
    const result = ingredientsToObject(ingredientsGroup)
    expect(result).toEqual({
      dry: ['flour', 'sugar'],
      wet: ['eggs', 'milk'],
    })
  })

  it('should throw error for invalid ingredient type', () => {
    const invalidIngredients = ['flour', 'sugar']

    // @ts-expect-error
    expect(() => ingredientsToObject(invalidIngredients)).toThrow(
      'Invalid ingredients type',
    )
  })
})

describe('scoreSentenceSimilarity', () => {
  it('returns 1 for exact match', () => {
    expect(
      scoreSentenceSimilarity('¼ cup maple syrup', '¼ cup maple syrup'),
    ).toBe(1.0)
  })

  it('should return 0 for strings shorter than 2 characters', () => {
    expect(scoreSentenceSimilarity('a', 'hello')).toBe(0)
    expect(scoreSentenceSimilarity('hello', 'b')).toBe(0)
  })

  it("returns 0 when there's no match", () => {
    expect(scoreSentenceSimilarity('a', '4 sprig fresh thyme')).toBe(0.0)
    expect(scoreSentenceSimilarity('4 sprig fresh thyme', '')).toBe(0.0)
  })

  it('handles special characters', () => {
    expect(scoreSentenceSimilarity('!@#$%^', '*&^%$#')).toBe(0.0)
  })

  it('scores numerical strings correctly', () => {
    expect(scoreSentenceSimilarity('123', '1234')).toBe(0.8)
  })

  it('is close for similar but not exact', () => {
    const result = scoreSentenceSimilarity('16oz firm tofu', '16 oz firm tofu')
    expect(result).toBeCloseTo(0.8888888888888888, 2)
  })

  it('returns 0 when first string is empty', () => {
    expect(scoreSentenceSimilarity('', 'anything here')).toBe(0.0)
  })
})

describe('bestMatch', () => {
  it('finds exact match', () => {
    const targets = [
      '¼ cup vegan mayonnaise',
      'apple cider vinegar',
      '¼ tsp salt',
      '1 cup shredded red cabbage',
    ]
    expect(bestMatch('¼ cup vegan mayonnaise', targets)).toBe(
      '¼ cup vegan mayonnaise',
    )
  })

  it('should return the best matching string', () => {
    const testString = '1 cup flour'
    const targetStrings = ['2 cups sugar', '1 cup all-purpose flour', '3 eggs']
    const result = bestMatch(testString, targetStrings)
    expect(result).toBe('1 cup all-purpose flour')
  })

  it('selects the closest non-exact match', () => {
    const targets = [
      'apple cider vinegar',
      '¼ tsp salt',
      '1 cup shredded red cabbage',
      '5 large soft tortilla',
    ]
    expect(bestMatch('large tortilla', targets)).toBe('5 large soft tortilla')
  })

  it('should return first string when all have equal scores', () => {
    const testString = 'xyz'
    const targetStrings = ['abc', 'def', 'ghi']
    const result = bestMatch(testString, targetStrings)
    expect(result).toBe('abc')
  })

  it('handles singular vs plural', () => {
    const targets = ['2 medium tomato', '½ head butter lettuce', '1 carrot']
    expect(bestMatch('tomato', targets)).toBe('2 medium tomato')
  })

  it("doesn't return the query when it's not in targets", () => {
    const targets = [
      '¼ cup vegan mayonnaise',
      'apple cider vinegar',
      '¼ tsp salt',
    ]
    expect(bestMatch('¼ cup maple syrup', targets)).not.toBe(
      '¼ cup maple syrup',
    )
  })

  it('throws an error for empty target list', () => {
    expect(() => bestMatch('any string', [])).toThrow()
  })
})

describe('findSelectors', () => {
  it('should prioritize custom selectors over defaults', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">WPRM Group</h4>
        <div class="wprm-recipe-ingredient">WPRM ingredient</div>
        <h3 class="custom-heading">Custom Group</h3>
        <li class="custom-ingredient">Custom ingredient</li>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['Custom ingredient'])

    // Should use custom selectors even when WPRM selectors exist
    const result = groupIngredients(
      $,
      ingredientsList,
      '.custom-heading',
      '.custom-ingredient',
    )

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Custom Group')).toBe(true)
    expect(groupedResult.has('WPRM Group')).toBe(false)
  })
})

describe('groupIngredients', () => {
  it('should return a Set when no grouping selectors are found', () => {
    const $ = cheerio.load('<div></div>')
    const ingredientsList = new Set(['flour', 'sugar', 'eggs'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Set)
    expect(result).toEqual(ingredientsList)
  })

  it('should return a Set when selectors are provided but not found in DOM', () => {
    const $ = cheerio.load('<div></div>')
    const ingredientsList = new Set(['flour', 'sugar', 'eggs'])
    const result = groupIngredients(
      $,
      ingredientsList,
      '.heading',
      '.ingredient',
    )

    expect(result).toBeInstanceOf(Set)
    expect(result).toEqual(ingredientsList)
  })

  it('should group ingredients with WPRM selectors', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">Dry Ingredients</h4>
        <div class="wprm-recipe-ingredient">2 cups flour</div>
        <div class="wprm-recipe-ingredient">1 cup sugar</div>
        <h4 class="wprm-recipe-group-name">Wet Ingredients</h4>
        <div class="wprm-recipe-ingredient">2 eggs</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['2 cups flour', '1 cup sugar', '2 eggs'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Dry Ingredients')).toBe(true)
    expect(groupedResult.has('Wet Ingredients')).toBe(true)

    const dryIngredients = groupedResult.get('Dry Ingredients')
    const wetIngredients = groupedResult.get('Wet Ingredients')

    if (dryIngredients) {
      expect(Array.from(dryIngredients)).toContain('2 cups flour')
      expect(Array.from(dryIngredients)).toContain('1 cup sugar')
    }

    if (wetIngredients) {
      expect(Array.from(wetIngredients)).toContain('2 eggs')
    }
  })

  it('should use custom selectors when provided', () => {
    const html = `
      <div>
        <h3 class="custom-heading">Custom Group</h3>
        <li class="custom-ingredient">ingredient 1</li>
        <li class="custom-ingredient">ingredient 2</li>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['ingredient 1', 'ingredient 2'])
    const result = groupIngredients(
      $,
      ingredientsList,
      '.custom-heading',
      '.custom-ingredient',
    )

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Custom Group')).toBe(true)

    const customGroup = groupedResult.get('Custom Group')
    if (customGroup) {
      expect(Array.from(customGroup)).toEqual(['ingredient 1', 'ingredient 2'])
    }
  })

  it('should throw error when ingredient count mismatch', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">Group</h4>
        <div class="wprm-recipe-ingredient">ingredient 1</div>
      </div>
    `
    const $ = cheerio.load(html)
    // More ingredients than found
    const ingredientsList = new Set(['ingredient 1', 'ingredient 2'])

    expect(() => groupIngredients($, ingredientsList)).toThrow(
      'Found 1 grouped ingredients but was expecting to find 2',
    )
  })

  it('should use default heading when heading text is empty', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name"></h4>
        <div class="wprm-recipe-ingredient">ingredient 1</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['ingredient 1'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Ingredients')).toBe(true)

    const defaultGroup = groupedResult.get('Ingredients')

    if (defaultGroup) {
      expect(Array.from(defaultGroup)).toContain('ingredient 1')
    }
  })

  it('should handle ingredients without preceding heading', () => {
    const html = `
      <div>
        <div class="wprm-recipe-ingredient">ingredient 1</div>
        <h4 class="wprm-recipe-group-name">Group 1</h4>
        <div class="wprm-recipe-ingredient">ingredient 2</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['ingredient 1', 'ingredient 2'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result
    // Default heading for first ingredient
    expect(groupedResult.has('Ingredients')).toBe(true)
    expect(groupedResult.has('Group 1')).toBe(true)
  })

  it('should handle multiple ingredients under same heading', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">Vegetables</h4>
        <div class="wprm-recipe-ingredient">2 carrots, diced</div>
        <div class="wprm-recipe-ingredient">1 onion, chopped</div>
        <div class="wprm-recipe-ingredient">3 celery stalks</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set([
      '2 carrots, diced',
      '1 onion, chopped',
      '3 celery stalks',
    ])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Vegetables')).toBe(true)

    const vegetables = groupedResult.get('Vegetables')

    if (vegetables) {
      expect(vegetables.size).toBe(3)
      expect(vegetables).toEqual(ingredientsList)
    }
  })

  it('should handle fuzzy matching for similar ingredient text', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">Flour</h4>
        <div class="wprm-recipe-ingredient">2 cups all purpose flour</div>
      </div>
    `
    const $ = cheerio.load(html)
    // Note the hyphen difference
    const ingredientsList = new Set(['2 cups all-purpose flour'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Flour')).toBe(true)

    const flour = groupedResult.get('Flour')
    if (flour) {
      expect(Array.from(flour)).toContain('2 cups all-purpose flour')
    }
  })

  it('should handle nested HTML structure', () => {
    const html = `
      <div class="recipe-section">
        <div class="group-wrapper">
          <h4 class="wprm-recipe-group-name">Sauce</h4>
          <ul>
            <li class="wprm-recipe-ingredient">1 tbsp soy sauce</li>
            <li class="wprm-recipe-ingredient">2 tsp sesame oil</li>
          </ul>
        </div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['1 tbsp soy sauce', '2 tsp sesame oil'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Sauce')).toBe(true)
  })

  it('should handle empty ingredient text gracefully', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name">Group</h4>
        <div class="wprm-recipe-ingredient"></div>
        <div class="wprm-recipe-ingredient">real ingredient</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['real ingredient'])

    // Should handle the empty ingredient element without crashing
    expect(() => groupIngredients($, ingredientsList)).not.toThrow()
  })

  it('should handle multiple empty headings with same default name', () => {
    const html = `
      <div>
        <h4 class="wprm-recipe-group-name"></h4>
        <div class="wprm-recipe-ingredient">ingredient 1</div>
        <h4 class="wprm-recipe-group-name">   </h4>
        <div class="wprm-recipe-ingredient">ingredient 2</div>
      </div>
    `
    const $ = cheerio.load(html)
    const ingredientsList = new Set(['ingredient 1', 'ingredient 2'])
    const result = groupIngredients($, ingredientsList)

    expect(result).toBeInstanceOf(Map)
    const groupedResult = result as Map<string, Set<string>>
    expect(groupedResult.has('Ingredients')).toBe(true)

    const defaultGroup = groupedResult.get('Ingredients')

    if (defaultGroup) {
      expect(defaultGroup.size).toBe(2)
    }
  })

  it('should handle grouping under both a default heading and a found heading', () => {
    const html = `
      <div class="ingredients">
        <h2>Ingredients</h2>
        <ul>
          <li>ingredient 1</li>
        </ul>
        <h3>Heading</h3>
        <ul>
          <li>ingredient 2</li>
        </ul>
      </div>
    `

    const $ = cheerio.load(html)
    const ingredientsList = new Set(['ingredient 1', 'ingredient 2'])
    const groupedResult = groupIngredients(
      $,
      ingredientsList,
      '.ingredients h3',
      '.ingredients li',
    )

    expect(ingredientsToObject(groupedResult)).toEqual({
      Ingredients: ['ingredient 1'],
      Heading: ['ingredient 2'],
    })
  })
})
