import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DATABASE_PATH || './data/minimi.db';
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // Performance and safety settings
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000'); // 64MB

  // Run schema creation
  db.exec(SCHEMA_SQL);

  // Dynamic migration: Ensure is_pinned column exists
  try {
    const tableInfo = db.prepare("PRAGMA table_info(conversations)").all() as { name: string }[];
    const hasIsPinned = tableInfo.some((col) => col.name === 'is_pinned');
    if (!hasIsPinned && tableInfo.length > 0) {
      db.exec("ALTER TABLE conversations ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0;");
      db.exec("CREATE INDEX IF NOT EXISTS idx_conversations_is_pinned ON conversations(is_pinned);");
    }
  } catch (e) {
    // Schema creation will handle new tables
  }

  // Data cleanup: backfill meaningful titles for conversations stuck with 'New Conversation' or outer quotes
  try {
    const fixStmt = db.prepare(`
      SELECT c.id, c.title,
        (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC, rowid ASC LIMIT 1) as first_msg
      FROM conversations c
      WHERE c.title = 'New Conversation' OR c.title LIKE '"%"' OR c.title LIKE '''%''' OR TRIM(c.title) = ''
    `);
    const badConvs = fixStmt.all() as { id: string; title: string; first_msg: string | null }[];
    const updateStmt = db.prepare('UPDATE conversations SET title = ? WHERE id = ?');
    for (const c of badConvs) {
      let clean = '';
      if (c.first_msg && c.first_msg.trim()) {
        const text = c.first_msg.replace(/^["']|["']$/g, '').trim();
        clean = text.length <= 60 ? text : text.slice(0, 57) + '…';
      } else if (c.title.startsWith('"') || c.title.startsWith("'")) {
        clean = c.title.replace(/^["']|["']$/g, '').trim();
      }
      if (clean && clean !== 'New Conversation') {
        updateStmt.run(clean, c.id);
      }
    }
  } catch {
    // Non-critical data cleanup
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
