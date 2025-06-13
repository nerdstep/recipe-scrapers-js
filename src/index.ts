import { scrapers } from './scrapers'

export * from '@/types/recipe.interface'
export * from '@/types/scraper.interface'

/**
 * Extracts the host name from a URL string.
 */
function getHostName(urlString: string) {
  try {
    const url = new URL(urlString)
    return url.host
  } catch {
    throw new Error(`Invalid URL: ${urlString}`)
  }
}

/**
 * Returns a scraper instance for the given URL, if implemented.
 */
export function getScraper(html: string, url: string) {
  const hostName = getHostName(url)

  if (scrapers[hostName]) {
    const ScraperClass = scrapers[hostName]
    return new ScraperClass(html, url)
  }

  throw new Error(
    `The website '${hostName}' is not currently supported.\nIf you want to help add support, please open an issue!`,
  )
}
