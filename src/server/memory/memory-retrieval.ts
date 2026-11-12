import { repository } from '../database/repository.js';
import { resolveRelativeDate, detectDateReferences } from '../utils/date-resolver.js';
import type { Message, MemoryReference, ExtractedFact } from '../../shared/types.js';

export interface MemorySearchResult {
  references: MemoryReference[];
  relevantMessages: Message[];
  relevantFacts: ExtractedFact[];
  dateRange?: { from: string; to: string };
}

/**
 * Search memory for relevant context based on user query.
 * Combines FTS, entity matching, date filtering, and relevance ranking.
 */
export async function retrieveMemory(
  query: string,
  currentConversationId?: string,
  timezone: string = 'UTC'
): Promise<MemorySearchResult> {
  const references: MemoryReference[] = [];
  const allMessages: Message[] = [];
  const allFacts: ExtractedFact[] = [];

  // 1. Resolve date references
  const dateRanges = detectDateReferences(query, timezone);
  const dateFilters = dateRanges.length > 0
    ? { dateFrom: dateRanges[0].from.toISOString(), dateTo: dateRanges[0].to.toISOString() }
    : undefined;

  // 2. Extract potential entity names from the query
  const entityNames = extractPotentialEntities(query);

  // 3. FTS search across messages
  const searchTerms = buildSearchTerms(query);
  for (const term of searchTerms) {
    try {
      const messages = repository.searchMessages(term, {
        ...dateFilters,
      });
      for (const msg of messages) {
        if (!allMessages.find(m => m.id === msg.id)) {
          allMessages.push(msg);
          // Track which conversations are relevant
          if (msg.conversationId !== currentConversationId) {
            const conv = repository.getConversation(msg.conversationId);
            if (conv && !references.find(r => r.conversationId === conv.id && r.matchType === 'text')) {
              references.push({
                conversationId: conv.id,
                conversationTitle: conv.title,
                messageId: msg.id,
                relevanceScore: 0.7,
                matchType: 'text',
                snippet: msg.content.slice(0, 200),
              });
            }
          }
        }
      }
    } catch {
      // FTS may fail on some queries; continue
    }
  }

  // 4. Entity-based search
  for (const name of entityNames) {
    const entity = repository.findEntity(name);
    if (entity) {
      const convs = repository.getConversationsByEntityName(name);
      for (const conv of convs) {
        if (conv.id !== currentConversationId && !references.find(r => r.conversationId === conv.id && r.matchType === 'entity')) {
          references.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            relevanceScore: 0.85,
            matchType: 'entity',
          });
        }
      }

      // Get facts for this entity
      const facts = repository.findFacts({ entityName: name, ...dateFilters });
      for (const fact of facts) {
        if (!allFacts.find(f => f.entityName === fact.entityName && f.factType === fact.factType && f.factValue === fact.factValue)) {
          allFacts.push(fact);
        }
      }
    }
  }

  // 5. Search facts by text
  const factResults = repository.searchFacts(query);
  for (const fact of factResults) {
    if (!allFacts.find(f => f.entityName === fact.entityName && f.factType === fact.factType && f.factValue === fact.factValue)) {
      allFacts.push(fact);
    }
  }

  // 6. Date-based retrieval: if user references a specific date, get conversations from that period
  if (dateFilters) {
    const dateMessages = repository.searchMessages('', dateFilters);
    for (const msg of dateMessages) {
      if (!allMessages.find(m => m.id === msg.id)) {
        allMessages.push(msg);
      }
      if (msg.conversationId !== currentConversationId) {
        const conv = repository.getConversation(msg.conversationId);
        if (conv && !references.find(r => r.conversationId === conv.id && r.matchType === 'date')) {
          references.push({
            conversationId: conv.id,
            conversationTitle: conv.title,
            relevanceScore: 0.8,
            matchType: 'date',
          });
        }
      }
    }
  }

  // 7. If no results and query references "previous", "last", "our discussion", check recent conversations
  if (references.length === 0 && /\b(previous|last|earlier|before|our|we)\b/i.test(query)) {
    const recent = repository.getRecentConversations(30);
    for (const conv of recent) {
      if (conv.id !== currentConversationId) {
        references.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          relevanceScore: 0.5,
          matchType: 'date',
        });
        // Get messages from these conversations for context
        const msgs = repository.getMessages(conv.id, 10);
        for (const msg of msgs) {
          if (!allMessages.find(m => m.id === msg.id)) {
            allMessages.push(msg);
          }
        }
        if (references.length >= 5) break;
      }
    }
  }

  // 8. Rank and limit references
  references.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topReferences = references.slice(0, 10);

  // Limit messages to most relevant
  const relevantMessages = allMessages.slice(0, 20);

  return {
    references: topReferences,
    relevantMessages,
    relevantFacts: allFacts.slice(0, 20),
    dateRange: dateFilters ? { from: dateFilters.dateFrom!, to: dateFilters.dateTo! } : undefined,
  };
}

/**
 * Get recent conversation context for follow-up resolution.
 */
export function getRecentContext(conversationId: string, limit = 10): Message[] {
  return repository.getMessages(conversationId, limit);
}

/**
 * Build expanded search terms from the user's query.
 */
function buildSearchTerms(query: string): string[] {
  const terms: string[] = [];
  
  // Original query (cleaned)
  const cleaned = query.replace(/[?!.,;:'"]/g, ' ').trim();
  if (cleaned.length > 2) terms.push(cleaned);

  // Extract significant words (skip common words)
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'am', 'it', 'its', 'my', 'your', 'his', 'her', 'our', 'their',
    'me', 'him', 'us', 'them', 'i', 'you', 'he', 'she', 'we', 'they',
    'did', 'ask', 'asked', 'tell', 'told', 'said', 'say', 'know',
    'think', 'get', 'got', 'make', 'go', 'went', 'come', 'came',
    'last', 'previous', 'earlier', 'our', 'we', 'any', 'still',
  ]);

  const words = cleaned.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  
  // Create bigrams for multi-word entity names
  for (let i = 0; i < words.length - 1; i++) {
    terms.push(`${words[i]} ${words[i + 1]}`);
  }

  // Individual significant words
  for (const word of words) {
    if (!terms.includes(word)) terms.push(word);
  }

  return terms.slice(0, 8); // Limit search terms
}

/**
 * Extract potential entity names from query text.
 * Looks for capitalized words, quoted strings, and known patterns.
 */
function extractPotentialEntities(query: string): string[] {
  const entities: string[] = [];

  // Quoted strings
  const quoted = query.match(/"([^"]+)"|'([^']+)'/g);
  if (quoted) {
    for (const q of quoted) {
      entities.push(q.replace(/['"]/g, ''));
    }
  }

  // Capitalized multi-word sequences (likely product/company names)
  const capitalized = query.match(/\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)+\b/g);
  if (capitalized) {
    for (const c of capitalized) {
      entities.push(c);
    }
  }

  // Single capitalized words that aren't at sentence start
  const words = query.split(/\s+/);
  for (let i = 1; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z0-9]/g, '');
    if (word.length > 2 && /^[A-Z]/.test(word) && !/^(The|And|But|For|With|From|That|This|What|When|Where|How|Has|Have|Had|Did|Does|Can|Could|Would|Should|Will|May|Might|Must|Is|Are|Was|Were|Been|Be|Not|Our|Your|My|His|Her|Its|Their|About|Into|Over|After|Before|Between|Through)$/.test(word)) {
      entities.push(word);
    }
  }

  // Known product name patterns (tech products often have specific patterns)
  const techPatterns = query.match(/\b[A-Z][a-zA-Z]*(?:DB|SQL|API|JS|IO|AI|ML|CRM|ERP|HR)\b/g);
  if (techPatterns) {
    for (const p of techPatterns) {
      if (!entities.includes(p)) entities.push(p);
    }
  }

  return [...new Set(entities)].slice(0, 10);
}
