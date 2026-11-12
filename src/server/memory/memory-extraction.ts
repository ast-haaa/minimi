import { repository } from '../database/repository.js';
import type { ExtractedEntity, ExtractedFact } from '../../shared/types.js';

/**
 * Extract and persist entities and facts from a conversation message.
 * Called after the assistant generates a response.
 */
export function extractAndPersist(
  conversationId: string,
  messageId: string,
  content: string,
  role: 'user' | 'assistant',
  extractedEntities?: ExtractedEntity[],
  extractedFacts?: ExtractedFact[]
): void {
  try {
    // Process explicitly extracted entities
    if (extractedEntities && extractedEntities.length > 0) {
      for (const entity of extractedEntities) {
        const saved = repository.upsertEntity({
          name: entity.name,
          type: entity.type,
          aliases: entity.aliases,
        });
        repository.linkEntityToConversation(conversationId, saved.id, role);
      }
    }

    // Process explicitly extracted facts
    if (extractedFacts && extractedFacts.length > 0) {
      for (const fact of extractedFacts) {
        // Find or create entity for this fact
        let entityId: string | undefined;
        if (fact.entityName) {
          const entity = repository.findEntity(fact.entityName);
          if (entity) {
            entityId = entity.id;
          } else {
            const saved = repository.upsertEntity({
              name: fact.entityName,
              type: 'product', // default
            });
            entityId = saved.id;
            repository.linkEntityToConversation(conversationId, saved.id, 'fact_source');
          }
        }

        repository.addFact({
          conversationId,
          messageId,
          entityId,
          factType: fact.factType,
          factValue: fact.factValue,
          currency: fact.currency,
          billingInterval: fact.billingInterval,
          planName: fact.planName,
          observedAt: fact.observedAt || new Date().toISOString(),
          confidence: fact.confidence,
          sourceType: fact.sourceType,
        });
      }
    }
  } catch (error) {
    console.error('Failed to extract and persist metadata:', error);
    // Non-critical: don't throw
  }
}

/**
 * Generate a conversation title from the first user message.
 */
export function generateTitle(firstMessage: string): string {
  // Truncate and clean
  const cleaned = firstMessage
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned.length <= 60) return cleaned;
  
  // Try to cut at a word boundary
  const truncated = cleaned.slice(0, 60);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 30) {
    return truncated.slice(0, lastSpace) + '…';
  }
  return truncated + '…';
}
