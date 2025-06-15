import { AbstractScraper } from '@/abstract-scraper'
import type { RecipeFields } from '@/types/recipe.interface'
import { normalizeString } from '@/utils/parsing'

export class SimplyRecipes extends AbstractScraper {
  static host() {
    return 'simplyrecipes.com'
  }

  extractors = {
    instructions: this.instructions.bind(this),
  }

  /**
   * Scrape and normalize each step under
   * div.structured-project__steps > ol > li
   */
  protected instructions(): RecipeFields['instructions'] {
    // select all <li> under the steps container
    const items = this.$('div.structured-project__steps ol li').toArray()

    if (items.length === 0) {
      return new Set()
    }

    const steps = items
      .map((el) => {
        // clone & strip images/figures before grabbing text
        const $clone = this.$(el).clone()
        $clone.find('img, picture, figure').remove()
        return normalizeString($clone.text())
      })
      .filter((text) => text.length > 0)

    return new Set(steps)
  }
}
