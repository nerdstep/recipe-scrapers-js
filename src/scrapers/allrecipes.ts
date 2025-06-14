import { AbstractScraper } from '@/abstract-scraper'

export class AllRecipes extends AbstractScraper {
  static host() {
    return 'allrecipes.com'
  }

  extractors = {}
}
