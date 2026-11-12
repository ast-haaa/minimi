import { describe, it, expect } from 'vitest';
import { repository } from '../../src/server/database/repository.js';

describe('Chat Storage & Lifecycle Integration', () => {
  it('creates and lists conversations', () => {
    const conv = repository.createConversation(undefined, 'Integration Test Session');
    expect(conv.id).toBeDefined();
    expect(conv.title).toBe('Integration Test Session');

    const list = repository.listConversations();
    const found = list.find((c) => c.id === conv.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Integration Test Session');
  });

  it('persists user and assistant messages with sources and metadata', () => {
    const conv = repository.createConversation(undefined, 'Persistence Test');

    const userMsg = repository.addMessage({
      conversationId: conv.id,
      role: 'user',
      content: 'Can you compare Neon and Supabase?',
    });

    const assistantMsg = repository.addMessage({
      conversationId: conv.id,
      role: 'assistant',
      content: 'Here is the comparison between Neon and Supabase based on live web search.',
      metadata: {
        processingTimeMs: 120,
        searchQueries: ['web_search'],
      },
      sources: [
        {
          title: 'Neon Documentation',
          url: 'https://neon.tech/docs',
          domain: 'neon.tech',
          retrievedAt: new Date().toISOString(),
          sourceType: 'documentation',
        },
      ],
    });

    const history = repository.getMessages(conv.id);
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('assistant');
    expect(history[1].sources).toHaveLength(1);
    expect(history[1].sources![0].domain).toBe('neon.tech');
  });

  it('restores conversation history on refresh/reload', () => {
    const conv = repository.createConversation(undefined, 'Reload Test');
    repository.addMessage({
      conversationId: conv.id,
      role: 'user',
      content: 'Question 1',
    });
    repository.addMessage({
      conversationId: conv.id,
      role: 'assistant',
      content: 'Answer 1',
    });

    // Simulate page refresh by fetching conversation afresh
    const fetched = repository.getConversation(conv.id);
    const messages = repository.getMessages(conv.id);

    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Reload Test');
    expect(messages).toHaveLength(2);
  });

  it('cascades deletion cleanly when conversation is deleted', () => {
    const conv = repository.createConversation(undefined, 'To Be Deleted');
    const msg = repository.addMessage({
      conversationId: conv.id,
      role: 'user',
      content: 'Ephemeral message',
    });

    const deleted = repository.deleteConversation(conv.id);
    expect(deleted).toBe(true);

    const fetchedConv = repository.getConversation(conv.id);
    expect(fetchedConv).toBeNull();

    const fetchedMsg = repository.getMessage(msg.id);
    expect(fetchedMsg).toBeNull();
  });
});
