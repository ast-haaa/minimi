# Minimi — Conversational Research AI Agent

> A production-quality conversational research agent built for the Minimi hiring challenge. Minimi features persistent conversation memory across sessions, date-aware hybrid retrieval, live web research using Tavily, and a temporal comparison engine that identifies what has changed over time.

---

## Key Features

1. **Persistent SQLite Memory with FTS5**: Full conversation and structured fact extraction persisted locally with SQLite in WAL mode. Uses FTS5 full-text indexing, exact entity matching, and date range filtering.
2. **Single External Tool (`web_search`)**: The model is provided exactly one external tool (`web_search(query, recency_days?, domains?)`). Memory retrieval and temporal comparison are managed by the application orchestrator.
3. **Temporal Comparison Engine**: Differentiates between historical memory facts and current web data, classifying changes into price increases/decreases, structural changes, new/discontinued plans, feature updates, and unverified states.
4. **Natural Date Resolution**: Resolves relative dates ("today", "yesterday", "last week", "3 days ago", "last Tuesday", "on Monday", "November 3") into precise UTC timestamp intervals.
5. **Prompt-Injection Defense**: Sanitizes external search snippets to strip prompt-injection patterns (`[INST]`, `<<SYS>>`, `ignore previous instructions`) before prompt assembly.
6. **Bespoke Light-Mode UI**: Built strictly with the warm ivory design palette (`#FAF9F6`, `#F3F0EB`, `#292722`, `#B86F52`), featuring SSE streaming, collapsible history sidebar, and clickable citation cards.

---

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Lucide React + React Markdown
- **Backend**: Node.js + Express + TypeScript + `better-sqlite3` + Helmet + CORS + Zod
- **AI & Web Search**: OpenAI API (tool calling with GPT-4o) + Tavily Search API
- **Testing**: Vitest with unit & integration suites

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Populate your API keys in `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
OPENAI_MODEL=gpt-4o
DATABASE_PATH=./data/minimi.db
PORT=3001
APP_TIMEZONE=UTC
```

> **Note**: If API keys are not supplied, the application starts in degraded mode with full database and memory capabilities active. Tests run deterministically with mocked fixtures without requiring live credentials.

### 3. Run Development Server
```bash
npm run dev
```
This runs both the backend Express server on port `3001` and the Vite client on port `5173` concurrently.

Visit **http://localhost:5173** in your browser.

---

## Running the Automated Test Suite

Run the full Vitest suite covering memory retrieval, date resolution, search sanitization, temporal comparison, and chat persistence:
```bash
npm test
```

Run TypeScript compilation check:
```bash
npm run lint
```

Build the production bundle:
```bash
npm run build
```

---

## Database Schema Overview

The SQLite database (`./data/minimi.db`) is initialized automatically on first startup:

- `conversations`: Stores session metadata (`id`, `title`, `created_at`, `updated_at`).
- `messages`: Stores raw messages with roles and structured JSON metadata.
- `entities`: Canonical entity names, categories, and aliases.
- `conversation_entities`: Many-to-many relationship linking entities to conversations.
- `facts`: Structured facts (`entity_id`, `fact_type`, `fact_value`, `currency`, `billing_interval`, `plan_name`, `observed_at`, `confidence`, `source_type`).
- `sources`: Normalized web citations attached to messages.
- `messages_fts` / `facts_fts`: SQLite FTS5 virtual tables with automatic sync triggers.

---

## Architectural Documentation

For an in-depth explanation of design decisions, memory retrieval mechanics, temporal comparison taxonomy, and trade-offs, please read [DESIGN.md](./DESIGN.md).

