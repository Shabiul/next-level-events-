import { SERVICE_COLUMNS } from '../data/servicesData';

/**
 * Service-discovery search. The searchable entities are built DYNAMICALLY from
 * the app's real data:
 *   - the service taxonomy (SERVICE_COLUMNS -> categories + sub-services)
 *   - the backend category list (useProducts().categories)
 *   - live product / package names (useProducts().products)
 * so anything newly added in the backend is searchable automatically.
 *
 * SYNONYMS below are only a query-expansion aid (abbreviations, plurals,
 * natural phrases) -- they are NOT a hard-coded catalogue of services.
 */

export interface SearchEntry {
  label: string;
  kind: 'category' | 'subcategory' | 'package';
  /** parent category name for routing (present for category + subcategory) */
  category?: string;
  subcategory?: string;
}

export const EMPTY_SEARCH_HINT =
  'Try searching for birthday, baby shower, anniversary, photography, activities, or live eateries.';

/** alias / natural phrase -> canonical term(s) it should also match */
const SYNONYMS: Record<string, string[]> = {
  bday: ['birthday'],
  bdays: ['birthday'],
  'b day': ['birthday'],
  'first birthday': ['1st birthday'],
  '1 year birthday': ['1st birthday'],
  '1 year': ['1st birthday'],
  'one year': ['1st birthday'],
  '1st year': ['1st birthday'],
  '1yr': ['1st birthday'],
  'kids birthday': ['birthday', 'kids theme'],
  'kid birthday': ['birthday', 'kids theme'],
  photo: ['photography'],
  photos: ['photography'],
  pics: ['photography'],
  photoshoot: ['photography'],
  photograph: ['photography'],
  photographer: ['photography'],
  video: ['videography'],
  filming: ['videography'],
  videographer: ['videography'],
  cinematography: ['videography'],
  anchor: ['emcee', 'anchor', 'game host'],
  emcee: ['emcee', 'anchor'],
  mc: ['emcee', 'anchor'],
  compere: ['emcee', 'anchor'],
  host: ['game host', 'anchor'],
  caricature: ['caricature'],
  'cartoon artist': ['caricature'],
  'sketch artist': ['caricature'],
  tatoo: ['tattoo'],
  'ice cream': ['turkish ice cream', 'ice cream'],
  icecream: ['turkish ice cream', 'ice cream'],
  'roll ice cream': ['turkish ice cream'],
  'turkish icecream': ['turkish ice cream'],
  'pop corn': ['popcorn'],
  'choco fountain': ['chocolate fountain'],
  'chocolate fountian': ['chocolate fountain'],
  propose: ['proposal', 'terrace proposal'],
  proposal: ['proposal', 'terrace proposal'],
  'candle path': ['candlelight pathway'],
  'candle light path': ['candlelight pathway'],
  namkaran: ['naming', 'naming ceremony'],
  naming: ['naming', 'naming ceremony'],
  'cradle ceremony': ['naming ceremony', 'annaprashan'],
  'wall decor': ['simple wall'],
  'simple decor': ['simple wall'],
  decor: ['decor', 'decoration'],
  decoration: ['decor', 'decoration'],
  eatery: ['live eateries'],
  eateries: ['live eateries'],
  'food stall': ['live eateries', 'catering'],
  'live counter': ['live eateries'],
  'live food': ['live eateries', 'catering'],
  activity: ['activities', 'kids activities'],
  activities: ['activities', 'kids activities'],
  entertainment: ['activities', 'kids activities'],
  games: ['game host', 'activities'],
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9\s/&-]/g, ' ').replace(/\s+/g, ' ').trim();

/** naive singular: drop a trailing plural "s" on longer words */
const singular = (t: string) =>
  t.length > 4 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t;

/**
 * Expand a raw query into the list of lower-case terms to match against.
 * Always includes the normalised phrase itself; adds synonym / singular forms.
 */
export function expandQuery(raw: string): string[] {
  const phrase = norm(raw);
  if (!phrase) return [];
  const out = new Set<string>([phrase]);

  if (SYNONYMS[phrase]) SYNONYMS[phrase].forEach((s) => out.add(s));

  for (const token of phrase.split(' ')) {
    if (!token) continue;
    out.add(token);
    out.add(singular(token));
    (SYNONYMS[token] || []).forEach((s) => out.add(s));
    (SYNONYMS[singular(token)] || []).forEach((s) => out.add(s));
  }
  return [...out].filter(Boolean);
}

interface MinimalCategory { name?: string }
interface MinimalProduct { name?: string; categoryName?: string; subcategory?: string }

/** Build the searchable index from the taxonomy + live backend data. */
export function buildServiceIndex(
  categories?: MinimalCategory[] | null,
  products?: MinimalProduct[] | null
): SearchEntry[] {
  const seen = new Set<string>();
  const list: SearchEntry[] = [];

  const add = (e: SearchEntry) => {
    const label = e.label.trim();
    if (!label) return;
    const key = `${e.kind}|${label.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ ...e, label });
  };

  // 1. Service taxonomy -- the source of truth for the mega-menu
  for (const column of SERVICE_COLUMNS) {
    for (const item of column.items) {
      add({ label: item.label, kind: 'category', category: item.label });
      for (const sub of item.subServices || []) {
        add({ label: sub, kind: 'subcategory', category: item.label, subcategory: sub });
      }
    }
  }

  // 2. Backend categories
  for (const c of categories || []) {
    if (c?.name) add({ label: c.name, kind: 'category', category: c.name });
  }

  // 3. Live products -- names + any category / subcategory not already covered
  for (const p of products || []) {
    if (p?.categoryName) add({ label: p.categoryName, kind: 'category', category: p.categoryName });
    if (p?.subcategory) {
      add({
        label: p.subcategory,
        kind: 'subcategory',
        category: p.categoryName || p.subcategory,
        subcategory: p.subcategory,
      });
    }
    if (p?.name) add({ label: p.name, kind: 'package' });
  }

  return list;
}

const KIND_WEIGHT: Record<SearchEntry['kind'], number> = {
  category: 9,
  subcategory: 7,
  package: 2,
};

function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const hay = norm(`${entry.label} ${entry.category || ''} ${entry.subcategory || ''}`);
  const label = norm(entry.label);
  let score = 0;

  for (const term of terms) {
    if (!term) continue;
    if (label === term) score += 140;
    else if (label.startsWith(term)) score += 100;
    else if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(label)) score += 65;
    else if (label.includes(term)) score += 40;
    else if (hay.includes(term)) score += 25;
    else if (term.split(' ').every((tok) => hay.includes(tok))) score += 15;
  }

  return score > 0 ? score + KIND_WEIGHT[entry.kind] : 0;
}

/** Ranked suggestions for the search dropdown. */
export function searchServices(raw: string, index: SearchEntry[], limit = 7): SearchEntry[] {
  const terms = expandQuery(raw);
  if (!terms.length) return [];

  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.length - b.entry.label.length)
    .slice(0, limit)
    .map((r) => r.entry);
}

/** Where selecting a suggestion should take the user. */
export function resolveEntryRoute(entry: SearchEntry): string {
  if (entry.kind === 'subcategory' && entry.category) {
    return `/category/${encodeURIComponent(entry.category)}/${encodeURIComponent(entry.subcategory || entry.label)}`;
  }
  if (entry.kind === 'category') {
    return `/category/${encodeURIComponent(entry.category || entry.label)}`;
  }
  return `/explore?q=${encodeURIComponent(entry.label)}`;
}

/** Does a product match the (expanded) query? Used by the Explore results filter. */
export function productMatchesQuery(
  p: { name?: string; categoryName?: string; subcategory?: string; description?: string },
  raw: string
): boolean {
  const terms = expandQuery(raw);
  if (!terms.length) return true;
  const hay = norm(`${p.name || ''} ${p.categoryName || ''} ${p.subcategory || ''} ${p.description || ''}`);
  return terms.some((t) => hay.includes(t) || t.split(' ').every((tok) => hay.includes(tok)));
}
