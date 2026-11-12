import type { TemporalComparison, TemporalDataPoint, ChangeClassification, ExtractedFact, WebSearchResult } from '../../shared/types.js';

/**
 * Compare historical facts from memory with current information from web search.
 */
export function compareHistoricalWithCurrent(
  historicalFacts: ExtractedFact[],
  currentSearchResults: WebSearchResult[],
  entityName: string
): TemporalComparison[] {
  const comparisons: TemporalComparison[] = [];

  // Group historical facts by type and plan
  const factGroups = groupFacts(historicalFacts, entityName);

  for (const [key, facts] of factGroups.entries()) {
    const latestFact = facts[0]; // Already sorted desc by date
    
    const historical: TemporalDataPoint = {
      value: latestFact.factValue,
      observedAt: latestFact.observedAt,
      source: `Previous conversation`,
      sourceType: 'conversation_memory',
      currency: latestFact.currency,
      billingInterval: latestFact.billingInterval,
      planName: latestFact.planName,
    };

    // Try to find corresponding current info from search results
    const current = findCurrentInfo(latestFact, currentSearchResults);
    
    const changeType = classifyChange(historical, current, latestFact.factType);

    comparisons.push({
      entityName: latestFact.entityName,
      attribute: buildAttributeLabel(latestFact),
      historical,
      current,
      changeType,
      confidence: current ? 'medium' : 'low',
      notes: current ? undefined : 'Current information could not be verified from web search results.',
    });
  }

  return comparisons;
}

function groupFacts(facts: ExtractedFact[], entityName: string): Map<string, ExtractedFact[]> {
  const groups = new Map<string, ExtractedFact[]>();
  
  const relevant = facts.filter(f => 
    f.entityName.toLowerCase().includes(entityName.toLowerCase()) ||
    entityName.toLowerCase().includes(f.entityName.toLowerCase())
  );

  for (const fact of relevant) {
    const key = `${fact.factType}:${fact.planName || 'default'}`;
    const group = groups.get(key) || [];
    group.push(fact);
    groups.set(key, group);
  }

  // Sort each group by date desc
  for (const [key, group] of groups.entries()) {
    groups.set(key, group.sort((a, b) => b.observedAt.localeCompare(a.observedAt)));
  }

  return groups;
}

function findCurrentInfo(fact: ExtractedFact, searchResults: WebSearchResult[]): TemporalDataPoint | null {
  if (searchResults.length === 0) return null;

  // Search through results for matching information
  const entityLower = fact.entityName.toLowerCase();
  const relevantResults = searchResults.filter(r => {
    const text = (r.title + ' ' + r.content).toLowerCase();
    return text.includes(entityLower);
  });

  if (relevantResults.length === 0) return null;

  // For pricing facts, try to extract price from search results
  if (fact.factType === 'price') {
    for (const result of relevantResults) {
      const priceMatch = extractPrice(result.content, fact.planName);
      if (priceMatch) {
        return {
          value: priceMatch.value,
          observedAt: new Date().toISOString(),
          source: result.url,
          sourceType: 'web_search',
          currency: priceMatch.currency || fact.currency,
          billingInterval: priceMatch.billingInterval || fact.billingInterval,
          planName: fact.planName,
        };
      }
    }
  }

  // For non-price facts, return the best matching result as context
  const bestResult = relevantResults[0];
  return {
    value: bestResult.content.slice(0, 300),
    observedAt: new Date().toISOString(),
    source: bestResult.url,
    sourceType: 'web_search',
  };
}

function extractPrice(content: string, planName?: string): { value: string; currency?: string; billingInterval?: string } | null {
  // Look for price patterns near the plan name if specified
  const searchText = planName 
    ? extractSurroundingText(content, planName, 200)
    : content;

  if (!searchText) return null;

  // Match common price patterns
  const pricePatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/?\s*(mo(?:nth)?|yr|year|annually|monthly|per\s+month|per\s+year|per\s+user))?/i,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP)\s*(?:\/?\s*(mo(?:nth)?|yr|year|annually|monthly))?/i,
    /€(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/?\s*(mo(?:nth)?|yr|year|annually|monthly))?/i,
    /£(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/?\s*(mo(?:nth)?|yr|year|annually|monthly))?/i,
  ];

  for (const pattern of pricePatterns) {
    const match = searchText.match(pattern);
    if (match) {
      const billingStr = match[2]?.toLowerCase() || '';
      let billingInterval: string | undefined;
      if (/mo|month/i.test(billingStr)) billingInterval = 'month';
      else if (/yr|year|annual/i.test(billingStr)) billingInterval = 'year';
      
      let currency = 'USD';
      if (searchText.includes('€')) currency = 'EUR';
      else if (searchText.includes('£')) currency = 'GBP';

      return {
        value: match[1].replace(/,/g, ''),
        currency,
        billingInterval,
      };
    }
  }

  return null;
}

function extractSurroundingText(content: string, target: string, radius: number): string | null {
  const idx = content.toLowerCase().indexOf(target.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + target.length + radius);
  return content.slice(start, end);
}

function classifyChange(
  historical: TemporalDataPoint,
  current: TemporalDataPoint | null,
  factType: string
): ChangeClassification {
  if (!current) return 'unable_to_verify';
  
  if (factType === 'price') {
    const oldPrice = parseFloat(historical.value.replace(/[^0-9.]/g, ''));
    const newPrice = parseFloat(current.value.replace(/[^0-9.]/g, ''));

    if (isNaN(oldPrice) || isNaN(newPrice)) return 'unable_to_verify';

    // Check if billing intervals match
    if (historical.billingInterval && current.billingInterval && 
        historical.billingInterval !== current.billingInterval) {
      return 'pricing_structure_changed';
    }

    if (newPrice > oldPrice) return 'price_increased';
    if (newPrice < oldPrice) return 'price_decreased';
    return 'no_verified_change';
  }

  if (factType === 'feature' || factType === 'version') {
    if (historical.value !== current.value) return 'major_feature_shipped';
    return 'no_verified_change';
  }

  return 'unable_to_verify';
}

function buildAttributeLabel(fact: ExtractedFact): string {
  let label = fact.factType;
  if (fact.planName) label += ` (${fact.planName})`;
  if (fact.billingInterval) label += ` per ${fact.billingInterval}`;
  return label;
}
