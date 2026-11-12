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

  it('persists pinned state and sorts pinned conversations first', () => {
    const conv1 = repository.createConversation(undefined, 'Normal Conversation A');
    const conv2 = repository.createConversation(undefined, 'Important Pinned Conversation');
    const conv3 = repository.createConversation(undefined, 'Normal Conversation B');

    // Default pin status is false
    expect(conv1.isPinned).toBe(false);
    expect(conv2.isPinned).toBe(false);

    // Pin conv2
    const pinSuccess = repository.updateConversationPin(conv2.id, true);
    expect(pinSuccess).toBe(true);

    const reloadedConv2 = repository.getConversation(conv2.id);
    expect(reloadedConv2?.isPinned).toBe(true);

    // listConversations should return pinned conversation first
    const list = repository.listConversations();
    const conv2Item = list.find((c) => c.id === conv2.id);
    expect(conv2Item?.isPinned).toBe(true);

    // The first item in the list must be pinned
    expect(list[0].id).toBe(conv2.id);

    // Unpin conv2
    repository.updateConversationPin(conv2.id, false);
    const unpinnedConv2 = repository.getConversation(conv2.id);
    expect(unpinnedConv2?.isPinned).toBe(false);
  });

  it('renames conversation and persists title cleanly', () => {
    const conv = repository.createConversation(undefined, 'Initial Title');
    expect(conv.title).toBe('Initial Title');

    const renameSuccess = repository.updateConversationTitle(conv.id, 'Renamed Research Session');
    expect(renameSuccess).toBe(true);

    const reloaded = repository.getConversation(conv.id);
    expect(reloaded?.title).toBe('Renamed Research Session');
  });
});

