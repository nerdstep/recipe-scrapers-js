import { AbstractScraper } from '@/abstract-scraper'

export class SeriousEatsScraper extends AbstractScraper {
  static host() {
    return 'seriouseats.com'
  }

  extractors = {}
}
