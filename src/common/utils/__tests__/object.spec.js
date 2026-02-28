import { describe, it, expect } from 'vitest'
import { isEqual } from '../object'

describe('isEqual deep comparison utility', () => {
  it('should return true for identical primitives', () => {
    expect(isEqual(1, 1)).toBe(true)
    expect(isEqual('test', 'test')).toBe(true)
    expect(isEqual(true, true)).toBe(true)
    expect(isEqual(null, null)).toBe(true)
    expect(isEqual(undefined, undefined)).toBe(true)
  })

  it('should return false for different primitives', () => {
    expect(isEqual(1, 2)).toBe(false)
    expect(isEqual('test', 'test2')).toBe(false)
    expect(isEqual(true, false)).toBe(false)
    expect(isEqual(null, undefined)).toBe(false)
    expect(isEqual(0, '')).toBe(false)
    expect(isEqual(1, '1')).toBe(false)
  })

  it('should correctly evaluate NaN equality', () => {
    expect(isEqual(NaN, NaN)).toBe(true)
    expect(isEqual(NaN, 1)).toBe(false)
  })

  it('should return true for deeply equal simple objects', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(isEqual({ a: 'foo', b: true }, { a: 'foo', b: true })).toBe(true)
  })

  it('should return false for objects with different values or missing keys', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    expect(isEqual({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false)
  })

  it('should ignore object key insertion order (deterministic check)', () => {
    const obj1 = { a: 1, b: 2, c: 3 }
    const obj2 = { c: 3, a: 1, b: 2 }
    expect(isEqual(obj1, obj2)).toBe(true)
  })

  it('should correctly evaluate nested objects', () => {
    const obj1 = { a: { b: { c: 1 } }, d: 2 }
    const obj2 = { d: 2, a: { b: { c: 1 } } }
    expect(isEqual(obj1, obj2)).toBe(true)

    const obj3 = { a: { b: { c: 2 } }, d: 2 }
    expect(isEqual(obj1, obj3)).toBe(false)
  })

  it('should correctly evaluate arrays', () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isEqual([1, 2, 3], [3, 2, 1])).toBe(false) // Array order matters
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(isEqual([], [])).toBe(true)
  })

  it('should deeply compare objects containing arrays', () => {
    const obj1 = { a: [1, 2, { b: 3 }] }
    const obj2 = { a: [1, 2, { b: 3 }] }
    expect(isEqual(obj1, obj2)).toBe(true)

    const obj3 = { a: [1, 2, { b: 4 }] }
    expect(isEqual(obj1, obj3)).toBe(false)
  })

  it('should return false when comparing different types', () => {
    expect(isEqual({}, [])).toBe(false)
    expect(isEqual([], {})).toBe(false)
    expect(isEqual({ a: 1 }, null)).toBe(false)
    expect(isEqual(null, { a: 1 })).toBe(false)
    expect(isEqual([1], 1)).toBe(false)
  })

  it('should differentiate objects from different constructors', () => {
    class A {
      constructor() {
        this.val = 1
      }
    }
    class B {
      constructor() {
        this.val = 1
      }
    }
    
    // Equal shapes but different prototypes
    expect(isEqual(new A(), new B())).toBe(false)
    expect(isEqual(new A(), { val: 1 })).toBe(false)
  })

  it('should correctly handle undefined values inside objects', () => {
    expect(isEqual({ a: undefined }, { a: undefined })).toBe(true)
    expect(isEqual({ a: undefined }, { })).toBe(false)
    expect(isEqual({ }, { a: undefined })).toBe(false)
  })
})
