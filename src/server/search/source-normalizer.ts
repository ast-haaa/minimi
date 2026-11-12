import type { Source } from '../../shared/types.js';

export function deduplicateSources(sources: Source[]): Source[] {
  const seen = new Map<string, Source>();
  
  for (const source of sources) {
    const key = normalizeUrl(source.url);
    const existing = seen.get(key);
    
    if (!existing || preferSource(source, existing)) {
      seen.set(key, source);
    }
  }
  
  return Array.from(seen.values());
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source'];
    for (const param of trackingParams) {
      u.searchParams.delete(param);
    }
    return `${u.hostname}${u.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function preferSource(candidate: Source, existing: Source): boolean {
  // Prefer sources with publication dates
  if (candidate.publishedDate && !existing.publishedDate) return true;
  // Prefer official sources
  if (candidate.sourceType === 'official' && existing.sourceType !== 'official') return true;
  // Prefer longer snippets
  if ((candidate.snippet?.length || 0) > (existing.snippet?.length || 0)) return true;
  return false;
}

export function sanitizeSourceForDisplay(source: Source): Source {
  return {
    ...source,
    title: source.title ? source.title.slice(0, 200) : 'Untitled',
    snippet: source.snippet ? source.snippet.slice(0, 500) : undefined,
    url: sanitizeUrl(source.url),
  };
}

function sanitizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Only allow http/https
    if (!['http:', 'https:'].includes(u.protocol)) return '';
    return url;
  } catch {
    return '';
  }
}
