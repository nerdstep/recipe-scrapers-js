import { AbstractScraper } from '@/abstract-scraper'

export class EatingWell extends AbstractScraper {
  static host() {
    return 'eatingwell.com'
  }

  extractors = {}
}
