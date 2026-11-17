// ==============================================================================
// CLUSTER Society — Pure Application Mapper
// No Supabase or DOM dependencies. 100% unit-testable in pure Node.
// ==============================================================================

/**
 * Maps frontend application representation to remote Supabase database columns.
 * @param {Object} a
 * @returns {Object}
 */
export function appToDB(a) {
  if (!a) return null

  const branchYear =
    a.branchYear || [a.course, a.branch, a.year].filter(Boolean).join(' · ')

  return {
    id: a.id,
    full_name: a.fullName,
    email: a.email,
    roll_number: a.rollNumber,
    course: a.course || '',
    branch: a.branch || '',
    year: a.year || '',
    branch_year: branchYear,
    domain: a.domain,
    github: a.github || '',
    linkedin: a.linkedin || '',
    projects: a.projects || '',
    motivation: a.motivation || '',
    status: a.status || 'Pending',
    source: a.source || null,
    utm_campaign: a.utmCampaign || a.utm_campaign || null,
  }
}

/**
 * Maps remote Supabase row into frontend application representation.
 * @param {Object} row
 * @returns {Object}
 */
export function appFromDB(row) {
  if (!row) return null

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    rollNumber: row.roll_number,
    course: row.course || '',
    branch: row.branch || '',
    year: row.year || '',
    branchYear:
      row.branch_year || [row.course, row.branch, row.year].filter(Boolean).join(' · '),
    domain: row.domain,
    github: row.github || '',
    linkedin: row.linkedin || '',
    projects: row.projects || '',
    motivation: row.motivation || '',
    status: row.status || 'Pending',
    submittedAt: row.submitted_at || null,
    source: row.source || null,
    utmCampaign: row.utm_campaign || null,
  }
}

/**
 * Generates legacy fallback payload when remote database schema has not yet migrated
 * optional columns. Omits source and utm_campaign to ensure core submission succeeds.
 * @param {Object} newApp
 * @returns {Object}
 */
export function createLegacyFallbackPayload(newApp) {
  return {
    id: newApp.id,
    full_name: newApp.fullName,
    email: newApp.email,
    roll_number: newApp.rollNumber,
    branch_year:
      newApp.branchYear ||
      `${newApp.course || ''} · ${newApp.branch || ''} · ${newApp.year || ''}`,
    domain: newApp.domain,
    github: newApp.github || '',
    linkedin: newApp.linkedin || '',
    motivation: [
      newApp.projects && `Built: ${newApp.projects}`,
      newApp.motivation,
    ]
      .filter(Boolean)
      .join('\n\n'),
    status: newApp.status || 'Pending',
  }
}

/**
 * Generates payload omitting only analytics attribution columns (source, utm_campaign).
 * Keeps separate course, branch, year, and projects columns intact if only analytics columns are missing.
 * @param {Object} newApp
 * @returns {Object}
 */
export function createUnattributedPayload(newApp) {
  const payload = appToDB(newApp)
  if (!payload) return null
  delete payload.source
  delete payload.utm_campaign
  return payload
}
