import { AbstractScraper } from '@/abstract-scraper'
import type { RecipeFields } from '@/types/recipe.interface'

export class Epicurious extends AbstractScraper {
  static host() {
    return 'epicurious.com'
  }

  extractors = {
    author: this.author.bind(this),
  }

  protected author(): RecipeFields['author'] {
    const author = this.$('a[itemprop="author"]').text().trim()
    return author
  }
}
