import { AbstractScraper } from '@/abstract-scraper'

export class AllRecipesScraper extends AbstractScraper {
  static host() {
    return 'allrecipes.com'
  }

  extractors = {}
}
