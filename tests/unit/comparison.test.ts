import { describe, it, expect } from 'vitest';
import { compareHistoricalWithCurrent } from '../../src/server/comparison/temporal-comparison.js';
import type { ExtractedFact, WebSearchResult } from '../../src/shared/types.js';

describe('Temporal Comparison & Change Classification Engine', () => {
  const baseDate = '2026-11-01T12:00:00.000Z';

  it('detects a price increase correctly', () => {
    const historicalFacts: ExtractedFact[] = [
      {
        entityName: 'CloudDB Pro',
        factType: 'price',
        factValue: '20',
        currency: 'USD',
        billingInterval: 'month',
        planName: 'Pro',
        observedAt: baseDate,
        confidence: 'high',
        sourceType: 'user_stated',
      },
    ];

    const currentSearchResults: WebSearchResult[] = [
      {
        title: 'CloudDB Pro Pricing',
        url: 'https://clouddb.io/pricing',
        domain: 'clouddb.io',
        content: 'CloudDB Pro tier now starts at $29 per month with upgraded memory.',
        score: 0.9,
        publishedDate: '2026-11-10',
      },
    ];

    const comparisons = compareHistoricalWithCurrent(
      historicalFacts,
      currentSearchResults,
      'CloudDB Pro'
    );

    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].changeType).toBe('price_increased');
    expect(comparisons[0].historical?.value).toBe('20');
    expect(comparisons[0].current?.value).toBe('29');
  });

  it('detects a price decrease correctly', () => {
    const historicalFacts: ExtractedFact[] = [
      {
        entityName: 'VectorStore',
        factType: 'price',
        factValue: '99',
        currency: 'USD',
        billingInterval: 'month',
        planName: 'Standard',
        observedAt: baseDate,
        confidence: 'high',
        sourceType: 'user_stated',
      },
    ];

    const currentSearchResults: WebSearchResult[] = [
      {
        title: 'VectorStore Standard Tier Update',
        url: 'https://vectorstore.com/pricing',
        domain: 'vectorstore.com',
        content: 'We reduced VectorStore Standard to just $79 per month.',
        score: 0.9,
      },
    ];

    const comparisons = compareHistoricalWithCurrent(
      historicalFacts,
      currentSearchResults,
      'VectorStore'
    );

    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].changeType).toBe('price_decreased');
    expect(comparisons[0].current?.value).toBe('79');
  });

  it('detects no verified change when prices are identical', () => {
    const historicalFacts: ExtractedFact[] = [
      {
        entityName: 'AuthService',
        factType: 'price',
        factValue: '49',
        currency: 'USD',
        billingInterval: 'month',
        planName: 'Developer',
        observedAt: baseDate,
        confidence: 'high',
        sourceType: 'user_stated',
      },
    ];

    const currentSearchResults: WebSearchResult[] = [
      {
        title: 'AuthService Plans',
        url: 'https://authservice.com/pricing',
        domain: 'authservice.com',
        content: 'AuthService Developer edition remains $49 per month.',
        score: 0.9,
      },
    ];

    const comparisons = compareHistoricalWithCurrent(
      historicalFacts,
      currentSearchResults,
      'AuthService'
    );

    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].changeType).toBe('no_verified_change');
  });

  it('classifies as unable_to_verify when current web information cannot be found', () => {
    const historicalFacts: ExtractedFact[] = [
      {
        entityName: 'NicheTool',
        factType: 'price',
        factValue: '15',
        currency: 'USD',
        billingInterval: 'month',
        observedAt: baseDate,
        confidence: 'high',
        sourceType: 'user_stated',
      },
    ];

    // Search yields no relevant pricing content
    const currentSearchResults: WebSearchResult[] = [
      {
        title: 'Unrelated Blog Post',
        url: 'https://blog.example.com/tips',
        domain: 'blog.example.com',
        content: '10 productivity tips for developers.',
        score: 0.2,
      },
    ];

    const comparisons = compareHistoricalWithCurrent(
      historicalFacts,
      currentSearchResults,
      'NicheTool'
    );

    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].changeType).toBe('unable_to_verify');
    expect(comparisons[0].current).toBeNull();
  });

  it('detects pricing structure changed when billing intervals differ (annual vs monthly)', () => {
    const historicalFacts: ExtractedFact[] = [
      {
        entityName: 'WorkFlowApp',
        factType: 'price',
        factValue: '100',
        currency: 'USD',
        billingInterval: 'month',
        planName: 'Team',
        observedAt: baseDate,
        confidence: 'high',
        sourceType: 'user_stated',
      },
    ];

    const currentSearchResults: WebSearchResult[] = [
      {
        title: 'WorkFlowApp Pricing',
        url: 'https://workflowapp.io/pricing',
        domain: 'workflowapp.io',
        content: 'WorkFlowApp Team is billed at $1000 per year (annually only).',
        score: 0.9,
      },
    ];

    const comparisons = compareHistoricalWithCurrent(
      historicalFacts,
      currentSearchResults,
      'WorkFlowApp'
    );

    expect(comparisons).toHaveLength(1);
    expect(comparisons[0].changeType).toBe('pricing_structure_changed');
  });
});
