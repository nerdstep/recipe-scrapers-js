import { ExtractorPlugin } from '../abstract-extractor-plugin'
import { UnsupportedFieldException } from '../exceptions'
import type { RecipeFields } from '../types/recipe.interface'

export class OpenGraphException extends Error {
  constructor(name: string) {
    super(`OpenGraph metadata not found: ${name}`)
    this.name = 'OpenGraphException'
  }
}

export class OpenGraphPlugin extends ExtractorPlugin {
  name = OpenGraphPlugin.name
  priority = 60

  private extractors: {
    [K in keyof RecipeFields]?: () => RecipeFields[K]
  } = {
    image: this.image.bind(this),
    siteName: this.siteName.bind(this),
  }

  supports(field: keyof RecipeFields) {
    return Object.keys(this.extractors).includes(field)
  }

  extract<Key extends keyof RecipeFields>(field: Key): RecipeFields[Key] {
    const extractor = this.extractors[field]

    if (!extractor) {
      throw new UnsupportedFieldException(field)
    }

    return extractor()
  }

  private siteName() {
    const meta =
      this.$('meta[property="og:site_name"]').attr('content') ||
      this.$('meta[name="og:site_name"]').attr('content')

    if (!meta) {
      throw new OpenGraphException('siteName')
    }

    return meta
  }

  private image() {
    const image = this.$('meta[property="og:image"][content]').attr('content')

    if (!image?.startsWith('http')) {
      throw new OpenGraphException('image')
    }

    return image
  }
}
