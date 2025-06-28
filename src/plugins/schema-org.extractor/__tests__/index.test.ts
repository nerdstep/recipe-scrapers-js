import { describe, expect, it } from 'bun:test'
import { load } from 'cheerio'
import {
  ExtractionFailedException,
  UnsupportedFieldException,
} from '@/exceptions'
import type { RecipeFields } from '@/types/recipe.interface'
import { isList } from '@/utils/ingredients'
import { SchemaOrgException, SchemaOrgPlugin } from '../index'

const minimalJsonLd = `
<script type="application/ld+json">
{
  "@graph": [
    { "@type": "WebSite", "name": "MySite" },
    {
      "@type": "Recipe",
      "name": "RecipeName",
      "description": "Desc",
      "image": "https://img.jpg",
      "recipeIngredient": [" a ", "b"],
      "recipeInstructions": ["step1", "step2"],
      "recipeCategory": "Cat",
      "recipeYield": "4",
      "totalTime": "PT10M",
      "cookTime": "PT5M",
      "prepTime": "PT5M",
      "recipeCuisine": ["Cuisine"],
      "cookingMethod": "Bake",
      "aggregateRating": {
        "@type": "AggregateRating",
        "@id": "r1",
        "ratingValue": 4.5,
        "ratingCount": 10
      },
      "nutrition": { "calories": "100" },
      "keywords": ["kw1", " kw2 "],
      "suitableForDiet": "http://schema.org/Vegetarian"
    }
  ]
}
</script>`

describe('SchemaOrgException', () => {
  it('should throw an error with the correct message', () => {
    const error = new SchemaOrgException('title', null)
    expect(error).toBeInstanceOf(ExtractionFailedException)
    expect(error.name).toBe('SchemaOrgException')
    expect(error.message).toBe('Invalid value for "title": null')
  })
})

describe('SchemaOrgPlugin', () => {
  const $ = load(minimalJsonLd)
  const plugin = new SchemaOrgPlugin($)

  it('supports known recipe fields', () => {
    // biome-ignore lint/complexity/useLiteralKeys: private use only
    const keys = Object.keys(plugin['extractors'])
    expect(plugin.supports('title')).toBe(keys.includes('title'))
    expect(plugin.supports('ingredients')).toBe(true)
    expect(plugin.supports('dietaryRestrictions')).toBe(true)
    expect(plugin.supports('unknown' as keyof RecipeFields)).toBe(false)
  })

  it('extracts simple string fields', () => {
    expect(plugin.extract('siteName')).toBe('MySite')
    expect(plugin.extract('title')).toBe('RecipeName')
    expect(plugin.extract('description')).toBe('Desc')
    expect(plugin.extract('cookingMethod')).toBe('Bake')
  })

  it('extracts image and validates URL', () => {
    expect(plugin.extract('image')).toBe('https://img.jpg')
  })

  it('extracts numeric durations and times', () => {
    expect(plugin.extract('totalTime')).toBe(10)
    expect(plugin.extract('cookTime')).toBe(5)
    expect(plugin.extract('prepTime')).toBe(5)
    expect(plugin.extract('yields')).toBe('4 servings')
  })

  it('extracts ingredient and instruction lists', () => {
    const ingredients = plugin.extract('ingredients')

    expect(isList(ingredients)).toBe(true)
    // @ts-expect-error
    expect(Array.from(ingredients)).toEqual(['a', 'b'])
    expect(Array.from(plugin.extract('instructions'))).toEqual([
      'step1',
      'step2',
    ])
  })

  it('extracts categorical and list fields', () => {
    expect(Array.from(plugin.extract('category'))).toEqual(['Cat'])
    expect(Array.from(plugin.extract('cuisine'))).toEqual(['Cuisine'])
    expect(Array.from(plugin.extract('keywords'))).toEqual(['kw1', 'kw2'])
  })

  it('extracts ratings and counts correctly', () => {
    expect(plugin.extract('ratings')).toBe(4.5)
    expect(plugin.extract('ratingsCount')).toBe(10)
  })

  it('extracts nutrients and dietary restrictions', () => {
    const nutrients = plugin.extract('nutrients')
    expect(nutrients.get('calories')).toBe('100')
    const diets = Array.from(plugin.extract('dietaryRestrictions'))
    expect(diets).toEqual(['Vegetarian'])
  })

  it('throws UnsupportedFieldException for unsupported field', () => {
    expect(() => plugin.extract('foo' as keyof RecipeFields)).toThrow(
      UnsupportedFieldException,
    )
  })

  it('throws SchemaOrgException for missing required field', () => {
    // JSON-LD missing 'name' for Recipe
    const badJson = `<script type="application/ld+json">{"@type":"Recipe"}</script>`
    const badPlugin = new SchemaOrgPlugin(load(badJson))
    expect(() => badPlugin.extract('title')).toThrow(
      'No value found for "title"',
    )
  })

  it('throws SchemaOrgException for invalid image', () => {
    const badImgJson = `<script type="application/ld+json">{"@type":"Recipe","image":"nope"}</script>`
    const badPlugin = new SchemaOrgPlugin(load(badImgJson))
    expect(() => badPlugin.extract('image')).toThrow(
      'Invalid value for "image": nope',
    )
  })
})
