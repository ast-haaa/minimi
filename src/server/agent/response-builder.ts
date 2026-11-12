import type { Source, TemporalComparison } from '../../shared/types.js';

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function formatSourcesSection(sources: Source[]): string {
  if (!sources || sources.length === 0) return '';

  const rows = sources.map((s, idx) => {
    const domain = s.domain || new URL(s.url).hostname.replace(/^www\./, '');
    const dateStr = s.publishedDate ? ` (${new Date(s.publishedDate).toLocaleDateString()})` : '';
    return `${idx + 1}. [${s.title || domain}](${s.url})${dateStr}`;
  });

  return `\n\n### Sources\n${rows.join('\n')}`;
}

export function formatComparisonMarkdown(comparisons: TemporalComparison[]): string {
  if (!comparisons || comparisons.length === 0) return '';

  const lines: string[] = ['\n\n### Historical vs. Current Comparison\n'];
  lines.push('| Entity | Attribute | Previous (Observed) | Current (Verified) | Status |');
  lines.push('| :--- | :--- | :--- | :--- | :--- |');

  for (const c of comparisons) {
    const prevText = c.historical
      ? `${c.historical.value}${c.historical.currency ? ' ' + c.historical.currency : ''} (${new Date(c.historical.observedAt).toLocaleDateString()})`
      : 'No previous record';

    const currText = c.current
      ? `${c.current.value}${c.current.currency ? ' ' + c.current.currency : ''}`
      : 'Unverified';

    const statusBadge = getStatusLabel(c.changeType);

    lines.push(`| **${c.entityName}** | ${c.attribute} | ${prevText} | ${currText} | ${statusBadge} |`);
  }

  return lines.join('\n');
}

function getStatusLabel(type: TemporalComparison['changeType']): string {
  switch (type) {
    case 'price_increased':
      return '🔺 Price Increased';
    case 'price_decreased':
      return '🟢 Price Decreased';
    case 'pricing_structure_changed':
      return '🔄 Structure Changed';
    case 'new_plan_introduced':
      return '✨ New Plan';
    case 'plan_discontinued':
      return '❌ Plan Retired';
    case 'major_feature_shipped':
      return '🚀 Major Feature';
    case 'minor_feature_shipped':
      return '⚡ Minor Update';
    case 'no_verified_change':
      return '⏸️ No Change Found';
    case 'unable_to_verify':
      return '❓ Unverified';
    case 'product_discontinued':
      return '⚠️ Discontinued';
    case 'product_renamed':
      return '🏷️ Renamed';
    default:
      return 'Unverified';
  }
}

