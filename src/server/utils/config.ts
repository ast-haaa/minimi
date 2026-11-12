import '../env.js';
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1, 'OPENAI_API_KEY is required and cannot be empty'),
  TAVILY_API_KEY: z.string().trim().min(1, 'TAVILY_API_KEY is required and cannot be empty'),
  OPENAI_MODEL: z.string().trim().default('gpt-4o'),
  DATABASE_PATH: z.string().trim().default('./data/minimi.db'),
  PORT: z.coerce.number().default(3001),
  APP_TIMEZONE: z.string().trim().default('UTC'),
});

export type Config = z.infer<typeof envSchema>;

let _config: Config | null = null;

export function validateConfig(): { valid: boolean; missing: string[]; present: string[] } {
  const missing: string[] = [];
  const present: string[] = [];

  const requiredKeys = ['OPENAI_API_KEY', 'TAVILY_API_KEY'] as const;
  for (const key of requiredKeys) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return { valid: missing.length === 0, missing, present };
}

export function getConfig(): Config {
  if (_config) return _config;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Configuration validation error:\n${issues.join('\n')}`);
  }
  _config = result.data;
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
