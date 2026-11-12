import type { WebSearchParams, WebSearchResult, Source } from '../../shared/types.js';
import { WebSearchService } from '../search/web-search.js';
import { rankSearchResults, webResultToSource } from '../search/search-ranking.js';
import { deduplicateSources } from '../search/source-normalizer.js';

export interface ToolExecutionResult {
  toolCallId: string;
  name: string;
  arguments: Record<string, unknown>;
  content: string;
  sources: Source[];
  rawResults: WebSearchResult[];
}

export class ToolHandler {
  private searchService: WebSearchService;
  private maxSearchesPerTurn = 4;
  private searchCount = 0;

  constructor(apiKey: string) {
    this.searchService = new WebSearchService(apiKey);
  }

  resetTurn(): void {
    this.searchCount = 0;
  }

  get searchesExecuted(): number {
    return this.searchCount;
  }

  canSearch(): boolean {
    return this.searchCount < this.maxSearchesPerTurn;
  }

  getToolDefinitions() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'web_search',
          description:
            'Search the live web for current facts, recent product changes, updated pricing, official documentation, or current announcements. Use focused search terms including product or company names.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query. Be specific, focusing on products, companies, pricing, or releases.',
              },
              recency_days: {
                type: 'number',
                description: 'Optional filter for content published within the last N days (e.g. 7, 30, 90).',
              },
              domains: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional array of specific domains to restrict the search to (e.g. ["pricing.acme.com", "github.com"]).',
              },
            },
            required: ['query'],
          },
        },
      },
    ];
  }

  async executeWebSearch(
    toolCallId: string,
    argsString: string
  ): Promise<ToolExecutionResult> {
    let parsedArgs: WebSearchParams;
    try {
      parsedArgs = JSON.parse(argsString);
    } catch {
      return {
        toolCallId,
        name: 'web_search',
        arguments: {},
        content: JSON.stringify({ error: 'Invalid JSON arguments supplied to web_search' }),
        sources: [],
        rawResults: [],
      };
    }

    if (!parsedArgs.query || typeof parsedArgs.query !== 'string') {
      return {
        toolCallId,
        name: 'web_search',
        arguments: parsedArgs as unknown as Record<string, unknown>,
        content: JSON.stringify({ error: 'Search query must be a non-empty string' }),
        sources: [],
        rawResults: [],
      };
    }

    if (!this.canSearch()) {
      return {
        toolCallId,
        name: 'web_search',
        arguments: parsedArgs as unknown as Record<string, unknown>,
        content: JSON.stringify({
          error: 'Search rate limit reached for this interaction. Synthesize with available evidence.',
        }),
        sources: [],
        rawResults: [],
      };
    }

    this.searchCount++;

    const rawResults = await this.searchService.search({
      query: parsedArgs.query.trim(),
      recency_days: parsedArgs.recency_days,
      domains: parsedArgs.domains,
    });

    const queryTerms = parsedArgs.query.split(/\s+/).filter(Boolean);
    const ranked = rankSearchResults(rawResults, queryTerms);

    const convertedSources: Source[] = ranked.map(webResultToSource);
    const uniqueSources = deduplicateSources(convertedSources);

    // Prepare bounded evidence for LLM prompt context
    const evidencePayload = ranked.slice(0, 6).map((item) => ({
      title: item.title,
      url: item.url,
      domain: item.domain,
      snippet: item.content.slice(0, 750),
      publishedDate: item.publishedDate,
    }));

    return {
      toolCallId,
      name: 'web_search',
      arguments: parsedArgs as unknown as Record<string, unknown>,
      content: JSON.stringify({
        query: parsedArgs.query,
        resultCount: ranked.length,
        evidence: evidencePayload,
      }),
      sources: uniqueSources,
      rawResults: ranked,
    };
  }
}
