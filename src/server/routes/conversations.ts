import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { repository } from '../database/repository.js';

export const conversationsRouter = Router();

const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
});

// GET /api/conversations - List conversations
conversationsRouter.get('/', (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const items = repository.listConversations(limit, offset);
    res.json({ conversations: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// POST /api/conversations - Create a new conversation
conversationsRouter.post('/', (req: Request, res: Response) => {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    }
    const conversation = repository.createConversation(undefined, parsed.data.title);
    res.status(201).json({ conversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/conversations/:id - Get conversation details with messages and sources
conversationsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const conversation = repository.getConversation(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = repository.getMessages(id, 100);
    const entities = repository.getConversationEntities(id);

    res.json({
      conversation,
      messages,
      entities,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

// DELETE /api/conversations/:id - Delete a conversation
conversationsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = repository.deleteConversation(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});
