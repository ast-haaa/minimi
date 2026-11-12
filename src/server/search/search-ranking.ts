import type { WebSearchResult, Source } from '../../shared/types.js';

// Domain authority ranking
const DOMAIN_PRIORITY: Record<string, number> = {
  // Official/documentation domains get highest priority
  'github.com': 8,
  'docs.github.com': 9,
  'stackoverflow.com': 7,
};

export function rankSearchResults(results: WebSearchResult[], queryTerms: string[]): WebSearchResult[] {
  return results
    .map(result => ({
      ...result,
      score: computeRelevanceScore(result, queryTerms),
    }))
    .sort((a, b) => b.score - a.score);
}

function computeRelevanceScore(result: WebSearchResult, queryTerms: string[]): number {
  let score = result.score || 0.5;

  // Boost official domains
  const domainScore = getDomainPriority(result.domain);
  score += domainScore * 0.05;

  // Boost results with pricing pages
  if (/pricing|plans|cost/i.test(result.url) || /pricing|plans|cost/i.test(result.title)) {
    score += 0.15;
  }

  // Boost results with changelog/release notes
  if (/changelog|release|what.?s.?new/i.test(result.url) || /changelog|release|what.?s.?new/i.test(result.title)) {
    score += 0.1;
  }

  // Query term overlap
  const lowerContent = (result.content + ' ' + result.title).toLowerCase();
  const matchedTerms = queryTerms.filter(t => lowerContent.includes(t.toLowerCase()));
  score += (matchedTerms.length / Math.max(queryTerms.length, 1)) * 0.2;

  return Math.min(score, 1);
}

function getDomainPriority(domain: string): number {
  // Check exact match first
  if (DOMAIN_PRIORITY[domain]) return DOMAIN_PRIORITY[domain];
  
  // Check if it's a documentation/official subdomain
  if (domain.startsWith('docs.') || domain.startsWith('developer.') || domain.startsWith('developers.')) return 8;
  if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 7;
  
  return 5; // default
}

export function classifySourceType(url: string, domain: string): Source['sourceType'] {
  const path = url.toLowerCase();
  
  if (path.includes('/docs') || path.includes('/documentation') || path.includes('/api')) return 'documentation';
  if (path.includes('/pricing') || path.includes('/plans') || domain.includes('pricing')) return 'official';
  if (path.includes('/blog') || path.includes('/news')) return 'blog';
  if (path.includes('/changelog') || path.includes('/releases') || path.includes('/whats-new')) return 'official';
  if (domain.includes('reddit.com') || domain.includes('stackoverflow.com') || domain.includes('forum')) return 'forum';
  if (domain.includes('techcrunch') || domain.includes('theverge') || domain.includes('arstechnica')) return 'news';
  
  return 'unknown';
}

export function webResultToSource(result: WebSearchResult): Source {
  return {
    title: result.title,
    url: result.url,
    domain: result.domain,
    snippet: result.content.slice(0, 500),
    publishedDate: result.publishedDate || null,
    retrievedAt: new Date().toISOString(),
    sourceType: classifySourceType(result.url, result.domain),
  };
}
