import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { ScraperDiagnostics } from '../scraper-diagnostics'

describe('ScraperDiagnostics', () => {
  let diag: ScraperDiagnostics

  beforeEach(() => {
    diag = new ScraperDiagnostics()
  })

  it('records successes correctly and returns summary', () => {
    diag.recordSuccess('SiteA', 'name')
    const summary = diag.getSummary()
    expect(summary).toEqual({
      name: { successes: ['SiteA'], failures: [] },
    })
  })

  it('records failures correctly and returns summary and failures', () => {
    const error = new Error('fail')
    diag.recordFailure('SiteB', 'description', error)
    const summary = diag.getSummary()
    expect(summary).toEqual({
      description: { successes: [], failures: ['SiteB'] },
    })

    const failures = diag.getFailures()
    expect(failures).toHaveLength(1)
    expect(failures[0]).toEqual({
      field: 'description',
      source: 'SiteB',
      error,
    })
  })

  it('mixes successes and failures for same field', () => {
    const err = 'err'
    diag.recordSuccess('SiteA', 'name')
    diag.recordFailure('SiteB', 'name', err)
    const summary = diag.getSummary()
    expect(summary).toEqual({
      name: { successes: ['SiteA'], failures: ['SiteB'] },
    })

    const failures = diag.getFailures()
    expect(failures).toEqual([{ field: 'name', source: 'SiteB', error: err }])
  })

  it('handles multiple fields independently', () => {
    diag.recordSuccess('A', 'field1')
    diag.recordFailure('B', 'field2', 'err2')
    diag.recordSuccess('C', 'field2')
    const summary = diag.getSummary()
    expect(summary).toEqual({
      field1: { successes: ['A'], failures: [] },
      field2: { successes: ['C'], failures: ['B'] },
    })

    const failures = diag.getFailures()
    expect(failures).toEqual([{ field: 'field2', source: 'B', error: 'err2' }])
  })

  describe('printReport', () => {
    let logSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
      logSpy = spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      logSpy.mockRestore()
    })

    it('prints header, field sections, and footer', () => {
      diag.recordSuccess('SiteA', 'f1')
      diag.recordFailure('SiteB', 'f1', 'error1')
      diag.recordFailure('SiteC', 'f2', 'error2')

      diag.printReport()

      // Header
      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        '--- Scraper Diagnostics Report ---',
      )

      // Field f1
      expect(logSpy).toHaveBeenCalledWith('Field: f1')
      expect(logSpy).toHaveBeenCalledWith('  ✅ SiteA')
      expect(logSpy).toHaveBeenCalledWith('  ❌ SiteB: error1')

      // Field f2
      expect(logSpy).toHaveBeenCalledWith('Field: f2')
      expect(logSpy).toHaveBeenCalledWith('  ❌ SiteC: error2')

      // Footer
      expect(logSpy).toHaveBeenLastCalledWith(
        '----------------------------------',
      )
    })
  })
})
