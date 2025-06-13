import type { OptionalRecipeFields } from './types/recipe.interface'

// Mandatory fields
// author, canonicalUrl, description, host, image, ingredients, instructions,
// language, links, siteName, title, totalTime, yields

// Inherited fields
// language, links

// Optional fields
// category, cookingMethod, cookTime, cuisine, dietaryRestrictions,
// equipment, keywords, nutrients, prepTime, ratings, ratingsCount, reviews

export const OPTIONAL_RECIPE_FIELD_DEFAULT_VALUES = {
  siteName: null,
  category: new Set(),
  cookTime: null,
  prepTime: null,
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
