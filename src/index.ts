import { scrapers } from './scrapers/_index'
import { getHostName } from './utils'

export * from '@/types/recipe.interface'
export * from '@/types/scraper.interface'
export * from './abstract-extractor-plugin'
export * from './abstract-postprocessor-plugin'
export * from './logger'
export { scrapers }

/**
 * Returns a scraper class for the given URL, if implemented.
 */
export function getScraper(url: string) {
  const hostName = getHostName(url)

  if (scrapers[hostName]) {
    return scrapers[hostName]
  }

  throw new Error(
    `The website '${hostName}' is not currently supported.\nIf you want to help add support, please open an issue!`,
  )
}
