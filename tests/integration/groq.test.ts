import { describe, it, expect, vi, beforeEach } from 'vitest';
import OpenAI from 'openai';
import { AgentOrchestrator } from '../../src/server/agent/orchestrator.js';
import { repository } from '../../src/server/database/repository.js';
import type { Source } from '../../src/shared/types.js';

describe('Groq Integration & Orchestrator Compatibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('configures OpenAI SDK with Groq baseURL and GROQ_API_KEY', () => {
    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_test_groq_key_123',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
      timezone: 'UTC',
    });

    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    expect(openaiClient.baseURL).toBe('https://api.groq.com/openai/v1');
    expect(openaiClient.apiKey).toBe('gsk_test_groq_key_123');
  });

  it('handles normal conversational response from Groq endpoint', async () => {
    const conv = repository.createConversation(undefined, 'Groq Test Conv');

    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_test_groq_key_123',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
    });

    // Mock chat completion create
    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    vi.spyOn(openaiClient.chat.completions, 'create').mockResolvedValueOnce({
      id: 'chatcmpl-groq-1',
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'Hello! I am Minimi running on Groq. How can I help you research today?',
          },
        },
      ],
      created: Date.now(),
      model: 'openai/gpt-oss-120b',
      object: 'chat.completion',
    } as unknown as OpenAI.Chat.ChatCompletion);

    let streamTokens = '';
    let completedContent = '';

    await orchestrator.processMessage(conv.id, 'Hello', {
      onToken: (t) => {
        streamTokens += t;
      },
      onComplete: (content) => {
        completedContent = content;
      },
      onError: (err) => {
        throw err;
      },
    });

    expect(completedContent).toContain('Minimi running on Groq');
    expect(streamTokens).toContain('Minimi running on Groq');
  });

  it('handles function calling with web_search and multi-turn tool execution', async () => {
    const conv = repository.createConversation(undefined, 'Groq Tool Call Test');

    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_test_groq_key_123',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
    });

    // Mock search tool handler
    const toolHandler = (orchestrator as any).toolHandler;
    vi.spyOn(toolHandler, 'executeWebSearch').mockResolvedValueOnce({
      toolCallId: 'call_groq_web_1',
      name: 'web_search',
      arguments: { query: 'Neon postgres pricing 2026' },
      content: JSON.stringify({
        resultCount: 1,
        evidence: [
          {
            title: 'Neon Serverless Postgres Pricing',
            url: 'https://neon.tech/pricing',
            domain: 'neon.tech',
            snippet: 'Neon Launch tier is $19/mo, Scale tier is $69/mo.',
          },
        ],
      }),
      sources: [
        {
          title: 'Neon Serverless Postgres Pricing',
          url: 'https://neon.tech/pricing',
          domain: 'neon.tech',
          retrievedAt: new Date().toISOString(),
          sourceType: 'official',
        },
      ],
      rawResults: [
        {
          title: 'Neon Serverless Postgres Pricing',
          url: 'https://neon.tech/pricing',
          domain: 'neon.tech',
          content: 'Neon Launch tier is $19/mo, Scale tier is $69/mo.',
          score: 0.95,
        },
      ],
    });

    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    const createSpy = vi.spyOn(openaiClient.chat.completions, 'create');

    // Turn 1: Groq calls web_search tool
    createSpy.mockResolvedValueOnce({
      id: 'chatcmpl-groq-tool-1',
      choices: [
        {
          index: 0,
          finish_reason: 'tool_calls',
          message: {
            role: 'assistant',
            content: null,
            tool_calls: [
              {
                id: 'call_groq_web_1',
                type: 'function',
                function: {
                  name: 'web_search',
                  arguments: JSON.stringify({ query: 'Neon postgres pricing 2026' }),
                },
              },
            ],
          },
        },
      ],
      created: Date.now(),
      model: 'openai/gpt-oss-120b',
      object: 'chat.completion',
    } as unknown as OpenAI.Chat.ChatCompletion);

    // Turn 2: Groq receives tool results and completes with synthesis
    createSpy.mockResolvedValueOnce({
      id: 'chatcmpl-groq-tool-2',
      choices: [
        {
          index: 0,
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content:
              'Based on current web evidence, Neon Postgres offers Launch tier at $19/mo and Scale tier at $69/mo.',
          },
        },
      ],
      created: Date.now(),
      model: 'openai/gpt-oss-120b',
      object: 'chat.completion',
    } as unknown as OpenAI.Chat.ChatCompletion);

    let completedContent = '';
    let sourcesReceived: Source[] = [];

    await orchestrator.processMessage(conv.id, 'What is Neon pricing now?', {
      onToken: () => {},
      onComplete: (content, sources) => {
        completedContent = content;
        sourcesReceived = sources;
      },
      onError: (err) => {
        throw err;
      },
    });

    expect(createSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(completedContent).toContain('Neon Postgres');
    expect(completedContent).toContain('$19/mo');
    expect(sourcesReceived.some((s) => s.domain === 'neon.tech')).toBe(true);
  });

  it('handles streaming chunks from Groq correctly', async () => {
    const conv = repository.createConversation(undefined, 'Groq Streaming Test');

    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_test_groq_key_123',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
    });

    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    const createSpy = vi.spyOn(openaiClient.chat.completions, 'create');

    // Create an async iterable stream
    async function* mockStream() {
      yield { choices: [{ delta: { content: 'Streaming ' } }] };
      yield { choices: [{ delta: { content: 'from ' } }] };
      yield { choices: [{ delta: { content: 'Groq ' } }] };
      yield { choices: [{ delta: { content: 'endpoint.' } }] };
    }

    // Force streaming by setting search count to max or mock last loop
    createSpy.mockResolvedValueOnce(mockStream() as unknown as any);

    const toolHandler = (orchestrator as any).toolHandler;
    vi.spyOn(toolHandler, 'canSearch').mockReturnValue(false);

    const tokens: string[] = [];
    let completed = '';

    await orchestrator.processMessage(conv.id, 'Tell me a fact', {
      onToken: (t) => tokens.push(t),
      onComplete: (content) => {
        completed = content;
      },
      onError: (err) => {
        throw err;
      },
    });

    expect(tokens.join('')).toBe('Streaming from Groq endpoint.');
    expect(completed).toContain('Streaming from Groq endpoint.');
  });

  it('handles Groq API rate limits (HTTP 429) and quota exhaustion gracefully', async () => {
    const conv = repository.createConversation(undefined, 'Groq Error Test');

    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_invalid_or_exhausted',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
    });

    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    const rateLimitError = new Error('Rate limit reached: tokens per minute (TPM) exceeded');
    vi.spyOn(openaiClient.chat.completions, 'create').mockRejectedValueOnce(rateLimitError);

    let errorCaught: unknown = null;

    await orchestrator.processMessage(conv.id, 'Trigger rate limit', {
      onToken: () => {},
      onComplete: () => {},
      onError: (err) => {
        errorCaught = err;
      },
    });

    expect(errorCaught).not.toBeNull();
    expect((errorCaught as Error)?.message).toContain('Rate limit reached');
  });

  it('handles Groq 401 Unauthorized authentication error gracefully', async () => {
    const conv = repository.createConversation(undefined, 'Groq Auth Error Test');

    const orchestrator = new AgentOrchestrator({
      apiKey: 'gsk_invalid_key',
      baseURL: 'https://api.groq.com/openai/v1',
      model: 'openai/gpt-oss-120b',
      tavilyApiKey: 'tvly_test_key',
    });

    const openaiClient = (orchestrator as unknown as { openai: OpenAI }).openai;
    const authError = new Error('401 Invalid API Key');
    vi.spyOn(openaiClient.chat.completions, 'create').mockRejectedValueOnce(authError);

    let errorCaught: unknown = null;

    await orchestrator.processMessage(conv.id, 'Trigger auth error', {
      onToken: () => {},
      onComplete: () => {},
      onError: (err) => {
        errorCaught = err;
      },
    });

    expect(errorCaught).not.toBeNull();
    expect((errorCaught as Error)?.message).toContain('401 Invalid API Key');
  });
});
