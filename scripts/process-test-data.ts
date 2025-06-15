import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { isString } from '../src/utils'
import { splitToList } from '../src/utils/parsing'

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

  for (const field of LIST_FIELDS) {
    const v = result[field]

    if (isString(v)) {
      result[field] = splitToList(v, ',')
    }
  }

  const output = result
  const content = JSON.stringify(output, null, 2)

  await Bun.write(outPath, content)
}

/** Recursively traverse input directory, mirroring structure in output dir */
async function traverse(inDir: string, outDir: string) {
  for (const entry of await readdir(inDir, { withFileTypes: true })) {
    const inPath = path.join(inDir, entry.name)
    const outPath = path.join(outDir, entry.name)
    const relativePath = outPath.substring(OUTPUT_DIR.length + 1)

    if (entry.isDirectory()) {
      await traverse(inPath, outPath)
    } else if (entry.isFile()) {
      const exists = await Bun.file(outPath).exists()

      if (exists) {
        console.log(`Skipped:   ${relativePath} (already exists)`)
        continue
      }

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

async function main(host: string | undefined) {
  if (host) {
    const inDir = path.resolve(INPUT_DIR, host)
    const outDir = path.resolve(OUTPUT_DIR, host)

    if (!(await isDirectory(inDir))) {
      console.error(`Input directory does not exist: ${inDir}`)
      return
    }

    await traverse(inDir, outDir)
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
