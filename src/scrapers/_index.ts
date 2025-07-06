import type { AbstractScraper } from '@/abstract-scraper'
import { AllRecipes } from './allrecipes'
import { AmericasTestKitchen } from './americastestkitchen'
import { BBCGoodFood } from './bbcgoodfood'
import { EatingWell } from './eatingwell'
import { Epicurious } from './epicurious'
import { NYTimes } from './nytimes'
import { SeriousEats } from './seriouseats'
import { SimplyRecipes } from './simplyrecipes'

/**
 * A map of all scrapers.
 */
export const scrapers = {
  [AllRecipes.host()]: AllRecipes,
  [AmericasTestKitchen.host()]: AmericasTestKitchen,
  [BBCGoodFood.host()]: BBCGoodFood,
  [EatingWell.host()]: EatingWell,
  [Epicurious.host()]: Epicurious,
  [SeriousEats.host()]: SeriousEats,
  [SimplyRecipes.host()]: SimplyRecipes,
  [NYTimes.host()]: NYTimes,
} as const satisfies Record<string, typeof AbstractScraper>
