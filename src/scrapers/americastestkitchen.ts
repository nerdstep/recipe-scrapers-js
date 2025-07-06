import z from 'zod/v4'
import { AbstractScraper } from '@/abstract-scraper'
import type { List, RecipeFields } from '@/types/recipe.interface'
import {
  DEFAULT_INGREDIENTS_GROUP_NAME,
  groupIngredients,
  isList,
} from '@/utils/ingredients'
import { normalizeString } from '@/utils/parsing'

const recipeIngredientItemSchema = z.object({
  fields: z.object({
    qty: z.string(),
    preText: z.string(),
    postText: z.string(),
    measurement: z.string().nullable(),
    pluralIngredient: z.boolean(),
    ingredient: z.object({
      contentType: z.string(),
      fields: z.object({
        title: z.string(),
        pluralTitle: z.string(),
        kind: z.string(),
      }),
    }),
  }),
})

type RecipeIngredientItem = z.infer<typeof recipeIngredientItemSchema>

const recipeIngredientGroupSchema = z.object({
  fields: z.object({
    title: z.string(),
    recipeIngredientItems: z.array(recipeIngredientItemSchema),
  }),
})

const recipeInstructionSchema = z.object({
  fields: z.object({
    content: z.string(),
  }),
})

const recipeDataSchema = z.object({
  totalCookTime: z.number(),
  recipeTimeNote: z.string().optional(),
  ingredientGroups: z.array(recipeIngredientGroupSchema),
  headnote: z.string().optional(),
  instructions: z.array(recipeInstructionSchema),
})

type RecipeData = z.infer<typeof recipeDataSchema>

const pagePropsDataSchema = z.object({
  props: z.object({
    pageProps: z.object({
      data: recipeDataSchema,
    }),
  }),
})

export class AmericasTestKitchen extends AbstractScraper {
  private data: RecipeData | null = null

  static host() {
    return 'americastestkitchen.com'
  }

  extractors = {
    ingredients: this.ingredients.bind(this),
    instructions: this.instructions.bind(this),
    siteName: this.siteName.bind(this),
  }

  protected siteName(): RecipeFields['siteName'] {
    return "America's Test Kitchen"
  }

  protected ingredients(
    prevValue: RecipeFields['ingredients'] | undefined,
  ): RecipeFields['ingredients'] {
    // First try to parse structured data
    // If that fails, try to parse HTML ingredients
    let ingredients = this.parseIngredients()

    if (!ingredients) {
      ingredients = this.parseHtmlIngredients(prevValue)
    }

    if (!ingredients) {
      throw new Error('Failed to extract ingredients')
    }

    return ingredients
  }

  protected instructions(
    prevValue: RecipeFields['instructions'] | undefined,
  ): RecipeFields['instructions'] {
    const data = this.getRecipeData()

    if (!data) {
      if (prevValue) {
        return prevValue
      }
      throw new Error('Failed to extract instructions')
    }

    const { headnote } = data

    let headnoteText = ''

    if (headnote) {
      headnoteText = `Note: ${normalizeString(headnote)}`
    }

    const instructionTexts: string[] = []

    for (const instruction of data.instructions) {
      instructionTexts.push(normalizeString(instruction.fields.content))
    }

    return new Set([headnoteText, ...instructionTexts])
  }

  private parseHtmlIngredients(
    prevValue: RecipeFields['ingredients'] | undefined,
  ): RecipeFields['ingredients'] | null {
    // Use wildcard selectors to handle dynamic class name suffixes
    const headingSelector = '[class*="RecipeIngredientGroups_group"] > span'
    const ingredientSelector = '[class*="RecipeIngredient"] label'

    if (isList(prevValue) && prevValue.size > 0) {
      const result = groupIngredients(
        this.$,
        prevValue,
        headingSelector,
        ingredientSelector,
      )

      return result
    }

    return null
  }

  private getRecipeData(): RecipeData | null {
    if (this.data === null) {
      const jsonElement = this.$('script[type="application/json"]')
      const jsonString = jsonElement.html()

      if (!jsonString) {
        this.logger.warn('Could not find JSON data script tag')
        return null
      }

      try {
        const parsed = pagePropsDataSchema.parse(JSON.parse(jsonString))
        this.data = parsed.props.pageProps.data
      } catch (error) {
        this.logger.error('Failed to parse JSON data:', error)
        return null
      }
    }

    return this.data
  }

  private parseIngredientItem(ingredientItem: RecipeIngredientItem): string {
    const { fields } = ingredientItem
    const fragments = [
      fields.qty || '',
      fields.measurement || '',
      fields.ingredient.fields.title || '',
      fields.postText || '',
    ]

    const filteredFragments: string[] = []
    for (const fragment of fragments) {
      if (fragment) {
        filteredFragments.push(fragment.trimEnd())
      }
    }

    return filteredFragments.join(' ').trimEnd().replace(' ,', ',')
  }

  private parseIngredients(): RecipeFields['ingredients'] | null {
    const data = this.getRecipeData()

    if (!data) {
      return null
    }

    const { ingredientGroups } = data

    // Single group - return IngredientsList (Set)
    if (ingredientGroups.length === 1) {
      const ingredientSet = new Set<string>()

      for (const item of ingredientGroups[0].fields.recipeIngredientItems) {
        ingredientSet.add(this.parseIngredientItem(item))
      }

      return ingredientSet
    }

    // Multiple groups - return IngredientGroup (Map)
    const ingredientMap = new Map<string, List>()

    for (const group of ingredientGroups) {
      const groupTitle = group.fields.title || DEFAULT_INGREDIENTS_GROUP_NAME
      const ingredientSet = new Set<string>()

      for (const item of group.fields.recipeIngredientItems) {
        ingredientSet.add(this.parseIngredientItem(item))
      }

      ingredientMap.set(groupTitle, ingredientSet)
    }

    return ingredientMap
  }
}
