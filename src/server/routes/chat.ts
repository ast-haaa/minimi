import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { AgentOrchestrator } from '../agent/orchestrator.js';
import { config, validateConfig } from '../utils/config.js';
import { repository } from '../database/repository.js';
import { logger } from '../utils/logger.js';
import type { Source } from '../../shared/types.js';

export const chatRouter = Router();

const chatRequestSchema = z.object({
  conversationId: z.string().trim().optional(),
  message: z.string().trim().min(1, 'Message cannot be empty').max(8000, 'Message is too long'),
  stream: z.boolean().optional().default(true),
});

let orchestrator: AgentOrchestrator | null = null;

function getOrchestrator(): AgentOrchestrator {
  if (orchestrator) return orchestrator;

  const { valid, missing } = validateConfig();
  if (!valid) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}. Please configure .env before using chat.`
    );
  }

  orchestrator = new AgentOrchestrator({
    apiKey: config.AI_API_KEY,
    baseURL: config.AI_BASE_URL,
    tavilyApiKey: config.TAVILY_API_KEY,
    model: config.AI_MODEL,
    timezone: config.APP_TIMEZONE,
  });

  return orchestrator;
}

chatRouter.post('/', async (req: Request, res: Response) => {
  const parseResult = chatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid chat request',
      details: parseResult.error.issues.map((i) => i.message),
    });
  }

  const { message, stream } = parseResult.data;
  let { conversationId } = parseResult.data;

  // If no conversationId provided, create a new conversation
  if (!conversationId) {
    const newConv = repository.createConversation();
    conversationId = newConv.id;
  } else {
    // Ensure it exists
    let existing = repository.getConversation(conversationId);
    if (!existing) {
      repository.createConversation(conversationId);
    }
  }

  let agent: AgentOrchestrator;
  try {
    agent = getOrchestrator();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error('Orchestrator initialization failed', err);
    return res.status(503).json({
      error: 'AI service unavailable',
      message: errorMsg,
    });
  }

  const wantsStream = stream !== false && req.headers.accept?.includes('text/event-stream');

  if (wantsStream) {
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    // Send conversationId first
    res.write(`data: ${JSON.stringify({ type: 'start', conversationId })}\n\n`);

    try {
      await agent.processMessage(conversationId, message, {
        onToken: (token: string) => {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        },
        onComplete: (fullContent: string, sources: Source[]) => {
          res.write(
            `data: ${JSON.stringify({
              type: 'done',
              conversationId,
              content: fullContent,
              sources,
            })}\n\n`
          );
          res.end();
        },
        onError: (error: Error) => {
          res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
          res.end();
        },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`);
      res.end();
    }
  } else {
    // Standard synchronous JSON response
    let accumulatedContent = '';
    let finalSources: Source[] = [];

    try {
      await agent.processMessage(conversationId, message, {
        onToken: (token) => {
          accumulatedContent += token;
        },
        onComplete: (fullContent, sources) => {
          accumulatedContent = fullContent;
          finalSources = sources;
        },
        onError: (err) => {
          throw err;
        },
      });

      const messages = repository.getMessages(conversationId, 2);
      const assistantMsg = messages[messages.length - 1];

      return res.json({
        conversationId,
        message: assistantMsg || {
          id: 'temp',
          conversationId,
          role: 'assistant',
          content: accumulatedContent,
          createdAt: new Date().toISOString(),
          sources: finalSources,
        },
        sources: finalSources,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({
        error: 'Failed to process message',
        message: errorMsg,
      });
    }
  }
});

