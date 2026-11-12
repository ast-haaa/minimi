import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = './data/test_minimi.db';

beforeAll(() => {
  process.env.DATABASE_PATH = TEST_DB_PATH;
  process.env.OPENAI_API_KEY = 'mock-openai-key';
  process.env.TAVILY_API_KEY = 'mock-tavily-key';
  process.env.OPENAI_MODEL = 'gpt-4o';
  process.env.PORT = '3099';
  process.env.APP_TIMEZONE = 'UTC';

  const dir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

afterAll(() => {
  // Clean up test database
  try {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const wal = `${TEST_DB_PATH}-wal`;
    if (fs.existsSync(wal)) fs.unlinkSync(wal);
    const shm = `${TEST_DB_PATH}-shm`;
    if (fs.existsSync(shm)) fs.unlinkSync(shm);
  } catch {
    // Ignore cleanup errors
  }
});
