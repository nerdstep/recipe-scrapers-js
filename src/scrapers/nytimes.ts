import { AbstractScraper } from '@/abstract-scraper'
import type { RecipeFields } from '@/types/recipe.interface'
import { groupIngredients, isList } from '@/utils/ingredients'

export class NYTimes extends AbstractScraper {
  static host() {
    return 'cooking.nytimes.com'
  }

  extractors = {
    ingredients: this.ingredients.bind(this),
  }

  protected ingredients(
    prevValue: RecipeFields['ingredients'] | undefined,
  ): RecipeFields['ingredients'] {
    // Use wildcard selectors to handle dynamic class name suffixes
    const headingSelector = 'h3[class*="ingredientgroup_name"]'
    const ingredientSelector = 'li[class*="ingredient"]'

    if (isList(prevValue) && prevValue.size > 0) {
      const result = groupIngredients(
        this.$,
        prevValue,
        headingSelector,
        ingredientSelector,
      )

      return result
    }

    throw new Error('No ingredients found to group')
  }
}
