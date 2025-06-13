import { AbstractPlugin } from './abstract-plugin'
import type { RecipeFields } from './types/recipe.interface'

export abstract class ExtractorPlugin extends AbstractPlugin {
  /** Whether this plugin can extract the given field */
  abstract supports(field: keyof RecipeFields): boolean

  /**
   * Extracts the field from the cheerio root.
   * @param field The field to extract
   * @returns The extracted field value
   */
  abstract extract<Key extends keyof RecipeFields>(
    field: Key,
  ): RecipeFields[Key] | Promise<RecipeFields[Key]>
}
