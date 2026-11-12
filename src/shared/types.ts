// Shared types used by both client and server

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: MessageMetadata;
  sources?: Source[];
}

export interface MessageMetadata {
  toolCalls?: ToolCall[];
  entities?: ExtractedEntity[];
  facts?: ExtractedFact[];
  searchQueries?: string[];
  memoryReferences?: MemoryReference[];
  processingTimeMs?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface Source {
  id?: string;
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  publishedDate?: string | null;
  retrievedAt: string;
  sourceType?: 'official' | 'documentation' | 'news' | 'blog' | 'forum' | 'unknown';
}

export interface ExtractedEntity {
  name: string;
  type: 'product' | 'company' | 'category' | 'technology' | 'person' | 'other';
  aliases?: string[];
}

export interface ExtractedFact {
  entityName: string;
  factType: 'price' | 'feature' | 'plan' | 'version' | 'date' | 'decision' | 'requirement' | 'conclusion' | 'comparison' | 'other';
  factValue: string;
  currency?: string;
  billingInterval?: string;
  planName?: string;
  observedAt: string;
  confidence: 'high' | 'medium' | 'low';
  sourceType: 'user_stated' | 'web_search' | 'inferred';
}

export interface MemoryReference {
  conversationId: string;
  conversationTitle?: string;
  messageId?: string;
  relevanceScore: number;
  matchType: 'entity' | 'text' | 'date' | 'fact';
  snippet?: string;
}

// API request/response types
export interface ChatRequest {
  conversationId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  sources?: Source[];
}

export interface ConversationListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  checks: {
    database: boolean;
    openai: boolean;
    groq?: boolean;
    aiProvider?: string;
    tavily: boolean;
  };
  timestamp: string;
}

// Comparison types
export interface TemporalComparison {
  entityName: string;
  attribute: string;
  historical: TemporalDataPoint | null;
  current: TemporalDataPoint | null;
  changeType: ChangeClassification;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface TemporalDataPoint {
  value: string;
  observedAt: string;
  source: string;
  sourceType: 'conversation_memory' | 'web_search';
  currency?: string;
  billingInterval?: string;
  planName?: string;
}

export type ChangeClassification =
  | 'price_increased'
  | 'price_decreased'
  | 'pricing_structure_changed'
  | 'new_plan_introduced'
  | 'plan_discontinued'
  | 'major_feature_shipped'
  | 'minor_feature_shipped'
  | 'no_verified_change'
  | 'unable_to_verify'
  | 'product_discontinued'
  | 'product_renamed';

// Search types  
export interface WebSearchParams {
  query: string;
  recency_days?: number;
  domains?: string[];
}

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string | null;
  domain: string;
}

