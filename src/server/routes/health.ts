import { Router, type Request, type Response } from 'express';
import { getDb } from '../database/connection.js';
import { validateConfig } from '../utils/config.js';
import type { HealthResponse } from '../../shared/types.js';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  let dbOk = false;
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as val').get() as { val: number } | undefined;
    dbOk = result?.val === 1;
  } catch {
    dbOk = false;
  }

  const { valid, missing, provider } = validateConfig();
  const openaiOk = !missing.includes('OPENAI_API_KEY') && Boolean(process.env.OPENAI_API_KEY?.trim());
  const groqOk = !missing.includes('GROQ_API_KEY') && Boolean(process.env.GROQ_API_KEY?.trim());
  const tavilyOk = !missing.includes('TAVILY_API_KEY');

  const status = dbOk && valid ? 'ok' : dbOk ? 'degraded' : 'error';

  const body: HealthResponse = {
    status,
    version: '1.0.0',
    checks: {
      database: dbOk,
      openai: openaiOk,
      groq: groqOk,
      aiProvider: provider,
      tavily: tavilyOk,
    },
    timestamp: new Date().toISOString(),
  };

  const statusCode = status === 'ok' || status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(body);
});

