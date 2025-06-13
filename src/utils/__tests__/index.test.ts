import { describe, expect, it } from 'bun:test'
import {
  isDefined,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
} from '../index'

describe('isDefined', () => {
  it('returns false for undefined', () => {
    let value: number | undefined
    expect(isDefined(value)).toBe(false)
  })

  it('returns true for null or other values', () => {
    expect(isDefined(null)).toBe(true)
    expect(isDefined(0)).toBe(true)
    expect(isDefined('')).toBe(true)
    expect(isDefined(false)).toBe(true)
  })
})

describe('isFunction', () => {
  it('returns true for functions', () => {
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction(function named() {})).toBe(true)
    expect(isFunction(async () => {})).toBe(true)
  })

  it('returns false for non-functions', () => {
    expect(isFunction(null)).toBe(false)
    expect(isFunction({})).toBe(false)
    expect(isFunction(123)).toBe(false)
    expect(isFunction('fn')).toBe(false)
    expect(isFunction([])).toBe(false)
  })
})

describe('isNumber', () => {
  it('returns true for numbers', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(42)).toBe(true)
    expect(isNumber(-3.14)).toBe(true)
    expect(isNumber(Number.NaN)).toBe(true)
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true)
  })

  it('returns false for non-numbers', () => {
    expect(isNumber('123')).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber({})).toBe(false)
    expect(isNumber(() => 1)).toBe(false)
  })
})

describe('isPlainObject', () => {
  it('returns true for plain object literals', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1, b: '2' })).toBe(true)
    const obj = Object.create(Object.prototype)
    expect(isPlainObject(obj)).toBe(true)
  })

  it('returns false for null, arrays, functions, and class instances', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(() => {})).toBe(false)
    class C {}
    expect(isPlainObject(new C())).toBe(false)
  })

  it('returns false for objects with non-default prototype', () => {
    const noProto = Object.create(null)
    expect(isPlainObject(noProto)).toBe(false)
  })
})

describe('isString', () => {
  it('returns true for string primitives', () => {
    expect(isString('')).toBe(true)
    expect(isString('hello')).toBe(true)
    expect(isString(String(123))).toBe(true)
  })

  it('returns false for non-strings', () => {
    expect(isString(new String('str'))).toBe(false)
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString({})).toBe(false)
  })
})
