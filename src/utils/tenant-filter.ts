/**
 * tenant-filter.ts
 *
 * Prototype tenant filter utility.
 * Simulates per-company data visibility without a real multi-tenant API.
 * Each company ID maps to a deterministic slice/filter of the full dataset.
 */

// ---------------------------------------------------------------------------
// filterByTenant
// ---------------------------------------------------------------------------

/**
 * Returns a filtered view of `items` appropriate for the given company tenant.
 * The filtering rules are prototype-only and mirror each company's relative
 * data volume in the seed dataset.
 */
export function filterByTenant<T>(companyId: string, items: T[]): T[] {
  switch (companyId) {
    // Compunnel US group
    case 'comp-001': return items; // primary demo company — full data
    case 'comp-002': return items.filter((_, i) => i % 3 !== 2);
    case 'comp-003': return items.filter((_, i) => i % 2 === 0);
    case 'comp-004': return items.slice(0, Math.ceil(items.length * 0.6));
    case 'comp-005': return items.slice(0, Math.ceil(items.length * 0.3));
    case 'comp-006': return items.slice(0, Math.ceil(items.length * 0.2));
    case 'comp-007': return items.filter((_, i) => i % 4 !== 3);
    case 'comp-008': return items.slice(0, Math.ceil(items.length * 0.5));
    case 'comp-009': return items.slice(0, Math.ceil(items.length * 0.15));

    // Compunnel India group
    case 'comp-010': return items.slice(0, Math.ceil(items.length * 0.25));
    case 'comp-011': return items.filter((_, i) => i % 3 !== 0);
    case 'comp-012': return items.slice(0, Math.ceil(items.length * 0.2));
    case 'comp-013': return items.slice(0, Math.ceil(items.length * 0.4));
    case 'comp-014': return items.slice(0, Math.ceil(items.length * 0.1));

    default: return items;
  }
}

// ---------------------------------------------------------------------------
// getCompanyBadgeColor
// ---------------------------------------------------------------------------

/**
 * Returns a hex colour string to use as the accent / badge colour for a company.
 */
export function getCompanyBadgeColor(companyId: string): string {
  switch (companyId) {
    // Compunnel US group
    case 'comp-001': return '#1d4ed8';
    case 'comp-002': return '#1e40af';
    case 'comp-003': return '#0369a1';
    case 'comp-004': return '#0d9488';
    case 'comp-005': return '#059669';
    case 'comp-006': return '#65a30d';
    case 'comp-007': return '#d97706';
    case 'comp-008': return '#7c3aed';
    case 'comp-009': return '#db2777';

    // Compunnel India group
    case 'comp-010': return '#c2410c';
    case 'comp-011': return '#b45309';
    case 'comp-012': return '#92400e';
    case 'comp-013': return '#78350f';
    case 'comp-014': return '#7f1d1d';

    default: return '#6b7280';
  }
}

// ---------------------------------------------------------------------------
// getActiveCompanyId
// ---------------------------------------------------------------------------

/**
 * Reads the active company ID from the environment / session.
 * Returns undefined when no company is selected (e.g. super-admin context).
 *
 * NOTE: In production this should be derived from the authenticated session
 * token; the localStorage fallback here is prototype-only.
 */
export function getActiveCompanyId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('activeCompanyId') ?? undefined;
}
