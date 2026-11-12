import type { Message, MemoryReference, ExtractedFact } from '../../shared/types.js';

export interface RankedContext {
  summary: string;
  messages: Message[];
  facts: ExtractedFact[];
  references: MemoryReference[];
}

/**
 * Rank and select the most relevant context to pass to the LLM.
 * Limits total context size to avoid token waste.
 */
export function rankAndSelectContext(
  recentMessages: Message[],
  memoryMessages: Message[],
  memoryFacts: ExtractedFact[],
  memoryReferences: MemoryReference[],
  maxContextTokens: number = 4000
): RankedContext {
  // Estimate tokens (~4 chars per token)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);
  let tokenBudget = maxContextTokens;

  // 1. Always include recent conversation context (highest priority)
  const selectedRecent: Message[] = [];
  for (const msg of recentMessages.slice(-8)) {
    const cost = estimateTokens(msg.content);
    if (tokenBudget - cost > 500) { // Reserve space for memory
      selectedRecent.push(msg);
      tokenBudget -= cost;
    }
  }

  // 2. Include most relevant facts
  const selectedFacts = memoryFacts.slice(0, 10).filter(f => {
    const cost = estimateTokens(`${f.entityName}: ${f.factType} = ${f.factValue}`);
    if (tokenBudget - cost > 200) {
      tokenBudget -= cost;
      return true;
    }
    return false;
  });

  // 3. Include most relevant historical messages
  const selectedMemory: Message[] = [];
  // Sort by relevance score (from references)
  const messageScores = new Map<string, number>();
  for (const ref of memoryReferences) {
    if (ref.messageId) {
      messageScores.set(ref.messageId, ref.relevanceScore);
    }
  }

  const scoredMemory = memoryMessages
    .filter(m => !selectedRecent.find(r => r.id === m.id))
    .map(m => ({ msg: m, score: messageScores.get(m.id) || 0.5 }))
    .sort((a, b) => b.score - a.score);

  for (const { msg } of scoredMemory) {
    const cost = estimateTokens(msg.content);
    if (tokenBudget - cost > 0) {
      selectedMemory.push(msg);
      tokenBudget -= cost;
    }
    if (selectedMemory.length >= 8) break;
  }

  // Build summary for the LLM
  const summaryParts: string[] = [];

  if (memoryReferences.length > 0) {
    summaryParts.push(`Found ${memoryReferences.length} related previous conversation(s).`);
  }

  if (selectedFacts.length > 0) {
    summaryParts.push('Relevant facts from previous conversations:');
    for (const fact of selectedFacts) {
      let factLine = `- ${fact.entityName}: ${fact.factType} = ${fact.factValue}`;
      if (fact.currency) factLine += ` (${fact.currency})`;
      if (fact.billingInterval) factLine += ` per ${fact.billingInterval}`;
      if (fact.planName) factLine += ` [${fact.planName}]`;
      factLine += ` (observed: ${fact.observedAt})`;
      summaryParts.push(factLine);
    }
  }

  if (selectedMemory.length > 0) {
    summaryParts.push('\nRelevant messages from previous conversations:');
    for (const msg of selectedMemory) {
      summaryParts.push(`[${msg.createdAt}] ${msg.role}: ${msg.content.slice(0, 300)}`);
    }
  }

  return {
    summary: summaryParts.join('\n'),
    messages: [...selectedRecent, ...selectedMemory],
    facts: selectedFacts,
    references: memoryReferences,
  };
}
