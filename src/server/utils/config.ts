import '../env.js';
import { z } from 'zod';

export type AIProvider = 'groq' | 'openai';

function resolveProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === 'openai' || explicit === 'groq') {
    return explicit;
  }
  // If GROQ_API_KEY is present, prefer groq
  if (process.env.GROQ_API_KEY?.trim()) {
    return 'groq';
  }
  // If OPENAI_API_KEY is present, fallback to openai
  if (process.env.OPENAI_API_KEY?.trim()) {
    return 'openai';
  }
  return 'groq';
}

const baseSchema = z.object({
  AI_PROVIDER: z.enum(['groq', 'openai']).default('groq'),
  GROQ_API_KEY: z.string().trim().optional(),
  OPENAI_API_KEY: z.string().trim().optional(),
  AI_MODEL: z.string().trim().optional(),
  OPENAI_MODEL: z.string().trim().optional(),
  TAVILY_API_KEY: z.string().trim().min(1, 'TAVILY_API_KEY is required and cannot be empty'),
  DATABASE_PATH: z.string().trim().default('./data/minimi.db'),
  PORT: z.coerce.number().default(3001),
  APP_TIMEZONE: z.string().trim().default('UTC'),
});

const envSchema = baseSchema.superRefine((data, ctx) => {
  if (data.AI_PROVIDER === 'groq') {
    if (!data.GROQ_API_KEY || data.GROQ_API_KEY.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GROQ_API_KEY'],
        message: 'GROQ_API_KEY is required when AI_PROVIDER=groq',
      });
    }
  } else if (data.AI_PROVIDER === 'openai') {
    if (!data.OPENAI_API_KEY || data.OPENAI_API_KEY.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['OPENAI_API_KEY'],
        message: 'OPENAI_API_KEY is required when AI_PROVIDER=openai',
      });
    }
  }
});

export interface Config {
  AI_PROVIDER: AIProvider;
  AI_API_KEY: string;
  AI_BASE_URL: string | undefined;
  AI_MODEL: string;
  GROQ_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  TAVILY_API_KEY: string;
  DATABASE_PATH: string;
  PORT: number;
  APP_TIMEZONE: string;
}

let _config: Config | null = null;

export function validateConfig(): {
  valid: boolean;
  missing: string[];
  present: string[];
  provider: AIProvider;
} {
  const provider = resolveProvider();
  const missing: string[] = [];
  const present: string[] = [];

  // Check AI provider key
  if (provider === 'groq') {
    if (process.env.GROQ_API_KEY?.trim()) {
      present.push('GROQ_API_KEY');
    } else {
      missing.push('GROQ_API_KEY');
    }
    if (process.env.OPENAI_API_KEY?.trim()) {
      present.push('OPENAI_API_KEY (optional)');
    }
  } else {
    if (process.env.OPENAI_API_KEY?.trim()) {
      present.push('OPENAI_API_KEY');
    } else {
      missing.push('OPENAI_API_KEY');
    }
    if (process.env.GROQ_API_KEY?.trim()) {
      present.push('GROQ_API_KEY (optional)');
    }
  }

  // Check Tavily key
  if (process.env.TAVILY_API_KEY?.trim()) {
    present.push('TAVILY_API_KEY');
  } else {
    missing.push('TAVILY_API_KEY');
  }

  return { valid: missing.length === 0, missing, present, provider };
}

export function getConfig(): Config {
  if (_config) return _config;

  const provider = resolveProvider();
  const rawEnv = {
    ...process.env,
    AI_PROVIDER: provider,
  };

  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Configuration validation error:\n${issues.join('\n')}`);
  }

  const parsed = result.data;

  // Resolve model based on provider
  let model = parsed.AI_MODEL || parsed.OPENAI_MODEL;
  if (!model) {
    model = provider === 'groq' ? 'openai/gpt-oss-120b' : 'gpt-4o';
  }

  const apiKey = (provider === 'groq' ? parsed.GROQ_API_KEY : parsed.OPENAI_API_KEY) || '';
  const baseURL = provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined;

  _config = {
    AI_PROVIDER: provider,
    AI_API_KEY: apiKey,
    AI_BASE_URL: baseURL,
    AI_MODEL: model,
    GROQ_API_KEY: parsed.GROQ_API_KEY,
    OPENAI_API_KEY: parsed.OPENAI_API_KEY,
    OPENAI_MODEL: parsed.OPENAI_MODEL || model,
    TAVILY_API_KEY: parsed.TAVILY_API_KEY,
    DATABASE_PATH: parsed.DATABASE_PATH,
    PORT: parsed.PORT,
    APP_TIMEZONE: parsed.APP_TIMEZONE,
  };

  return _config;
}

export function resetConfig(): void {
  _config = null;
}

export const config = new Proxy({} as Config, {
  get(_, prop: string) {
    return getConfig()[prop as keyof Config];
  },
});
