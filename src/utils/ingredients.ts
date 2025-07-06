import type { CheerioAPI } from 'cheerio'
import type {
  IngredientGroup,
  Ingredients,
  IngredientsList,
  List,
  RecipeObject,
} from '@/types/recipe.interface'
import { isString } from '.'
import { normalizeString } from './parsing'

export const DEFAULT_INGREDIENTS_GROUP_NAME = 'Ingredients'

const DEFAULT_GROUPING_SELECTORS = {
  wprm: {
    headingSelectors: [
      '.wprm-recipe-ingredient-group h4',
      '.wprm-recipe-group-name',
    ],
    itemSelectors: ['.wprm-recipe-ingredient', '.wprm-recipe-ingredients li'],
  },
  tasty: {
    headingSelectors: [
      '.tasty-recipes-ingredients-body p strong',
      '.tasty-recipes-ingredients h4',
    ],
    itemSelectors: [
      '.tasty-recipes-ingredients-body ul li',
      '.tasty-recipes-ingredients ul li',
    ],
  },
} as const satisfies Record<
  string,
  { headingSelectors: string[]; itemSelectors: string[] }
>

export function isList(value: unknown): value is List {
  return value instanceof Set && Array.from(value).every(isString)
}

export function isIngredientGroup(value: unknown): value is IngredientGroup {
  return value instanceof Map && Array.from(value.values()).every(isList)
}

export function isIngredients(value: unknown): value is Ingredients {
  return isList(value) || isIngredientGroup(value)
}

export function ingredientsToObject(
  value: Ingredients,
): RecipeObject['ingredients'] {
  if (isList(value)) {
    return Array.from(value)
  }

  if (isIngredientGroup(value)) {
    const obj: Record<string, string[]> = {}

    for (const [group, ingredients] of value.entries()) {
      obj[group] = Array.from(ingredients)
    }
    return obj
  }

  throw new Error('Invalid ingredients type')
}

export function scoreSentenceSimilarity(first: string, second: string): number {
  if (first === second) return 1

  if (first.length < 2 || second.length < 2) return 0

  const bigrams = (s: string) =>
    new Set(Array.from({ length: s.length - 1 }, (_, i) => s.slice(i, i + 2)))

  const firstBigrams = bigrams(first)
  const secondBigrams = bigrams(second)

  const intersectionSize = [...firstBigrams].filter((b) =>
    secondBigrams.has(b),
  ).length

  return (2 * intersectionSize) / (firstBigrams.size + secondBigrams.size)
}

export function bestMatch(testString: string, targetStrings: string[]): string {
  if (targetStrings.length === 0) {
    throw new Error('targetStrings cannot be empty')
  }

  const scores = targetStrings.map((t) =>
    scoreSentenceSimilarity(testString, t),
  )

  let bestIndex = 0
  let bestScore = scores[0]

  for (let i = 1; i < scores.length; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i]
      bestIndex = i
    }
  }

  return targetStrings[bestIndex]
}

function findSelectors(
  $: CheerioAPI,
  initialHeading?: string,
  initialItem?: string,
): [string, string] | null {
  if (initialHeading && initialItem) {
    // Check if the provided selectors actually exist in the DOM
    if ($(initialHeading).length && $(initialItem).length) {
      return [initialHeading, initialItem]
    }
    // If custom selectors are provided but not found, return null
    return null
  }

  const values = Object.values(DEFAULT_GROUPING_SELECTORS)

  for (const { headingSelectors, itemSelectors } of values) {
    for (const heading of headingSelectors) {
      for (const item of itemSelectors) {
        if ($(heading).length && $(item).length) {
          return [heading, item]
        }
      }
    }
  }

  return null
}

/**
 * Groups ingredients based on the provided selectors.
 * If no selectors are provided, it will try to find the best matching
 * selectors from the default grouping selectors.
 *
 * @param $ Cheerio instance
 * @param ingredients Ingredients extracted from plugins, if any
 * @param headingSelector
 * @param itemSelector
 */
export function groupIngredients(
  $: CheerioAPI,
  ingredientsList: IngredientsList,
  headingSelector?: string,
  itemSelector?: string,
): Ingredients {
  const selectors = findSelectors($, headingSelector, itemSelector)

  if (!selectors) {
    return ingredientsList
  }

  const [groupNameSelector, ingredientSelector] = selectors

  const foundIngredients = new Set(
    $(ingredientSelector)
      .toArray()
      .map((el) => $(el).text().trim())
      .filter(Boolean),
  )

  if (foundIngredients.size !== ingredientsList.size) {
    throw new Error(
      `Found ${foundIngredients.size} grouped ingredients but was expecting to find ${ingredientsList.size}.`,
    )
  }

  // Convert ingredients to array for processing
  const ingredients = Array.from(ingredientsList)

  const groupings = new Map<string, Set<string>>()
  let currentHeading: string | null = null

  // iterate in document order over headings & items
  const elements = $(`${groupNameSelector}, ${ingredientSelector}`).toArray()

  for (const el of elements) {
    const $el = $(el)

    if ($el.is(groupNameSelector)) {
      // it's a heading
      const headingText = normalizeString($el.text())
      currentHeading = headingText || DEFAULT_INGREDIENTS_GROUP_NAME

      if (!groupings.has(currentHeading)) {
        groupings.set(currentHeading, new Set())
      }
    } else if ($el.is(ingredientSelector)) {
      // it's an ingredient
      const text = normalizeString($el.text())

      if (!text) continue

      const matched = bestMatch(text, ingredients)
      const heading = currentHeading || DEFAULT_INGREDIENTS_GROUP_NAME

      if (!groupings.has(heading)) {
        groupings.set(heading, new Set())
      }

      groupings.get(heading)?.add(matched)
    }
  }

  return groupings
}
