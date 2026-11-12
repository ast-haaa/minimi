import type { ChangeClassification, TemporalComparison } from '../../shared/types.js';

/**
 * Format comparison results for display in assistant responses.
 */
export function formatComparisonsForDisplay(comparisons: TemporalComparison[]): string {
  if (comparisons.length === 0) return '';

  const sections: string[] = [];
  
  // Group by entity
  const byEntity = new Map<string, TemporalComparison[]>();
  for (const c of comparisons) {
    const group = byEntity.get(c.entityName) || [];
    group.push(c);
    byEntity.set(c.entityName, group);
  }

  for (const [entity, entityComparisons] of byEntity.entries()) {
    sections.push(`### ${entity}`);
    
    for (const comp of entityComparisons) {
      const icon = getChangeIcon(comp.changeType);
      sections.push(`${icon} **${comp.attribute}**`);
      
      if (comp.historical) {
        let histLine = `  - Previously: ${comp.historical.value}`;
        if (comp.historical.currency) histLine += ` ${comp.historical.currency}`;
        histLine += ` (observed ${formatDate(comp.historical.observedAt)})`;
        sections.push(histLine);
      } else {
        sections.push('  - Previously: No historical data');
      }

      if (comp.current) {
        let currLine = `  - Currently: ${comp.current.value}`;
        if (comp.current.currency) currLine += ` ${comp.current.currency}`;
        sections.push(currLine);
      } else {
        sections.push('  - Currently: Unable to verify');
      }

      sections.push(`  - Status: ${getChangeLabel(comp.changeType)}`);
      
      if (comp.notes) {
        sections.push(`  - ⚠️ ${comp.notes}`);
      }
    }
  }

  return sections.join('\n');
}

function getChangeIcon(change: ChangeClassification): string {
  switch (change) {
    case 'price_increased': return '🔴';
    case 'price_decreased': return '🟢';
    case 'pricing_structure_changed': return '🟡';
    case 'new_plan_introduced': return '🆕';
    case 'plan_discontinued': return '⛔';
    case 'major_feature_shipped': return '🚀';
    case 'minor_feature_shipped': return '✨';
    case 'no_verified_change': return '✅';
    case 'unable_to_verify': return '❓';
    case 'product_discontinued': return '🛑';
    case 'product_renamed': return '📝';
    default: return '•';
  }
}

export function getChangeLabel(change: ChangeClassification): string {
  switch (change) {
    case 'price_increased': return 'Price Increased';
    case 'price_decreased': return 'Price Decreased';
    case 'pricing_structure_changed': return 'Pricing Structure Changed';
    case 'new_plan_introduced': return 'New Plan Introduced';
    case 'plan_discontinued': return 'Plan Discontinued';
    case 'major_feature_shipped': return 'Major Feature Released';
    case 'minor_feature_shipped': return 'Minor Feature Released';
    case 'no_verified_change': return 'No Verified Change';
    case 'unable_to_verify': return 'Unable to Verify';
    case 'product_discontinued': return 'Product Discontinued';
    case 'product_renamed': return 'Product Renamed';
    default: return 'Unknown';
  }
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}

/**
 * Detect if a query is asking for temporal comparison.
 */
export function isTemporalComparisonQuery(query: string): boolean {
  const patterns = [
    /\bchanged?\b/i,
    /\bsince\s+(our|last|previous|we)/i,
    /\bstill\s+(correct|true|valid|accurate|the same|current)/i,
    /\bcompare\b.*\b(old|new|previous|current|before|after)/i,
    /\bupdate[ds]?\b/i,
    /\bnew\s+(pric|featur|version|releas)/i,
    /\bdifference\b/i,
    /\bhas\s+(any|anything)\b.*\bchanged\b/i,
    /\bwhat.?s?\s+new\b/i,
    /\bpric(e|ing)\s+(change|increase|decrease|update)/i,
    /\brecheck\b/i,
  ];
  return patterns.some(p => p.test(query));
}
