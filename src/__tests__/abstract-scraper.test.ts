import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { AbstractScraper } from '@/abstract-scraper'
import { NotImplementedException } from '@/exceptions'
import { Logger } from '@/logger'

class DummyScraper extends AbstractScraper {
  // implement required static host
  static host(): string {
    return 'dummy.com'
  }
  // no site-specific extractors
  extractors = {}
}

describe('AbstractScraper utility methods', () => {
  let scraper: DummyScraper

  describe('static host()', () => {
    it('throws by default on base class', () => {
      expect(() => AbstractScraper.host()).toThrow(NotImplementedException)
    })

    it('returns host for subclass', () => {
      expect(DummyScraper.host()).toBe('dummy.com')
    })
  })

  describe('canonicalUrl()', () => {
    it('returns absolute canonical URL when provided', () => {
      const html = '<link rel="canonical" href="/foo/bar"/>'
      scraper = new DummyScraper(html, 'http://example.com/page', {})
      expect(scraper.canonicalUrl()).toBe('http://example.com/foo/bar')
    })

    it('returns base URL when no canonical link', () => {
      const html = '<html></html>'
      scraper = new DummyScraper(html, 'https://site.org/path?x=1', {})
      expect(scraper.canonicalUrl()).toBe('https://site.org/path?x=1')
    })

    it('prefixes URL with https when missing protocol', () => {
      const html = ''
      scraper = new DummyScraper(html, 'site.org/abc', {})
      expect(scraper.canonicalUrl()).toBe('https://site.org/abc')
    })
  })

  describe('language()', () => {
    let warnSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
      warnSpy = spyOn(Logger.prototype, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
      warnSpy.mockRestore()
    })

    it('reads html lang attribute', () => {
      const html = '<html lang="fr"><body></body></html>'
      scraper = new DummyScraper(html, 'url', {})
      expect(scraper.language()).toBe('fr')
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('falls back to meta http-equiv content-language', () => {
      const html =
        '<html><head>' +
        '<meta http-equiv="content-language" content="de, en"/>' +
        '</head></html>'
      scraper = new DummyScraper(html, 'url', {})
      expect(scraper.language()).toBe('de')
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('defaults to "en" and logs warning when none found', () => {
      scraper = new DummyScraper('<html></html>', 'url', {})
      expect(scraper.language()).toBe('en')
      expect(warnSpy).toHaveBeenCalledWith('Could not determine language')
    })
  })

  describe('links()', () => {
    const html = `
      <a href="http://foo.com/page">Foo</a>
      <a href="/local">Local</a>
      <a>No href</a>
    `
    it('returns empty list when linksEnabled is false', () => {
      scraper = new DummyScraper(html, 'url', { linksEnabled: false })
      expect(scraper.links()).toEqual([])
    })

    it('returns only absolute links when linksEnabled is true', () => {
      scraper = new DummyScraper(html, 'url', { linksEnabled: true })
      const links = scraper.links()
      expect(links).toEqual([{ href: 'http://foo.com/page', text: 'Foo' }])
    })
  })
})
