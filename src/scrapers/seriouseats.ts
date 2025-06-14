import { AbstractScraper } from '@/abstract-scraper'

export class SeriousEats extends AbstractScraper {
  static host() {
    return 'seriouseats.com'
  }

  extractors = {}
}
