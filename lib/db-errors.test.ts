import { describe, expect, it } from 'vitest'
import { conflictTarget, isUniqueViolation } from './db-errors'

describe('isUniqueViolation', () => {
  it('is true for 23505', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
  })
  it('is false for other codes / non-errors', () => {
    expect(isUniqueViolation({ code: '23503' })).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation(undefined)).toBe(false)
  })
})

describe('conflictTarget', () => {
  it('detects an email conflict from PostgREST details', () => {
    expect(
      conflictTarget({ code: '23505', details: 'Key (email)=(a@b.com) already exists.' }),
    ).toBe('email')
  })
  it('detects a phone conflict', () => {
    expect(
      conflictTarget({ code: '23505', details: 'Key (phone)=(+201001234567) already exists.' }),
    ).toBe('phone')
  })
  it('detects a ref_code conflict by constraint name', () => {
    expect(
      conflictTarget({ code: '23505', constraint: 'waitlist_signups_ref_code_key' }),
    ).toBe('ref_code')
  })
  it('prefers ref_code when the message mentions it', () => {
    expect(
      conflictTarget({ code: '23505', details: 'Key (ref_code)=(AB12CD34) already exists.' }),
    ).toBe('ref_code')
  })
  it('falls back to other for an unrecognized violation', () => {
    expect(conflictTarget({ code: '23505', message: 'some other constraint' })).toBe('other')
  })
})
