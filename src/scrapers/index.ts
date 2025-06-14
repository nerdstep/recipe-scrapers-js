import type { AbstractScraper } from '@/abstract-scraper'
import { AllRecipes } from './allrecipes'
import { Epicurious } from './epicurious'
import { NYTimes } from './nytimes'
import { SeriousEats } from './seriouseats'

/**
 * A map of all scrapers.
 */
export const scrapers = {
  [AllRecipes.host()]: AllRecipes,
  [Epicurious.host()]: Epicurious,
  [SeriousEats.host()]: SeriousEats,
  [NYTimes.host()]: NYTimes,
} as const satisfies Record<string, typeof AbstractScraper>
