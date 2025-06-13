import type { ExtractorPlugin } from './abstract-extractor-plugin'
import { OPTIONAL_RECIPE_FIELD_DEFAULT_VALUES } from './constants'
import { ExtractorNotFoundException } from './exceptions'
import { type LogLevel, Logger } from './logger'
import type { ScraperDiagnostics } from './scraper-diagnostics'
import type { RecipeFields } from './types/recipe.interface'
import { isDefined } from './utils'

export class RecipeExtractor {
  private readonly logger: Logger

  constructor(
    private plugins: ExtractorPlugin[],
    private readonly scraperName: string,
    private readonly diagnostics: ScraperDiagnostics,
    private readonly options: { logLevel?: LogLevel } = {},
  ) {
    this.logger = new Logger(this.getContext(), this.options.logLevel)

    // Sort plugins by priority in descending order (higher priority first)
    this.plugins.sort((a, b) => b.priority - a.priority)
  }

  private getContext(context?: string) {
    return `${this.scraperName}.${RecipeExtractor.name}${
      context ? `.${context}` : ''
    }`
  }

  async extract<Key extends keyof RecipeFields>(
    field: Key,
    extractor?: (
      prevValue: RecipeFields[Key] | undefined,
    ) => RecipeFields[Key] | Promise<RecipeFields[Key]>,
  ): Promise<RecipeFields[Key]> {
    let result: RecipeFields[Key] | undefined

    this.logger.debug(`Extracting field: ${field}`)

    // 1. Plugins in priority order
    for (const plugin of this.plugins) {
      const pluginLogger = new Logger(
        this.getContext(plugin.name),
        this.options.logLevel,
      )
      const isSupported = plugin.supports(field)

      // Check if the plugin supports the field and if the result
      // is not already defined--since plugins are sorted by priority,
      // we only want to keep the value of the first plugin
      // that returns a value for the field.
      if (isSupported && !isDefined(result)) {
        try {
          result = await plugin.extract(field)
        } catch (err) {
          this.diagnostics.recordFailure(plugin.name, field, err)
        }
      } else {
        pluginLogger.verbose(`Field is not supported: ${field}`)
      }
    }

    // 2. Site-specific extractor
    if (extractor) {
      this.logger.debug(`Using site-specific extractor for: ${field}`)
      this.logger.verbose('Current result: ', result)

      try {
        result = await extractor(result)
        this.logger.verbose(`Site result for ${field}: `, result)
      } catch (err) {
        this.logger.error(err)
        this.diagnostics.recordFailure(this.scraperName, field, err)
      }
    }

    // 3. Fallback to default values
    if (!result && field in OPTIONAL_RECIPE_FIELD_DEFAULT_VALUES) {
      this.logger.debug(`Using default value for: ${field}`)
      result = (OPTIONAL_RECIPE_FIELD_DEFAULT_VALUES as RecipeFields)[field]
    }

    if (isDefined(result)) {
      return result
    }

    throw new ExtractorNotFoundException(field)
  }
}
