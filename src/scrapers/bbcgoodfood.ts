import { AbstractScraper } from '@/abstract-scraper'
import type { RecipeFields } from '@/types/recipe.interface'
import { groupIngredients, isList } from '@/utils/ingredients'

export class BBCGoodFood extends AbstractScraper {
  static host() {
    return 'bbcgoodfood.com'
  }

  extractors = {
    ingredients: this.ingredients.bind(this),
  }

  protected ingredients(
    prevValue: RecipeFields['ingredients'] | undefined,
  ): RecipeFields['ingredients'] {
    const headingSelector = '.recipe__ingredients h3'
    const ingredientSelector = '.recipe__ingredients li'

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
