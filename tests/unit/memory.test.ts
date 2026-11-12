import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '../../src/server/database/repository.js';
import { retrieveMemory } from '../../src/server/memory/memory-retrieval.js';
import { extractAndPersist } from '../../src/server/memory/memory-extraction.js';

describe('Conversation Memory & Retrieval Engine', () => {
  beforeEach(() => {
    // Clear existing data by creating a clean slate or unique entities
  });

  it('returns no memory when none exists', async () => {
    const result = await retrieveMemory('Quantum Supercomputer X99', 'none-conv');
    expect(result.references.length).toBe(0);
    expect(result.relevantFacts.length).toBe(0);
  });

  it('retrieves an earlier conversation by exact date (e.g. November 3)', async () => {
    // Insert conversation from November 3
    const conv = repository.createConversation(undefined, 'CRM tools discussion');
    const pastDate = '2026-11-03T10:00:00.000Z';
    
    // Add message with past date
    const msg = repository.addMessage({
      conversationId: conv.id,
      role: 'user',
      content: 'We shortlisted five CRM tools for our 20-person sales team.',
    });

    // Update message timestamp to November 3
    const db = (repository as any).getDb ? (repository as any).getDb() : (await import('../../src/server/database/connection.js')).getDb();
    db.prepare('UPDATE messages SET created_at = ? WHERE id = ?').run(pastDate, msg.id);
    db.prepare('UPDATE conversations SET created_at = ?, updated_at = ? WHERE id = ?').run(pastDate, pastDate, conv.id);

    const result = await retrieveMemory('What did I ask you on November 3?', 'other-conv');
    expect(result.relevantMessages.length).toBeGreaterThan(0);
    const matched = result.relevantMessages.find((m) => m.content.includes('CRM tools'));
    expect(matched).toBeDefined();
  });

  it('retrieves a conversation using product names', async () => {
    const conv = repository.createConversation(undefined, 'Postgres hosting discussion');
    
    // Persist entity and fact
    const entity = repository.upsertEntity({
      name: 'Supabase',
      type: 'product',
      aliases: ['supabase-db'],
    });
    repository.linkEntityToConversation(conv.id, entity.id, 'shortlisted');

    repository.addFact({
      conversationId: conv.id,
      entityId: entity.id,
      factType: 'price',
      factValue: '25',
      currency: 'USD',
      billingInterval: 'month',
      planName: 'Pro',
      observedAt: '2026-11-01T12:00:00.000Z',
      confidence: 'high',
      sourceType: 'user_stated',
    });

    const result = await retrieveMemory('What was the price of Supabase earlier?', 'new-session');
    expect(result.references.length).toBeGreaterThan(0);
    const fact = result.relevantFacts.find((f) => f.entityName.toLowerCase().includes('supabase'));
    expect(fact).toBeDefined();
    expect(fact?.factValue).toBe('25');
  });

  it('resolves a follow-up referring to previously discussed products', async () => {
    const conv = repository.createConversation(undefined, 'Vector Database Research');
    const entity = repository.upsertEntity({
      name: 'Pinecone',
      type: 'product',
    });
    repository.linkEntityToConversation(conv.id, entity.id);

    repository.addFact({
      conversationId: conv.id,
      entityId: entity.id,
      factType: 'price',
      factValue: '70',
      currency: 'USD',
      billingInterval: 'month',
      planName: 'Standard',
      observedAt: '2026-11-05T12:00:00.000Z',
    });

    const result = await retrieveMemory('How much did that Pinecone plan cost?', 'active-conv');
    expect(result.relevantFacts.some((f) => f.entityName === 'Pinecone')).toBe(true);
  });

  it('retrieves relevant facts from multiple previous conversations', async () => {
    // Conversation 1: HubSpot
    const conv1 = repository.createConversation(undefined, 'Hubspot Review');
    const ent1 = repository.upsertEntity({ name: 'HubSpot', type: 'product' });
    repository.linkEntityToConversation(conv1.id, ent1.id);
    repository.addFact({
      conversationId: conv1.id,
      entityId: ent1.id,
      factType: 'price',
      factValue: '500',
      currency: 'USD',
      observedAt: '2026-10-20T10:00:00.000Z',
    });

    // Conversation 2: Salesforce
    const conv2 = repository.createConversation(undefined, 'Salesforce Review');
    const ent2 = repository.upsertEntity({ name: 'Salesforce', type: 'product' });
    repository.linkEntityToConversation(conv2.id, ent2.id);
    repository.addFact({
      conversationId: conv2.id,
      entityId: ent2.id,
      factType: 'price',
      factValue: '1250',
      currency: 'USD',
      observedAt: '2026-10-22T10:00:00.000Z',
    });

    // Retrieve across both
    const result1 = await retrieveMemory('What did we find for HubSpot earlier?');
    const result2 = await retrieveMemory('What was the Salesforce price?');

    expect(result1.relevantFacts.some((f) => f.entityName === 'HubSpot')).toBe(true);
    expect(result2.relevantFacts.some((f) => f.entityName === 'Salesforce')).toBe(true);
  });
});

