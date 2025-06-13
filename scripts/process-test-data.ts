import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { splitToList } from '../src/utils/parsing'

const INPUT_DIR = path.resolve(import.meta.dir, '../.temp')
const OUTPUT_DIR = path.resolve(import.meta.dir, '../test-data')

const DEFAULT_VALUES = {
  siteName: null,
  category: [],
  cookTime: null,
  prepTime: null,
  cuisine: [],
  cookingMethod: null,
  ratings: 0,
  ratingsCount: 0,
  equipment: [],
  reviews: {},
  nutrients: {},
  dietaryRestrictions: [],
  keywords: [],
}

/** Convert snake_case or other keys to camelCase */
function toCamelCase(str: string) {
  return str.replace(/[_-](\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

/** Read JSON, normalize keys + defaults, write to outPath */
async function processJson(inPath: string, outPath: string) {
  let raw: string
  let data: Record<string, unknown>

  try {
    raw = await Bun.file(inPath).text()
    data = JSON.parse(raw)
  } catch {
    console.error(`Skipping invalid JSON: ${inPath}`)
    return
  }

  // start with default values
  const result: Record<string, unknown> = {
    ...DEFAULT_VALUES,
  }

  // merge & camelCase incoming keys
  for (const [key, value] of Object.entries(data)) {
    let prop = toCamelCase(key)

    // remap instructionsList → instructions
    if (prop === 'instructionsList') {
      prop = 'instructions'
    }

    result[prop] = value
  }

  // ensure certain fields are always arrays
  const listFields = [
    'category',
    'cuisine',
    'dietaryRestrictions',
    'keywords',
    'equipment',
    'ingredients',
    'instructions',
  ]
  for (const field of listFields) {
    const v = result[field]

    if (typeof v === 'string') {
      result[field] = splitToList(v, ',')
    }
  }

  const output = result
  const content = JSON.stringify(output, null, 2)

  await Bun.write(outPath, content)
}

/** Recursively traverse input directory, mirroring structure in output dir */
async function traverse(inDir: string, outDir: string) {
  // ensure output directory exists
  await mkdir(outDir, { recursive: true })

  for (const entry of await readdir(inDir, { withFileTypes: true })) {
    const inPath = path.join(inDir, entry.name)
    const outPath = path.join(outDir, entry.name)
    const relativePath = outPath.substring(OUTPUT_DIR.length + 1)

    if (entry.isDirectory()) {
      await traverse(inPath, outPath)
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.json')) {
        await processJson(inPath, outPath)
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

async function main() {
  await traverse(INPUT_DIR, OUTPUT_DIR)
}

//await main()

await traverse(
  path.resolve(INPUT_DIR, 'allrecipes.com'),
  path.resolve(OUTPUT_DIR, 'allrecipes.com'),
)
