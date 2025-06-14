import type { AbstractScraper } from '@/abstract-scraper'
import { AllRecipesScraper } from './allrecipes'
import { NYTimesScraper } from './nytimes'
import { SeriousEatsScraper } from './seriouseats'

/**
 * A map of all scrapers.
 */
export const scrapers = {
  [AllRecipesScraper.host()]: AllRecipesScraper,
  [SeriousEatsScraper.host()]: SeriousEatsScraper,
  [NYTimesScraper.host()]: NYTimesScraper,
} as const satisfies Record<string, typeof AbstractScraper>
