import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  TAVILY_API_KEY: z.string().min(1, 'TAVILY_API_KEY is required'),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  DATABASE_PATH: z.string().default('./data/minimi.db'),
  PORT: z.coerce.number().default(3001),
  APP_TIMEZONE: z.string().default('UTC'),
});

type Config = z.infer<typeof envSchema>;

let _config: Config | null = null;

export function validateConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!process.env.TAVILY_API_KEY) missing.push('TAVILY_API_KEY');
  return { valid: missing.length === 0, missing };
}

export function getConfig(): Config {
  if (_config) return _config;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Configuration error:\n${issues.join('\n')}`);
  }
  _config = result.data;
  return _config;
}

export const config = new Proxy({} as Config, {
  get(_, prop: string) {
    return getConfig()[prop as keyof Config];
  },
});
