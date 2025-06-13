import type { CheerioAPI } from 'cheerio'

export abstract class AbstractPlugin {
  /** The name of the plugin */
  abstract name: string

  /** The priority of the plugin */
  abstract priority: number

  constructor(readonly $: CheerioAPI) {}
}
