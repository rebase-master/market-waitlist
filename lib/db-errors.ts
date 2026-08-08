export type ConflictTarget = 'email' | 'phone' | 'ref_code' | 'other'

/** True for a Postgres unique-violation (SQLSTATE 23505). */
export function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === '23505'
}

/**
 * Classify which unique constraint a 23505 fired on. The table has three
 * (email, phone, ref_code), and each demands a different response, so a blanket
 * "duplicate = success" is unsafe. Checked most-specific first; matches the
 * constraint name, PostgREST `details` (`Key (email)=(…)`), or the message.
 */
export function conflictTarget(err: unknown): ConflictTarget {
  const e = err as { details?: string; message?: string; constraint?: string } | null
  const hay = `${e?.constraint ?? ''} ${e?.details ?? ''} ${e?.message ?? ''}`.toLowerCase()
  if (hay.includes('ref_code')) return 'ref_code'
  if (hay.includes('email')) return 'email'
  if (hay.includes('phone')) return 'phone'
  return 'other'
}
