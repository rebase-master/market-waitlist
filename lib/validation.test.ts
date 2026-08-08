import { describe, expect, it } from 'vitest'
import { normalizeEgyptianPhone, parseWaitlist } from './validation'

describe('normalizeEgyptianPhone', () => {
  const valid: Array<[string, string]> = [
    ['01001234567', '+201001234567'], // local, leading 0
    ['+201001234567', '+201001234567'], // already E.164
    ['00201001234567', '+201001234567'], // 0020 prefix
    ['201001234567', '+201001234567'], // country code, no +
    ['1001234567', '+201001234567'], // bare, no leading 0
    ['010 0123 4567', '+201001234567'], // spaces
    ['010-0123-4567', '+201001234567'], // dashes
    ['(010) 0123 4567', '+201001234567'], // parens
    ['01112345678', '+201112345678'], // 011 Etisalat
    ['01212345678', '+201212345678'], // 012 Orange
    ['01512345678', '+201512345678'], // 015 WE
  ]
  it.each(valid)('normalizes %s -> %s', (input, expected) => {
    expect(normalizeEgyptianPhone(input)).toBe(expected)
  })

  const invalid = [
    '', // empty
    '   ', // whitespace
    '0123456789', // too short after normalizing
    '013123456789', // 013 is not a valid mobile prefix
    '0100123456', // too short
    '010012345678', // too long
    '+9711234567', // wrong country
    '02223456789', // Cairo landline
    'abc', // not a number
  ]
  it.each(invalid)('rejects %s', (input) => {
    expect(normalizeEgyptianPhone(input)).toBeNull()
  })
})

describe('parseWaitlist', () => {
  const base = { fullName: 'Sara Ahmed', referralSource: 'search' }

  it('accepts a phone-only signup and normalizes it', () => {
    const r = parseWaitlist({ ...base, phone: '01001234567' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.phone).toBe('+201001234567')
      expect(r.value.email).toBeNull()
    }
  })

  it('accepts an email-only signup and lowercases it', () => {
    const r = parseWaitlist({ ...base, email: 'Sara@Example.COM' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.email).toBe('sara@example.com')
  })

  it('rejects when neither email nor phone is given', () => {
    const r = parseWaitlist({ ...base })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.contact).toBeTruthy()
  })

  it('rejects an invalid Egyptian phone', () => {
    const r = parseWaitlist({ ...base, phone: '0123' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.phone).toBeTruthy()
  })

  it('rejects a too-short name', () => {
    const r = parseWaitlist({ fullName: 'A', referralSource: 'search', phone: '01001234567' })
    expect(r.ok).toBe(false)
  })

  it('rejects an unknown referral source', () => {
    const r = parseWaitlist({ ...base, referralSource: 'carrier_pigeon', phone: '01001234567' })
    expect(r.ok).toBe(false)
  })

  it('flags the honeypot but still parses', () => {
    const r = parseWaitlist({ ...base, phone: '01001234567', website: 'http://spam' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.honeypot).toBe(true)
  })

  it('captures optional financing_purpose and referred_by', () => {
    const r = parseWaitlist({
      ...base,
      phone: '01001234567',
      financingPurpose: 'education',
      referredBy: 'AB12CD34',
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.financing_purpose).toBe('education')
      expect(r.value.referred_by).toBe('AB12CD34')
    }
  })

  it('drops an invalid financing_purpose (optional, non-fatal)', () => {
    const r = parseWaitlist({ ...base, phone: '01001234567', financingPurpose: 'yacht' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.financing_purpose).toBeNull()
  })
})
