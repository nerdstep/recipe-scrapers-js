import { readdir } from 'node:fs/promises'
import path from 'node:path'
import type { RecipeFields } from '../src/types/recipe.interface'
import { isPlainObject, isString } from '../src/utils'
import { removeInstructionHeading } from '../src/utils/instructions'
import { normalizeString, splitToList } from '../src/utils/parsing'

const INPUT_DIR = path.resolve(import.meta.dir, '../.temp')
const OUTPUT_DIR = path.resolve(import.meta.dir, '../test-data')

const DEFAULT_VALUES = {
  siteName: null,
  category: [],
  cookTime: null,
  prepTime: null,
  totalTime: null,
  cuisine: [],
  cookingMethod: null,
  ratings: 0,
  ratingsCount: 0,
  equipment: [],
  reviews: {},
  nutrients: {},
  dietaryRestrictions: [],
  keywords: [],
  links: [],
} as const

const LIST_FIELDS = [
  'category',
  'cuisine',
  'dietaryRestrictions',
  'equipment',
  'ingredients',
  'instructions',
  'keywords',
] as const

// Per-site overrides for known bad data
// These are keyed by hostname, then by the JSON file name without extension
const OVERRIDE_VALUES = {
  'cooking.nytimes.com': {
    nytimes: {
      yields: '5 cups (about 120 to 160 crackers)',
    },
  },
  'epicurious.com': {
    epicurious: {
      canonicalUrl:
        'https://www.epicurious.com/recipes/food/views/ramen-noodle-bowl-with-escarole-and-spicy-tofu-crumbles',
    },
  },
} as const satisfies Record<
  string,
  Record<string, Partial<Record<keyof RecipeFields, unknown>>>
>

/**
 * Returns true if the given path exists and is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await Bun.file(path).stat()
    return stat.isDirectory()
  } catch {
    return false
  }
}

/** Convert snake_case or other keys to camelCase */
function toCamelCase(str: string) {
  return str.replace(/[_-](\w)/g, (_, v) => (v ? v.toUpperCase() : ''))
}

type IngredientGroup = { ingredients: string[]; purpose: string | null }

const isIngredientGroup = (v: unknown): v is IngredientGroup =>
  isPlainObject(v) && 'ingredients' in v && 'purpose' in v

/**
 * Converts an array of ingredient‐group objects into a plain map of
 * purpose → ingredients. Groups without a defined or non‐empty purpose
 * are collected under the key "Ingredients".
 *
 * @param input The raw ingredients value (expected shape:
 *   Array<{ ingredients: string[]; purpose: string | null }>)
 * @returns A Record mapping each group title to its list of ingredient strings,
 *   or undefined if the input is not in the expected shape.
 */
export function groupIngredientItems(
  input: IngredientGroup[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  for (const { ingredients, purpose } of input) {
    const title = isString(purpose) ? purpose.trim() : 'Ingredients'
    const items = Array.isArray(ingredients)
      ? ingredients.filter(isString).map(normalizeString)
      : []

    result[title] = items
  }

  return result
}

function normalizeData(
  host: string,
  filename: string,
  data: Record<string, unknown>,
) {
  // start with default values
  let result: Record<string, unknown> = {
    ...DEFAULT_VALUES,
  }

  // merge & camelCase incoming keys
  for (const [key, value] of Object.entries(data)) {
    let prop = toCamelCase(key)

    // remap instructionsList → instructions
    if (prop === 'instructionsList') {
      prop = 'instructions'
    }

    if (prop === 'ingredientGroups') {
      prop = 'ingredients'
    }

    result[prop] = value
  }

  // Clean instructions
  if (Array.isArray(result.instructions)) {
    result.instructions = result.instructions
      .map(removeInstructionHeading)
      .filter(Boolean)
  }

  // Clean & group ingredients
  if (Array.isArray(result.ingredients)) {
    if (result.ingredients.every(isIngredientGroup)) {
      result.ingredients = groupIngredientItems(result.ingredients)
    } else {
      result.ingredients = result.ingredients.map(normalizeString)
    }
  }

  // Ensure certain fields are always arrays
  for (const field of LIST_FIELDS) {
    const v = result[field]

    if (isString(v)) {
      result[field] = splitToList(v, ',')
    }
  }

  // Apply per-site overrides
  const overrides = OVERRIDE_VALUES[host]?.[filename]

  if (overrides) {
    result = { ...result, ...overrides }
  }

  return result
}

/**
 * Read JSON, normalize data, write to outPath
 */
async function processJson(host: string, inPath: string, outPath: string) {
  let raw: string
  let data: Record<string, unknown>

  try {
    raw = await Bun.file(inPath).text()
    data = JSON.parse(raw)
  } catch {
    console.error(`Skipping invalid JSON: ${inPath}`)
    return
  }

  const filename = path.basename(inPath, '.json')
  const output = normalizeData(host, filename, data)
  const content = JSON.stringify(output, null, 2)

  await Bun.write(outPath, content)
}

/** Recursively traverse input directory, mirroring structure in output dir */
async function traverse(host: string, inDir: string, outDir: string) {
  for (const entry of await readdir(inDir, { withFileTypes: true })) {
    const inPath = path.join(inDir, entry.name)
    const outPath = path.join(outDir, entry.name)
    const relativePath = outPath.substring(OUTPUT_DIR.length + 1)

    if (entry.isDirectory()) {
      await traverse(host, inPath, outPath)
    } else if (entry.isFile()) {
      const exists = await Bun.file(outPath).exists()

      if (exists) {
        console.log(`Skipped:   ${relativePath} (already exists)`)
        continue
      }

      if (entry.name.endsWith('.json')) {
        await processJson(host, inPath, outPath)
        console.log(`Processed: ${relativePath}`)
      } else {
        // copy non-JSON files unchanged
        const data = await Bun.file(inPath).arrayBuffer()
        await Bun.write(outPath, data)
        console.log(`Copied:    ${relativePath}`)
      }
    }
  }
}

async function main(host: string | undefined) {
  if (host) {
    const inDir = path.resolve(INPUT_DIR, host)
    const outDir = path.resolve(OUTPUT_DIR, host)

    if (!(await isDirectory(inDir))) {
      console.error(`Input directory does not exist: ${inDir}`)
      return
    }

    await traverse(host, inDir, outDir)
  } else {
    console.error('Usage: bun process-test-data <host>')
  }
}

/**
 * Read first CLI arg as host
 * (e.g. `bun process-test-data allrecipes.com`)
 */
const [, , host] = process.argv

await main(host)
