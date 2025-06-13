import type { AbstractScraper } from '@/abstract-scraper'
import { NYTimesScraper } from './nytimes'

/**
 * A map of all scrapers.
 */
export const scrapers = {
  [NYTimesScraper.host()]: NYTimesScraper,
} as const satisfies Record<string, typeof AbstractScraper>
