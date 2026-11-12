import type { WebSearchParams, WebSearchResult } from '../../shared/types.js';

interface TavilySearchResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string;
  }>;
}

export class WebSearchService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';
  private lastCallTime = 0;
  private minIntervalMs = 500; // Rate limiting

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(params: WebSearchParams): Promise<WebSearchResult[]> {
    // Rate limiting
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise(r => setTimeout(r, this.minIntervalMs - elapsed));
    }
    this.lastCallTime = Date.now();

    try {
      const body: Record<string, unknown> = {
        api_key: this.apiKey,
        query: params.query,
        max_results: 8,
        include_answer: false,
        search_depth: 'advanced',
      };

      if (params.recency_days) {
        body.days = params.recency_days;
      }

      if (params.domains && params.domains.length > 0) {
        body.include_domains = params.domains;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('Tavily rate limit reached');
          return [];
        }
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as TavilySearchResponse;

      // Normalize and deduplicate results
      const seen = new Set<string>();
      const results: WebSearchResult[] = [];

      for (const r of data.results || []) {
        const normalizedUrl = this.normalizeUrl(r.url);
        if (seen.has(normalizedUrl)) continue;
        seen.add(normalizedUrl);

        results.push({
          title: this.sanitizeText(r.title),
          url: r.url,
          content: this.sanitizeText(r.content),
          score: r.score,
          publishedDate: r.published_date || null,
          domain: this.extractDomain(r.url),
        });
      }

      return results;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Web search timed out for query:', params.query);
        return [];
      }
      console.error('Web search failed:', error);
      return [];
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.hostname}${u.pathname}`.replace(/\/$/, '').toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  private sanitizeText(text: string): string {
    if (!text) return '';
    // Remove any potential prompt injection patterns
    return text
      .replace(/\[INST\].*?\[\/INST\]/gs, '')
      .replace(/<<SYS>>.*?<<\/SYS>>/gs, '')
      .replace(/<\|im_start\|>.*?<\|im_end\|>/gs, '')
      .replace(/system:\s*you are/gi, '')
      .replace(/ignore previous instructions/gi, '')
      .replace(/ignore all previous/gi, '')
      .slice(0, 3000); // Limit content size
  }
}
