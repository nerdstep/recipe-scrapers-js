import { AbstractPlugin } from './abstract-plugin'
import type { RecipeFields } from './types/recipe.interface'

export abstract class PostProcessorPlugin extends AbstractPlugin {
  abstract shouldProcess<Key extends keyof RecipeFields>(
    field: Key,
    value: RecipeFields[Key],
  ): boolean

  abstract process<T>(field: keyof RecipeFields, value: T): T | Promise<T>
}
