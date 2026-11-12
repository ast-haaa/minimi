export const SCHEMA_SQL = `
-- Core conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_conversations_is_pinned ON conversations(is_pinned);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  metadata TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Named entities extracted from conversations
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'company', 'category', 'technology', 'person', 'other')),
  aliases TEXT DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_entities_canonical_name ON entities(canonical_name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);

-- Junction table: which entities appear in which conversations
CREATE TABLE IF NOT EXISTS conversation_entities (
  conversation_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  context TEXT,
  PRIMARY KEY (conversation_id, entity_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Structured facts extracted from conversations
CREATE TABLE IF NOT EXISTS facts (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  message_id TEXT,
  entity_id TEXT,
  fact_type TEXT NOT NULL CHECK (fact_type IN ('price', 'feature', 'plan', 'version', 'date', 'decision', 'requirement', 'conclusion', 'comparison', 'other')),
  fact_value TEXT NOT NULL,
  currency TEXT,
  billing_interval TEXT,
  plan_name TEXT,
  observed_at TEXT NOT NULL,
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  source_type TEXT DEFAULT 'inferred' CHECK (source_type IN ('user_stated', 'web_search', 'inferred')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_facts_conversation_id ON facts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_facts_entity_id ON facts(entity_id);
CREATE INDEX IF NOT EXISTS idx_facts_type ON facts(fact_type);
CREATE INDEX IF NOT EXISTS idx_facts_observed_at ON facts(observed_at);

-- Sources/citations attached to messages
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  title TEXT,
  url TEXT NOT NULL,
  domain TEXT,
  snippet TEXT,
  published_date TEXT,
  retrieved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  source_type TEXT DEFAULT 'unknown',
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sources_message_id ON sources(message_id);
CREATE INDEX IF NOT EXISTS idx_sources_domain ON sources(domain);

-- FTS5 virtual tables for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
  content,
  content=messages,
  content_rowid=rowid,
  tokenize='porter unicode61'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES ('delete', old.rowid, old.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES ('delete', old.rowid, old.content);
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;

-- FTS for facts
CREATE VIRTUAL TABLE IF NOT EXISTS facts_fts USING fts5(
  fact_value,
  content=facts,
  content_rowid=rowid,
  tokenize='porter unicode61'
);

CREATE TRIGGER IF NOT EXISTS facts_ai AFTER INSERT ON facts BEGIN
  INSERT INTO facts_fts(rowid, fact_value) VALUES (new.rowid, new.fact_value);
END;

CREATE TRIGGER IF NOT EXISTS facts_ad AFTER DELETE ON facts BEGIN
  INSERT INTO facts_fts(facts_fts, rowid, fact_value) VALUES ('delete', old.rowid, old.fact_value);
END;

CREATE TRIGGER IF NOT EXISTS facts_au AFTER UPDATE ON facts BEGIN
  INSERT INTO facts_fts(facts_fts, rowid, fact_value) VALUES ('delete', old.rowid, old.fact_value);
  INSERT INTO facts_fts(rowid, fact_value) VALUES (new.rowid, new.fact_value);
END;
`;
