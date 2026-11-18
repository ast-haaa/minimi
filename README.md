# Minimi — Conversational Research AI Agent

> A production-quality conversational research agent built for the Minimi hiring challenge. Minimi features persistent conversation memory across sessions, date-aware hybrid retrieval, live web research using Tavily, and a temporal comparison engine that tracks changes over time.

[![Repository](https://img.shields.io/badge/GitHub-ast--haaa%2Fminimi-F0644F?style=flat&logo=github)](https://github.com/ast-haaa/minimi)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-FTS5-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![Groq](https://img.shields.io/badge/Groq-gpt--oss--120b-F0644F?style=flat)](https://groq.com/)
[![Tests](https://img.shields.io/badge/Vitest-40%20passing-success?style=flat&logo=vitest)](https://vitest.dev/)

---

## Key Features

1. **Persistent SQLite Memory with FTS5**: Full conversation transcripts and structured facts persisted locally in SQLite (WAL mode). Leverages FTS5 full-text indexing, entity graph resolution, and date-range filtering.
2. **Flexible AI Provider (Groq / OpenAI)**: Built using the OpenAI SDK with full OpenAI-compatible API support. Seamlessly switch between **Groq** (`openai/gpt-oss-120b`) and **OpenAI** (`gpt-4o`) with strict environment-level validation.
3. **Single External Tool (`web_search`)**: The AI agent is provided exactly one external tool (`web_search(query, recency_days?, domains?)`). Memory retrieval and temporal comparisons are handled deterministically in TypeScript code by the orchestrator.
4. **Temporal Comparison & Change Detection**: Correlates historical memory facts with current live web search results, classifying updates into price increases/decreases, tier limit changes, new/discontinued plans, feature changes, or unchanged states.
5. **Persistent Conversation Pinning & Management**: Pin important research sessions to the top, rename conversations with inline editing, or delete sessions with confirmation modals. Fully persisted in SQLite.
6. **Natural Date Resolution**: Resolves relative natural language dates ("today", "yesterday", "last week", "3 days ago", "last Tuesday", "on Monday", "November 3") into precise UTC timestamp intervals.
7. **Prompt-Injection Defense**: Sanitizes external search snippets to strip prompt-injection patterns (`[INST]`, `<<SYS>>`, `ignore previous instructions`) before prompt assembly.
8. **Modern Coral & Magenta Brand Identity**: Clean, single-screen landing page within `100vh` featuring vector AI research illustration and micro-interactions, paired with a distraction-free research workspace.

---

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Lucide React + React Markdown + Remark GFM
- **Backend**: Node.js + Express + TypeScript + `better-sqlite3` + Helmet + CORS + Zod
- **AI & Web Search**: Groq / OpenAI API (tool calling with `openai/gpt-oss-120b` or `gpt-4o`) + Tavily Search API
- **Testing**: Vitest with unit and integration test suites (40 tests passing)

---

## Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ast-haaa/minimi.git
cd minimi
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Populate your API keys in `.env`:

#### Option A: Groq (Recommended default)
```env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
AI_MODEL=openai/gpt-oss-120b
TAVILY_API_KEY=your_tavily_api_key_here
DATABASE_PATH=./data/minimi.db
PORT=3001
APP_TIMEZONE=Asia/Kolkata
```

#### Option B: OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-4o
TAVILY_API_KEY=your_tavily_api_key_here
DATABASE_PATH=./data/minimi.db
PORT=3001
APP_TIMEZONE=Asia/Kolkata
```

> **Note**: API keys are strictly validated via Zod at runtime and are never printed or leaked in application logs. If keys are missing, the server operates in degraded mode while preserving all local SQLite memory and search capabilities.

### 3. Run Development Server
```bash
npm run dev
```
This runs both the backend Express API server on port `3001` and the Vite client on port `5173` concurrently.

Open **http://localhost:5173** in your browser.

---

## Verification & Test Suite

Run the full Vitest suite covering memory retrieval, date resolution, Tavily search sanitization, temporal comparison, Groq tool-calling, and conversation pinning:
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

## Database Architecture

The SQLite database (`./data/minimi.db`) is automatically migrated and managed:

- `conversations`: Stores session metadata (`id`, `title`, `is_pinned`, `created_at`, `updated_at`).
- `messages`: Stores raw messages with roles and structured JSON metadata.
- `entities`: Canonical entity names, categories, and aliases.
- `conversation_entities`: Many-to-many relationship linking entities to conversations.
- `facts`: Structured facts (`entity_id`, `fact_type`, `fact_value`, `currency`, `billing_interval`, `plan_name`, `observed_at`, `confidence`, `source_type`).
- `sources`: Normalized web citations attached to messages.
- `messages_fts` / `facts_fts`: SQLite FTS5 virtual tables with automatic sync triggers.

---

## Architectural Documentation

For an in-depth breakdown of architectural decisions, memory retrieval mechanics, temporal comparison taxonomy, and trade-offs, please read [DESIGN.md](./DESIGN.md).
