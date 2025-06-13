import type { AbstractScraper } from '@/abstract-scraper'
import { AllRecipesScraper } from './allrecipes'
import { NYTimesScraper } from './nytimes'

/**
 * A map of all scrapers.
 */
export const scrapers = {
  [AllRecipesScraper.host()]: AllRecipesScraper,
  [NYTimesScraper.host()]: NYTimesScraper,
} as const satisfies Record<string, typeof AbstractScraper>
