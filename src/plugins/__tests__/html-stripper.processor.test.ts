import { describe, expect, it } from 'bun:test'
import type { Ingredients } from '../../types/recipe.interface'
import { HtmlStripperPlugin } from '../html-stripper.processor'

describe('HtmlStripperPlugin', () => {
  const plugin = new HtmlStripperPlugin()

  it('should process only title, instructions, and ingredients fields', () => {
    expect(plugin.shouldProcess('title')).toBe(true)
    expect(plugin.shouldProcess('instructions')).toBe(true)
    expect(plugin.shouldProcess('ingredients')).toBe(true)
    expect(plugin.shouldProcess('category')).toBe(false)
  })

  it('strips HTML from string values', () => {
    expect(plugin.process('title', '<b>Hello &amp; World</b>')).toBe(
      'Hello & World',
    )
    expect(plugin.process('title', 'No tags')).toBe('No tags')
    expect(plugin.process('title', '<span>Test &lt;tag&gt;</span>')).toBe(
      'Test <tag>',
    )
    expect(plugin.process('description', '<span>Hello&nbsp;World</span>')).toBe(
      'Hello World',
    )
  })

  it('strips HTML from instructions Set<string>', () => {
    const input = new Set(['<b>Step 1</b>', 'Step &amp; 2'])
    const output = plugin.process('instructions', input)
    expect(Array.from(output)).toEqual(['Step 1', 'Step & 2'])
  })

  it('strips HTML from ingredients Set<string>', () => {
    const input = new Set(['<i>1 cup</i> flour', '2 &lt;b&gt;eggs&lt;/b&gt;'])
    const output = plugin.process('ingredients', input) as Set<string>
    expect(Array.from(output)).toEqual(['1 cup flour', '2 <b>eggs</b>'])
  })

  it('strips HTML from ingredient groups (Map<string, Set<string>>)', () => {
    const group: Ingredients = new Map([
      [
        '<b>Group 1</b>',
        new Set(['<i>1 cup</i> flour', '2 &lt;b&gt;eggs&lt;/b&gt;']),
      ],
      ['Other', new Set(['<span>3</span> apples'])],
    ])
    const output = plugin.process('ingredients', group) as Map<
      string,
      Set<string>
    >
    expect(Array.from(output.entries())).toEqual([
      ['Group 1', new Set(['1 cup flour', '2 <b>eggs</b>'])],
      ['Other', new Set(['3 apples'])],
    ])
  })

  it('returns value unchanged for non-target fields', () => {
    expect(plugin.process('category', new Set(['<b>cat</b>']))).toEqual(
      new Set(['<b>cat</b>']),
    )
  })
})
