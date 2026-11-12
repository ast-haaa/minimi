import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { SYSTEM_PROMPT, buildContextPrompt, EXTRACTION_PROMPT } from './prompts.js';
import { ToolHandler } from './tool-handler.js';
import { retrieveMemory, getRecentContext } from '../memory/memory-retrieval.js';
import { extractAndPersist, generateTitle } from '../memory/memory-extraction.js';
import { rankAndSelectContext } from '../memory/context-ranking.js';
import { compareHistoricalWithCurrent } from '../comparison/temporal-comparison.js';
import { isTemporalComparisonQuery } from '../comparison/change-detection.js';
import { repository } from '../database/repository.js';
import { logger } from '../utils/logger.js';
import { sanitizeHtml, formatSourcesSection, formatComparisonMarkdown } from './response-builder.js';
import type { Message, Source, ExtractedEntity, ExtractedFact, WebSearchResult } from '../../shared/types.js';

export interface OrchestratorOptions {
  apiKey?: string;
  openaiApiKey?: string;
  baseURL?: string;
  tavilyApiKey: string;
  model?: string;
  timezone?: string;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullContent: string, sources: Source[]) => void;
  onError: (error: Error) => void;
}

export class AgentOrchestrator {
  private openai: OpenAI;
  private toolHandler: ToolHandler;
  private model: string;
  private timezone: string;

  constructor(options: OrchestratorOptions) {
    const key = options.apiKey || options.openaiApiKey || '';
    this.openai = new OpenAI({
      apiKey: key,
      baseURL: options.baseURL,
    });
    this.toolHandler = new ToolHandler(options.tavilyApiKey);
    this.model = options.model || 'openai/gpt-oss-120b';
    this.timezone = options.timezone || 'UTC';
  }

  async processMessage(
    conversationId: string,
    userMessage: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const startTime = Date.now();
    this.toolHandler.resetTurn();
    const collectedSources: Source[] = [];
    const collectedSearchResults: WebSearchResult[] = [];

    try {
      // 1. Ensure conversation exists in DB
      let conversation = repository.getConversation(conversationId);
      if (!conversation) {
        conversation = repository.createConversation(conversationId, 'New Research Conversation');
      }

      // 2. Persist user message
      const savedUserMessage = repository.addMessage({
        conversationId,
        role: 'user',
        content: userMessage,
      });

      // 3. Load recent context for follow-up resolution
      const recentMessages = getRecentContext(conversationId, 10);

      // 4. Retrieve historical memory across previous conversations
      const memoryResult = await retrieveMemory(userMessage, conversationId, this.timezone);

      // 5. Rank and filter context
      const ranked = rankAndSelectContext(
        recentMessages,
        memoryResult.relevantMessages,
        memoryResult.relevantFacts,
        memoryResult.references
      );

      // 6. Assemble prompt messages
      const contextPrompt = buildContextPrompt(ranked.summary, this.timezone);
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextPrompt}` },
      ];

      // Add recent conversational messages (excluding the one just inserted)
      for (const m of recentMessages) {
        if (m.id === savedUserMessage.id) continue;
        messages.push({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        });
      }

      // Add current user prompt
      messages.push({ role: 'user', content: userMessage });

      // 7. Check if user is asking for temporal comparison
      const isComparison = isTemporalComparisonQuery(userMessage);
      if (isComparison && memoryResult.relevantFacts.length > 0) {
        messages.push({
          role: 'system',
          content:
            'Temporal comparison detected: Verify current state using web_search where appropriate, compare with historical records provided in memory, and clearly identify what changed, what stayed the same, and what is unverified.',
        });
      }

      // 8. Controlled Tool Execution Loop
      const tools: ChatCompletionTool[] = this.toolHandler.getToolDefinitions();
      let loopCount = 0;
      const maxLoops = 5;
      let assistantFinalText = '';

      while (loopCount < maxLoops) {
        loopCount++;

        // If at loop limit or cannot search further, force standard completion without tools
        if (loopCount === maxLoops || !this.toolHandler.canSearch()) {
          const finalStream = await this.openai.chat.completions.create({
            model: this.model,
            messages,
            stream: true,
            temperature: 0.2,
          });

          let chunkAcc = '';
          for await (const chunk of finalStream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              chunkAcc += delta;
              callbacks.onToken(delta);
            }
          }
          assistantFinalText = chunkAcc;
          break;
        }

        // Call model with web_search tool enabled
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.2,
        });

        const choice = response.choices[0];

        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
          // Model decided to call web_search
          messages.push(choice.message);

          for (const call of choice.message.tool_calls) {
            if (call.type === 'function' && call.function.name === 'web_search') {
              logger.info('Executing web_search tool', { args: call.function.arguments });
              const execResult = await this.toolHandler.executeWebSearch(
                call.id,
                call.function.arguments
              );

              collectedSources.push(...execResult.sources);
              collectedSearchResults.push(...execResult.rawResults);

              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: execResult.content,
              });
            }
          }
        } else {
          // Model completed without tool calls
          assistantFinalText = choice.message.content || '';
          callbacks.onToken(assistantFinalText);
          break;
        }
      }

      // 9. Post-processing: Add comparisons and citations if missing from text
      let structuredComparisons = '';
      if (isComparison && memoryResult.relevantFacts.length > 0) {
        // Collect entities
        const targetEntities = [
          ...new Set(memoryResult.relevantFacts.map((f) => f.entityName)),
        ];
        const allComps = [];
        for (const ent of targetEntities) {
          const comps = compareHistoricalWithCurrent(
            memoryResult.relevantFacts,
            collectedSearchResults,
            ent
          );
          allComps.push(...comps);
        }
        if (allComps.length > 0 && !assistantFinalText.includes('| Entity | Attribute |')) {
          structuredComparisons = formatComparisonMarkdown(allComps);
        }
      }

      // Deduplicate sources
      const finalUniqueSources = deduplicateSources(collectedSources);

      // Append source citations if model didn't format them
      let formattedSources = '';
      if (finalUniqueSources.length > 0 && !assistantFinalText.toLowerCase().includes('### sources')) {
        formattedSources = formatSourcesSection(finalUniqueSources);
      }

      const completeContent = sanitizeHtml(
        assistantFinalText + structuredComparisons + formattedSources
      );

      // 10. Persist assistant message and associated sources in SQLite
      repository.addMessage({
        conversationId,
        role: 'assistant',
        content: completeContent,
        metadata: {
          searchQueries: collectedSearchResults.length > 0 ? ['web_search'] : [],
          memoryReferences: memoryResult.references,
          processingTimeMs: Date.now() - startTime,
        },
        sources: finalUniqueSources,
      });

      // 11. Auto-update conversation title if first exchange
      const totalMessages = repository.getMessages(conversationId, 5);
      if (totalMessages.length <= 2 && (conversation.title.includes('New') || conversation.title.includes('Research Session'))) {
        const immediateTitle = generateTitle(userMessage);
        repository.updateConversationTitle(conversationId, immediateTitle);
        this.updateConversationTitle(conversationId, userMessage, completeContent).catch((e) =>
          logger.warn('Failed to update title', { error: String(e) })
        );
      }

      // 12. Asynchronous memory extraction
      this.extractMemoryBackground(
        conversationId,
        savedUserMessage.id,
        userMessage,
        completeContent,
        finalUniqueSources
      );

      callbacks.onComplete(completeContent, finalUniqueSources);
    } catch (err) {
      logger.error('Orchestrator error', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      callbacks.onError(errorObj);
    }
  }

  private async updateConversationTitle(
    conversationId: string,
    userText: string,
    assistantText: string
  ): Promise<void> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, concise conversation title (3 to 6 words) based on the query. Do not wrap in quotes.',
          },
          { role: 'user', content: userText },
          { role: 'assistant', content: assistantText.slice(0, 300) },
        ],
        max_tokens: 20,
        temperature: 0.3,
      });

      const title = completion.choices[0]?.message?.content?.trim() || generateTitle(userText);
      repository.updateConversationTitle(conversationId, title);
    } catch {
      repository.updateConversationTitle(conversationId, generateTitle(userText));
    }
  }

  private extractMemoryBackground(
    conversationId: string,
    messageId: string,
    userPrompt: string,
    assistantAnswer: string,
    sources: Source[]
  ): void {
    // Fire-and-forget background extraction
    (async () => {
      try {
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            {
              role: 'user',
              content: `User query: ${userPrompt}\n\nAssistant response: ${assistantAnswer.slice(0, 3000)}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 1000,
        });

        const jsonStr = response.choices[0]?.message?.content;
        if (!jsonStr) return;

        const parsed = JSON.parse(jsonStr) as {
          entities?: ExtractedEntity[];
          facts?: ExtractedFact[];
        };

        if (parsed.entities || parsed.facts) {
          const defaultSourceType = sources.length > 0 ? 'web_search' : 'user_stated';
          const factsWithDefaults = (parsed.facts || []).map((f) => ({
            ...f,
            observedAt: f.observedAt || new Date().toISOString(),
            sourceType: f.sourceType || defaultSourceType,
          }));

          extractAndPersist(
            conversationId,
            messageId,
            `${userPrompt}\n${assistantAnswer}`,
            'assistant',
            parsed.entities,
            factsWithDefaults
          );
        }
      } catch (err) {
        logger.warn('Background memory extraction error', { error: String(err) });
      }
    })();
  }
}

function deduplicateSources(sources: Source[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of sources) {
    const key = s.url.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}
