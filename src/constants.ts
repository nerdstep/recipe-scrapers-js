import type { OptionalRecipeFields } from './types/recipe.interface'

// Default values for optional recipe fields
export const OPTIONAL_RECIPE_FIELD_DEFAULT_VALUES = {
  siteName: null,
  category: new Set(),
  cookTime: null,
  prepTime: null,
  totalTime: null,
  cuisine: new Set(),
  cookingMethod: null,
  ratings: 0,
  ratingsCount: 0,
  equipment: new Set(),
  reviews: new Map(),
  nutrients: new Map(),
  dietaryRestrictions: new Set(),
  keywords: new Set(),
} as const satisfies OptionalRecipeFields
