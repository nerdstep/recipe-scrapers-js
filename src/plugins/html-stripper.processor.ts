import { PostProcessorPlugin } from '@/abstract-postprocessor-plugin'
import { isString } from '@/utils'
import { isIngredientGroup, isIngredients, isList } from '@/utils/ingredients'
import type { Ingredients, RecipeFields } from '../types/recipe.interface'

export class HtmlStripperPlugin extends PostProcessorPlugin {
  name = 'HtmlStripper'
  priority = 100 // Run early

  private fieldsToProcess: (keyof RecipeFields)[] = [
    'title',
    'instructions',
    'ingredients',
  ]

  shouldProcess<Key extends keyof RecipeFields>(
    field: Key,
    _value: RecipeFields[Key],
  ): boolean {
    return this.fieldsToProcess.includes(field)
  }

  process<T>(field: keyof RecipeFields, value: T): T {
    if (isString(value)) {
      return this.stripHtml(value) as T
    }

    if (field === 'instructions' && isList(value)) {
      const result = Array.from(value).map(this.stripHtml)
      return new Set(result) as T
    }

    if (field === 'ingredients' && isIngredients(value)) {
      return this.processIngredients(value) as T
    }

    return value
  }

  private processIngredients(ingredients: Ingredients): Ingredients {
    if (isList(ingredients)) {
      // Handle Set<string> (IngredientsList)
      const processedIngredients = Array.from(ingredients).map(this.stripHtml)
      return new Set(processedIngredients)
    }

    if (isIngredientGroup(ingredients)) {
      // Handle Map<string, Set<string>> (IngredientGroup)
      const processedGroup = new Map<string, Set<string>>()

      for (const [groupName, ingredientSet] of ingredients) {
        const processedGroupName = this.stripHtml(groupName)
        const processedIngredients = Array.from(ingredientSet).map(
          this.stripHtml,
        )
        processedGroup.set(processedGroupName, new Set(processedIngredients))
      }

      return processedGroup
    }

    return ingredients
  }

  private stripHtml(html: string): string {
    // Simple regex approach (you could use a proper HTML parser)
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&') // Decode common entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
}
