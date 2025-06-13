import type { ExtractorPlugin } from '@/abstract-extractor-plugin'
import type { PostProcessorPlugin } from '@/abstract-postprocessor-plugin'
import type { LogLevel } from '@/logger'

export interface ScraperOptions {
  /**
   * Additional extractors to be used by the scraper.
   * These extractors will be added to the default set of extractors.
   * Extractors are applied according to their priority.
   * Higher priority extractors will run first.
   * @default []
   */
  extraExtractors?: ExtractorPlugin[]
  /**
   * Additional post-processors to be used by the scraper.
   * These post-processors will be added to the default set of post-processors.
   * Post-processors are applied after all extractors have run.
   * Post-processors are also applied according to their priority.
   * Higher priority post-processors will run first.
   * @default []
   */
  extraPostProcessors?: PostProcessorPlugin[]
  /**
   * Whether link scraping is enabled.
   * @default false
   */
  linksEnabled?: boolean
  /**
   * Logging level for the scraper.
   * This controls the verbosity of logs produced by the scraper.
   * @default LogLevel.Warn
   */
  logLevel?: LogLevel
}
