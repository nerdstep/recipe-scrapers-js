import { AbstractScraper } from '@/abstract-scraper'

export class SimplyRecipes extends AbstractScraper {
  static host() {
    return 'simplyrecipes.com'
  }

  extractors = {}
}
