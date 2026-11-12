import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateConfig, getConfig, resetConfig } from '../../src/server/utils/config.js';

describe('AI Provider Configuration & Zod Validation', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetConfig();
  });

  it('validates Groq provider when AI_PROVIDER=groq and GROQ_API_KEY is present', () => {
    process.env.AI_PROVIDER = 'groq';
    process.env.GROQ_API_KEY = 'gsk_mock_groq_key';
    delete process.env.OPENAI_API_KEY;
    process.env.TAVILY_API_KEY = 'tvly_mock_key';

    const check = validateConfig();
    expect(check.valid).toBe(true);
    expect(check.provider).toBe('groq');
    expect(check.present).toContain('GROQ_API_KEY');
    expect(check.present).toContain('TAVILY_API_KEY');
    expect(check.missing).toHaveLength(0);

    const cfg = getConfig();
    expect(cfg.AI_PROVIDER).toBe('groq');
    expect(cfg.AI_BASE_URL).toBe('https://api.groq.com/openai/v1');
    expect(cfg.AI_MODEL).toBe('openai/gpt-oss-120b');
    expect(cfg.AI_API_KEY).toBe('gsk_mock_groq_key');
  });

  it('fails validation when AI_PROVIDER=groq and GROQ_API_KEY is missing', () => {
    process.env.AI_PROVIDER = 'groq';
    delete process.env.GROQ_API_KEY;
    process.env.TAVILY_API_KEY = 'tvly_mock_key';

    const check = validateConfig();
    expect(check.valid).toBe(false);
    expect(check.missing).toContain('GROQ_API_KEY');

    expect(() => getConfig()).toThrow(/GROQ_API_KEY is required/);
  });

  it('validates OpenAI provider when AI_PROVIDER=openai and OPENAI_API_KEY is present', () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'sk-mock-openai-key';
    delete process.env.GROQ_API_KEY;
    process.env.TAVILY_API_KEY = 'tvly_mock_key';

    const check = validateConfig();
    expect(check.valid).toBe(true);
    expect(check.provider).toBe('openai');
    expect(check.present).toContain('OPENAI_API_KEY');
    expect(check.present).toContain('TAVILY_API_KEY');
    expect(check.missing).toHaveLength(0);

    const cfg = getConfig();
    expect(cfg.AI_PROVIDER).toBe('openai');
    expect(cfg.AI_BASE_URL).toBeUndefined();
    expect(cfg.AI_MODEL).toBe('gpt-4o');
    expect(cfg.AI_API_KEY).toBe('sk-mock-openai-key');
  });

  it('fails validation when AI_PROVIDER=openai and OPENAI_API_KEY is missing', () => {
    process.env.AI_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;
    process.env.TAVILY_API_KEY = 'tvly_mock_key';

    const check = validateConfig();
    expect(check.valid).toBe(false);
    expect(check.missing).toContain('OPENAI_API_KEY');

    expect(() => getConfig()).toThrow(/OPENAI_API_KEY is required/);
  });

  it('fails validation if TAVILY_API_KEY is missing, regardless of AI provider', () => {
    process.env.AI_PROVIDER = 'groq';
    process.env.GROQ_API_KEY = 'gsk_mock_groq_key';
    delete process.env.TAVILY_API_KEY;

    const check = validateConfig();
    expect(check.valid).toBe(false);
    expect(check.missing).toContain('TAVILY_API_KEY');

    expect(() => getConfig()).toThrow(/TAVILY_API_KEY/);
  });
});
