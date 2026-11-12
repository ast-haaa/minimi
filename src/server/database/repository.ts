import { nanoid } from 'nanoid';
import { getDb } from './connection.js';
import type {
  Conversation,
  Message,
  MessageMetadata,
  Source,
  ExtractedEntity,
  ExtractedFact,
  ConversationListItem,
} from '../../shared/types.js';

interface DbConversation {
  id: string;
  title: string;
  is_pinned?: number;
  created_at: string;
  updated_at: string;
}

interface DbMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
  metadata: string | null;
}

interface DbEntity {
  id: string;
  canonical_name: string;
  entity_type: string;
  aliases: string | null;
}

interface DbFact {
  id: string;
  conversation_id: string;
  message_id: string | null;
  entity_id: string | null;
  fact_type: string;
  fact_value: string;
  currency: string | null;
  billing_interval: string | null;
  plan_name: string | null;
  observed_at: string;
  confidence: string;
  source_type: string;
}

interface DbSource {
  id: string;
  message_id: string;
  title: string | null;
  url: string;
  domain: string | null;
  snippet: string | null;
  published_date: string | null;
  retrieved_at: string;
  source_type: string | null;
}

export class Repository {
  // ─── Conversations ────────────────────────────────────────

  createConversation(id?: string, title?: string, isPinned = false): Conversation {
    const db = getDb();
    const convId = id || nanoid();
    const now = new Date().toISOString();
    const cleanTitle = title ? title.replace(/^["']|["']$/g, '').trim() : 'New Conversation';
    db.prepare(
      'INSERT INTO conversations (id, title, is_pinned, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).run(convId, cleanTitle, isPinned ? 1 : 0, now, now);
    return { id: convId, title: cleanTitle, isPinned, createdAt: now, updatedAt: now };
  }

  getConversation(id: string): Conversation | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as DbConversation | undefined;
    if (!row) return null;
    let title = row.title;
    if (title.startsWith('"') && title.endsWith('"') && title.length > 2) {
      title = title.slice(1, -1);
    }
    return {
      id: row.id,
      title,
      isPinned: Boolean(row.is_pinned),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  listConversations(limit = 100, offset = 0): ConversationListItem[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM messages WHERE conversation_id = c.id AND role = 'user' ORDER BY created_at ASC, rowid ASC LIMIT 1) as preview
      FROM conversations c
      WHERE (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) > 0 OR c.is_pinned = 1 OR c.title != 'New Conversation'
      ORDER BY c.is_pinned DESC, c.updated_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as (DbConversation & { message_count: number; preview: string | null })[];

    return rows.map((r) => {
      let title = r.title;
      if (title.startsWith('"') && title.endsWith('"') && title.length > 2) {
        title = title.slice(1, -1);
      }
      // Never display generic "New Conversation" placeholder if a preview message exists
      if ((title === 'New Conversation' || !title.trim()) && r.preview) {
        const text = r.preview.replace(/^["']|["']$/g, '').trim();
        title = text.length <= 50 ? text : text.slice(0, 47) + '…';
      }
      return {
        id: r.id,
        title,
        isPinned: Boolean(r.is_pinned),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        messageCount: r.message_count,
        preview: r.preview ? r.preview.slice(0, 120) : undefined,
      };
    });
  }

  updateConversationTitle(id: string, title: string): boolean {
    const db = getDb();
    const cleanTitle = title.replace(/^["']|["']$/g, '').trim();
    const result = db
      .prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?')
      .run(cleanTitle, new Date().toISOString(), id);
    return result.changes > 0;
  }

  updateConversationPin(id: string, isPinned: boolean): boolean {
    const db = getDb();
    const result = db
      .prepare('UPDATE conversations SET is_pinned = ?, updated_at = ? WHERE id = ?')
      .run(isPinned ? 1 : 0, new Date().toISOString(), id);
    return result.changes > 0;
  }

  updateConversationTimestamp(id: string): void {
    const db = getDb();
    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), id);
  }

  deleteConversation(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ─── Messages ─────────────────────────────────────────────

  addMessage(msg: {
    id?: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: MessageMetadata;
    sources?: Source[];
  }): Message {
    const db = getDb();
    const msgId = msg.id || nanoid();
    const now = new Date().toISOString();
    const metadataJson = msg.metadata ? JSON.stringify(msg.metadata) : null;

    db.prepare(
      'INSERT INTO messages (id, conversation_id, role, content, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(msgId, msg.conversationId, msg.role, msg.content, now, metadataJson);

    // Add sources if provided
    const savedSources: Source[] = [];
    if (msg.sources && msg.sources.length > 0) {
      const insertSource = db.prepare(
        'INSERT INTO sources (id, message_id, title, url, domain, snippet, published_date, retrieved_at, source_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const src of msg.sources) {
        const srcId = src.id || nanoid();
        insertSource.run(srcId, msgId, src.title, src.url, src.domain, src.snippet || null, src.publishedDate || null, src.retrievedAt, src.sourceType || 'unknown');
        savedSources.push({ ...src, id: srcId });
      }
    }

    // Update conversation timestamp
    this.updateConversationTimestamp(msg.conversationId);

    return {
      id: msgId,
      conversationId: msg.conversationId,
      role: msg.role,
      content: msg.content,
      createdAt: now,
      metadata: msg.metadata,
      sources: savedSources.length > 0 ? savedSources : undefined,
    };
  }

  getMessages(conversationId: string, limit = 100, before?: string): Message[] {
    const db = getDb();
    let query = 'SELECT m.*, GROUP_CONCAT(s.id) as source_ids FROM messages m LEFT JOIN sources s ON s.message_id = m.id WHERE m.conversation_id = ?';
    const params: (string | number)[] = [conversationId];

    if (before) {
      query += ' AND m.created_at < ?';
      params.push(before);
    }

    query += ' GROUP BY m.id ORDER BY m.created_at ASC, m.rowid ASC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params) as (DbMessage & { source_ids: string | null })[];

    return rows.map(row => {
      const sources = row.source_ids ? this.getMessageSources(row.id) : undefined;
      return {
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        createdAt: row.created_at,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        sources,
      };
    });
  }

  getMessage(id: string): Message | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as DbMessage | undefined;
    if (!row) return null;
    const sources = this.getMessageSources(row.id);
    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      createdAt: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      sources: sources.length > 0 ? sources : undefined,
    };
  }

  searchMessages(query: string, filters?: {
    conversationId?: string;
    dateFrom?: string;
    dateTo?: string;
    role?: string;
  }): Message[] {
    const db = getDb();
    const trimmed = query.trim();

    if (!trimmed) {
      let sql = 'SELECT * FROM messages WHERE 1=1';
      const params: (string | number)[] = [];

      if (filters?.conversationId) {
        sql += ' AND conversation_id = ?';
        params.push(filters.conversationId);
      }
      if (filters?.dateFrom) {
        sql += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      if (filters?.dateTo) {
        sql += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      if (filters?.role) {
        sql += ' AND role = ?';
        params.push(filters.role);
      }

      sql += ' ORDER BY created_at DESC LIMIT 30';
      const rows = db.prepare(sql).all(...params) as DbMessage[];
      return rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        createdAt: row.created_at,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      }));
    }

    // Use FTS5 search
    let sql = `
      SELECT m.* FROM messages m
      INNER JOIN messages_fts fts ON m.rowid = fts.rowid
      WHERE messages_fts MATCH ?
    `;
    const params: (string | number)[] = [this.sanitizeFtsQuery(trimmed)];

    if (filters?.conversationId) {
      sql += ' AND m.conversation_id = ?';
      params.push(filters.conversationId);
    }
    if (filters?.dateFrom) {
      sql += ' AND m.created_at >= ?';
      params.push(filters.dateFrom);
    }
    if (filters?.dateTo) {
      sql += ' AND m.created_at <= ?';
      params.push(filters.dateTo);
    }
    if (filters?.role) {
      sql += ' AND m.role = ?';
      params.push(filters.role);
    }

    sql += ' ORDER BY rank LIMIT 30';

    try {
      const rows = db.prepare(sql).all(...params) as DbMessage[];
      return rows.map(row => ({
        id: row.id,
        conversationId: row.conversation_id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        createdAt: row.created_at,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      }));
    } catch {
      // FTS query might fail with special characters; fall back to LIKE
      return this.searchMessagesLike(query, filters);
    }
  }

  private searchMessagesLike(query: string, filters?: {
    conversationId?: string;
    dateFrom?: string;
    dateTo?: string;
    role?: string;
  }): Message[] {
    const db = getDb();
    let sql = 'SELECT * FROM messages WHERE content LIKE ?';
    const params: (string | number)[] = [`%${query}%`];

    if (filters?.conversationId) {
      sql += ' AND conversation_id = ?';
      params.push(filters.conversationId);
    }
    if (filters?.dateFrom) {
      sql += ' AND created_at >= ?';
      params.push(filters.dateFrom);
    }
    if (filters?.dateTo) {
      sql += ' AND created_at <= ?';
      params.push(filters.dateTo);
    }
    if (filters?.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    sql += ' ORDER BY created_at DESC LIMIT 30';

    const rows = db.prepare(sql).all(...params) as DbMessage[];
    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role as 'user' | 'assistant' | 'system',
      content: row.content,
      createdAt: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  private sanitizeFtsQuery(query: string): string {
    // Remove FTS5 special characters and wrap terms for prefix matching
    const cleaned = query.replace(/['"(){}[\]^~*:]/g, ' ').trim();
    if (!cleaned) return '""';
    const terms = cleaned.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return '""';
    // Use OR for multiple terms to be more inclusive
    return terms.map(t => `"${t}"`).join(' OR ');
  }

  // ─── Entities ─────────────────────────────────────────────

  upsertEntity(entity: { name: string; type: string; aliases?: string[] }): { id: string; canonicalName: string; entityType: string; aliases: string[] } {
    const db = getDb();
    // Check if entity exists (case-insensitive)
    const existing = this.findEntity(entity.name);
    if (existing) return existing;

    const id = nanoid();
    const aliasesJson = JSON.stringify(entity.aliases || []);
    db.prepare('INSERT INTO entities (id, canonical_name, entity_type, aliases) VALUES (?, ?, ?, ?)')
      .run(id, entity.name, entity.type, aliasesJson);
    return { id, canonicalName: entity.name, entityType: entity.type, aliases: entity.aliases || [] };
  }

  findEntity(name: string): { id: string; canonicalName: string; entityType: string; aliases: string[] } | null {
    const db = getDb();
    // Search by canonical name (case-insensitive)
    let row = db.prepare('SELECT * FROM entities WHERE canonical_name = ? COLLATE NOCASE').get(name) as DbEntity | undefined;
    
    if (!row) {
      // Search in aliases
      const allEntities = db.prepare('SELECT * FROM entities').all() as DbEntity[];
      for (const e of allEntities) {
        const aliases: string[] = e.aliases ? JSON.parse(e.aliases) : [];
        if (aliases.some(a => a.toLowerCase() === name.toLowerCase())) {
          row = e;
          break;
        }
      }
    }

    if (!row) return null;
    return {
      id: row.id,
      canonicalName: row.canonical_name,
      entityType: row.entity_type,
      aliases: row.aliases ? JSON.parse(row.aliases) : [],
    };
  }

  linkEntityToConversation(conversationId: string, entityId: string, context?: string): void {
    const db = getDb();
    db.prepare(
      'INSERT OR IGNORE INTO conversation_entities (conversation_id, entity_id, context) VALUES (?, ?, ?)'
    ).run(conversationId, entityId, context || null);
  }

  getConversationEntities(conversationId: string): { id: string; canonicalName: string; entityType: string; aliases: string[] }[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT e.* FROM entities e
      INNER JOIN conversation_entities ce ON e.id = ce.entity_id
      WHERE ce.conversation_id = ?
    `).all(conversationId) as DbEntity[];

    return rows.map(r => ({
      id: r.id,
      canonicalName: r.canonical_name,
      entityType: r.entity_type,
      aliases: r.aliases ? JSON.parse(r.aliases) : [],
    }));
  }

  // ─── Facts ────────────────────────────────────────────────

  addFact(fact: {
    conversationId: string;
    messageId?: string;
    entityId?: string;
    factType: string;
    factValue: string;
    currency?: string;
    billingInterval?: string;
    planName?: string;
    observedAt: string;
    confidence?: string;
    sourceType?: string;
  }): { id: string } {
    const db = getDb();
    const id = nanoid();
    db.prepare(`
      INSERT INTO facts (id, conversation_id, message_id, entity_id, fact_type, fact_value, currency, billing_interval, plan_name, observed_at, confidence, source_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, fact.conversationId, fact.messageId || null, fact.entityId || null,
      fact.factType, fact.factValue, fact.currency || null, fact.billingInterval || null,
      fact.planName || null, fact.observedAt, fact.confidence || 'medium', fact.sourceType || 'inferred'
    );
    return { id };
  }

  findFacts(filters: {
    entityId?: string;
    entityName?: string;
    factType?: string;
    dateFrom?: string;
    dateTo?: string;
    conversationId?: string;
  }): ExtractedFact[] {
    const db = getDb();
    let sql = `
      SELECT f.*, e.canonical_name as entity_name FROM facts f
      LEFT JOIN entities e ON f.entity_id = e.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (filters.entityId) {
      sql += ' AND f.entity_id = ?';
      params.push(filters.entityId);
    }
    if (filters.entityName) {
      sql += ' AND (e.canonical_name LIKE ? COLLATE NOCASE OR e.aliases LIKE ?)';
      params.push(`%${filters.entityName}%`, `%${filters.entityName}%`);
    }
    if (filters.factType) {
      sql += ' AND f.fact_type = ?';
      params.push(filters.factType);
    }
    if (filters.dateFrom) {
      sql += ' AND f.observed_at >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += ' AND f.observed_at <= ?';
      params.push(filters.dateTo);
    }
    if (filters.conversationId) {
      sql += ' AND f.conversation_id = ?';
      params.push(filters.conversationId);
    }

    sql += ' ORDER BY f.observed_at DESC LIMIT 50';

    const rows = db.prepare(sql).all(...params) as (DbFact & { entity_name: string | null })[];
    return rows.map(r => ({
      entityName: r.entity_name || 'Unknown',
      factType: r.fact_type as ExtractedFact['factType'],
      factValue: r.fact_value,
      currency: r.currency || undefined,
      billingInterval: r.billing_interval || undefined,
      planName: r.plan_name || undefined,
      observedAt: r.observed_at,
      confidence: r.confidence as 'high' | 'medium' | 'low',
      sourceType: r.source_type as 'user_stated' | 'web_search' | 'inferred',
    }));
  }

  searchFacts(query: string): ExtractedFact[] {
    const db = getDb();
    try {
      const rows = db.prepare(`
        SELECT f.*, e.canonical_name as entity_name FROM facts f
        LEFT JOIN entities e ON f.entity_id = e.id
        INNER JOIN facts_fts fts ON f.rowid = fts.rowid
        WHERE facts_fts MATCH ?
        ORDER BY rank LIMIT 20
      `).all(this.sanitizeFtsQuery(query)) as (DbFact & { entity_name: string | null })[];

      return rows.map(r => ({
        entityName: r.entity_name || 'Unknown',
        factType: r.fact_type as ExtractedFact['factType'],
        factValue: r.fact_value,
        currency: r.currency || undefined,
        billingInterval: r.billing_interval || undefined,
        planName: r.plan_name || undefined,
        observedAt: r.observed_at,
        confidence: r.confidence as 'high' | 'medium' | 'low',
        sourceType: r.source_type as 'user_stated' | 'web_search' | 'inferred',
      }));
    } catch {
      return [];
    }
  }

  // ─── Sources ──────────────────────────────────────────────

  addSource(source: { messageId: string } & Omit<Source, 'id'>): Source {
    const db = getDb();
    const id = nanoid();
    db.prepare(
      'INSERT INTO sources (id, message_id, title, url, domain, snippet, published_date, retrieved_at, source_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(id, source.messageId, source.title, source.url, source.domain, source.snippet || null, source.publishedDate || null, source.retrievedAt, source.sourceType || 'unknown');
    return { id, ...source };
  }

  getMessageSources(messageId: string): Source[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM sources WHERE message_id = ?').all(messageId) as DbSource[];
    return rows.map(r => ({
      id: r.id,
      title: r.title || '',
      url: r.url,
      domain: r.domain || '',
      snippet: r.snippet || undefined,
      publishedDate: r.published_date,
      retrievedAt: r.retrieved_at,
      sourceType: r.source_type as Source['sourceType'],
    }));
  }

  // ─── Cross-cutting queries ────────────────────────────────

  getConversationsByEntityName(entityName: string): Conversation[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT c.* FROM conversations c
      INNER JOIN conversation_entities ce ON c.id = ce.conversation_id
      INNER JOIN entities e ON ce.entity_id = e.id
      WHERE e.canonical_name LIKE ? COLLATE NOCASE
        OR e.aliases LIKE ?
      ORDER BY c.updated_at DESC
      LIMIT 20
    `).all(`%${entityName}%`, `%${entityName}%`) as DbConversation[];

    return rows.map(r => ({
      id: r.id, title: r.title, isPinned: Boolean(r.is_pinned), createdAt: r.created_at, updatedAt: r.updated_at,
    }));
  }

  getRecentConversations(days: number): Conversation[] {
    const db = getDb();
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const rows = db.prepare(
      'SELECT * FROM conversations WHERE updated_at >= ? ORDER BY updated_at DESC LIMIT 50'
    ).all(cutoff) as DbConversation[];
    return rows.map(r => ({
      id: r.id, title: r.title, isPinned: Boolean(r.is_pinned), createdAt: r.created_at, updatedAt: r.updated_at,
    }));
  }
}

export const repository = new Repository();
