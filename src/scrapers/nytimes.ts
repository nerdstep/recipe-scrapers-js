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

  /**
   * The NYTimes website appears to auto generate it's CSS class names,
   * which results in them ending with a string a random characters.
   * Matching the exact class name is likely to break fairly quickly
   * so instead we are going to match on a partial class name.
   * For example, h3[class*='ingredientgroup_name'] matches an h3 element
   * with a class that contains the value 'ingredient_groupname' at least once
   * anywhere in the element class attribute.
   * @link https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
   */
  protected ingredients(
    prevValue: RecipeFields['ingredients'] | undefined,
  ): RecipeFields['ingredients'] {
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
