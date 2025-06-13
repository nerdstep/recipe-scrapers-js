interface Failure {
  field: string
  source: string
  error: unknown
}

type Summary = Record<string, { successes: string[]; failures: string[] }>

export class ScraperDiagnostics {
  // Map<field, Map<source, { success, error? }>>
  private readonly data = new Map<
    string,
    Map<string, { success: boolean; error?: unknown }>
  >()

  recordSuccess(sourceName: string, field: string) {
    let fieldMap = this.data.get(field)

    if (!fieldMap) {
      fieldMap = new Map()
      this.data.set(field, fieldMap)
    }

    fieldMap.set(sourceName, { success: true })
  }

  recordFailure(sourceName: string, field: string, error: unknown) {
    let fieldMap = this.data.get(field)

    if (!fieldMap) {
      fieldMap = new Map()
      this.data.set(field, fieldMap)
    }

    fieldMap.set(sourceName, { success: false, error })
  }

  getSummary() {
    const summary: Summary = {}

    for (const [field, sources] of this.data) {
      summary[field] = { successes: [], failures: [] }

      for (const [sourceName, result] of sources) {
        if (result.success) {
          summary[field].successes.push(sourceName)
        } else {
          summary[field].failures.push(sourceName)
        }
      }
    }

    return summary
  }

  getFailures() {
    const failures: Failure[] = []

    for (const [field, sources] of this.data) {
      for (const [sourceName, result] of sources) {
        if (!result.success && result.error) {
          failures.push({ field, source: sourceName, error: result.error })
        }
      }
    }

    return failures
  }

  printReport() {
    console.log('--- Scraper Diagnostics Report ---')

    for (const [field, sources] of this.data) {
      console.log(`Field: ${field}`)

      for (const [sourceName, result] of sources) {
        if (result.success) {
          console.log(`  ✅ ${sourceName}`)
        } else {
          console.log(`  ❌ ${sourceName}: ${result.error}`)
        }
      }
    }

    console.log('----------------------------------')
  }
}
