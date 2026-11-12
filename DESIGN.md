# Minimi Architectural Design Document

## 1. System Architecture & Request Lifecycle

Minimi is a research-oriented conversational AI agent built with a single deterministic orchestrator pattern. The backend runs on Node.js/Express in TypeScript, coupled with SQLite via `better-sqlite3` (with WAL mode and FTS5 full-text indexing), and communicates with a React + Vite + Tailwind client using Server-Sent Events (SSE).

### End-to-End Request Lifecycle
```
User Prompt
    │
    ▼
[Chat API Route] (Zod validation, SSE handshake)
    │
    ▼
[Agent Orchestrator]
    ├─► 1. SQLite Storage: Persists incoming message
    ├─► 2. Date Resolver: Parses relative/absolute dates ("November 3", "last Tuesday")
    ├─► 3. Hybrid Memory Retrieval:
    │      ├─► SQLite FTS5 index matching (messages & facts)
    │      ├─► Normalized entity lookup (`entities` & `conversation_entities`)
    │      └─► Temporal window filtering (UTC converted)
    ├─► 4. Context Ranker: Assembles token-budgeted prompt with recent & historical facts
    ├─► 5. Tool Loop (OpenAI GPT-4o):
    │      └─► Evaluates need for live web evidence
    │      └─► If needed: invokes `web_search` (Tavily Search API)
    │      └─► Ingests evidence, sanitizes prompt-injection payloads, dedupes URLs
    ├─► 6. Temporal Comparison Engine: Correlates historical facts with current search results
    ├─► 7. Stream Response: Emits tokens via SSE to client
    ├─► 8. Citation Normalizer: Attaches authoritative sources
    └─► 9. Background Memory Extraction: Extracts entities and structured facts asynchronously
```

---

## 2. Why a Single Orchestrator Instead of Multiple Agents

A common anti-pattern in modern LLM applications is multi-agent proliferation (e.g. "Research Agent", "Fact Extraction Agent", "Comparison Agent", "Critic Agent" all communicating over message buses). In production, multi-agent chains introduce:
1. **Compounding latency and token cost**: 4–5 sequential LLM hops add 8–15 seconds to time-to-first-token.
2. **Cascading hallucination**: If Agent A makes a dubious assumption, Agent B treats it as authoritative ground truth.
3. **Fragile state synchronization**: Distributed coordination requires distributed rollbacks when an agent fails.

A **single deterministic orchestrator** controls the entire lifecycle in code. Logic that belongs in deterministic algorithms (FTS5 search, date parsing, token budget pruning, URL deduplication, and price extraction heuristics) runs in TypeScript with zero latency and zero hallucination risk. The LLM is invoked strictly where reasoning and synthesis are genuinely required: tool decision, comparative analysis, and final articulation.

---

## 3. Why Exactly One External Tool (`web_search`)

Exposing internal application capabilities (like `search_memory`, `save_fact`, `compare_dates`) as LLM function tools makes the model responsible for orchestration. Models frequently fail at:
- Remembering to invoke memory tools proactively on ambiguous follow-ups.
- Formulating correct database search queries.
- Looping repeatedly when memory queries return empty.

By keeping memory retrieval, date resolution, and context ranking in the application layer *before* the model turn begins, the orchestrator guarantees that historical evidence is always present in context if it exists. The LLM only needs one external capability that code alone cannot provide: querying the live internet via `web_search(query, recency_days?, domains?)`.

---

## 4. Conversation Memory Storage & Hybrid Retrieval

Memory is stored in a normalized relational schema (`conversations`, `messages`, `entities`, `conversation_entities`, `facts`, `sources`) augmented with SQLite FTS5 virtual tables:

### Multi-Stage Hybrid Retrieval
1. **Temporal Extraction**: The `date-resolver` detects temporal anchors ("yesterday", "last week", "3 November", "on Monday") and resolves them to exact ISO8601 UTC timestamp intervals based on the user's timezone.
2. **Entity Recognition**: The orchestrator extracts potential entity candidates (capitalized tokens, acronyms, quoted terms) and queries the `entities` table (including alias matches).
3. **FTS5 Full-Text Search**: The query is stemmed and searched against `messages_fts` and `facts_fts`. Special FTS operators are sanitized to prevent syntax exceptions.
4. **Context Scorer & Pruner**: Results are ranked by entity overlap (0.85), temporal alignment (0.80), and text relevance (0.70). A token budget allocator reserves space for immediate chat history and injects top-ranked historical facts into the system prompt.
5. **No Hallucination Fallback**: If no relevant memory is found, the system prompt explicitly states that no memory was retrieved, preventing the model from hallucinating past discussions.

---

## 5. Historical vs. Current Temporal Comparison

The comparison engine distinguishes between:
- **Historical Evidence**: Immutable records extracted from past discussions with explicit `observedAt` timestamps and source classifications (`user_stated`, `web_search`).
- **Current Evidence**: Freshly retrieved web documents normalized with publication dates and domain authority.
- **Unverified State**: When search fails to find unambiguous current pricing or status, the engine flags it as `unable_to_verify` rather than assuming "no change".

### Classification Taxonomy
- `price_increased` / `price_decreased`: Numeric delta on identical plans and billing intervals.
- `pricing_structure_changed`: Delta in billing period (e.g. monthly vs annual) or seat model.
- `new_plan_introduced` / `plan_discontinued`: Plan tier additions or removals.
- `major_feature_shipped` / `minor_feature_shipped`: Product changelog/release updates.
- `no_verified_change`: Explicit confirmation that attributes match earlier observations.
- `unable_to_verify`: Insufficient external data.

---

## 6. Sources, Uncertainty, and Defensive Security

1. **Prompt-Injection Sanitization**: External web snippets are stripped of delimiters (`[INST]`, `<<SYS>>`, `<|im_start|>`) and instruction-override prefixes ("ignore previous instructions") before entering prompt context.
2. **Source Authority Ranking**: Official domains (`docs.*`, `*.gov`, `*.edu`) and explicit pricing paths (`/pricing`, `/plans`) receive ranking boosts over generic forum posts.
3. **URL Deduplication**: Tracking parameters (`utm_*`, `ref`, `source`) and trailing slashes are stripped.
4. **Explicit Uncertainty**: When citations contradict each other or official pricing is gated behind sales calls, the assistant explicitly reports the discrepancy.

---

## 7. Trade-offs and Alternatives Considered

| Decision | Chosen Approach | Alternative Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Database** | SQLite + FTS5 + WAL | PostgreSQL + pgvector | Zero infrastructure setup, embeddable, FTS5 is sub-millisecond on conversational corpora. Designed with clean repository abstractions for trivial migration. |
| **Search API** | Tavily Search API | Google Custom Search / Serper | Tavily natively returns pre-cleaned content snippets optimized for LLM RAG pipelines. |
| **Tool Calling** | Single tool `web_search` | Multi-tool memory agent | Deterministic memory retrieval guarantees memory is loaded before prompting; eliminates tool looping bugs. |
| **Styling** | Tailwind CSS (Ivory palette) | Component library (MUI/AntD) | Strict adherence to custom warm ivory palette (`#FAF9F6`, `#B86F52`) without bloated bundle sizes. |

---

## 8. Known Limitations

1. **Local SQLite Concurrency**: Better-sqlite3 is synchronous and single-process. In a horizontally scaled cluster, a centralized PostgreSQL instance with connection pooling would be required.
2. **Dense Semantic Matching**: While FTS5 handles keyword stemming and entity linking with high precision, purely semantic paraphrasing without shared keywords relies on query expansion. Embedding vectors (e.g. sqlite-vec or pgvector) would complement FTS5 for conceptual recall.
3. **Deep Web Scraping**: The agent inspects Tavily's cleaned snippets. Deep JavaScript-rendered single-page app pricing calculators requiring interactive form inputs are beyond static snippet extraction.

---

## 9. Improvements With Another Week

1. **Hybrid Vector + BM25 Search**: Integrate local embedding generation (`all-MiniLM-L6-v2` via ONNX or OpenAI embeddings) directly in SQLite via `sqlite-vec` for hybrid dense-sparse retrieval.
2. **Automated Background Verification (Cron)**: Enable scheduled monitors that automatically re-run `web_search` for shortlisted tools every week and send change notifications.
3. **Interactive Visual Diffing**: Add side-by-side graphical timeline diffs showing product tiers evolving across consecutive conversations.
4. **Multi-Currency Normalization**: Integrate ECB/open-exchange rates to accurately compare cross-currency pricing changes over time.

