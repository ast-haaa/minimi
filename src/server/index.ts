import './env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './utils/config.js';
import { getDb } from './database/connection.js';
import { healthRouter } from './routes/health.js';
import { conversationsRouter } from './routes/conversations.js';
import { chatRouter } from './routes/chat.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite dev server compatibility
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health') {
      logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Initialize database
try {
  getDb();
  logger.info('Database initialized successfully');
} catch (err) {
  logger.error('Failed to initialize database', err);
  process.exit(1);
}

// Safely verify configuration without logging values
const { valid, missing, present, provider } = validateConfig();
if (!valid) {
  logger.warn(
    `Missing required environment variables for provider '${provider}': ${missing.join(', ')}. Please configure .env in project root.`
  );
} else {
  logger.info(
    `Environment configuration validated successfully for provider '${provider}' (configured: ${present.join(', ')})`
  );
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/chat', chatRouter);

// Global Error Handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled server error', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: 'Internal Server Error', message });
});

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Minimi server running at http://localhost:${PORT}`);
});

export default app;

