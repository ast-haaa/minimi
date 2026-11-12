import React, { useRef, useEffect } from 'react';
import { Sparkles, Compass, History, TrendingUp, Search } from 'lucide-react';
import type { Message, Source } from '../../shared/types.js';
import { MessageItem } from './MessageItem.js';
import { ChatInput } from './ChatInput.js';

interface ChatAreaProps {
  messages: Message[];
  conversationTitle?: string;
  isStreaming: boolean;
  streamingContent: string;
  streamingSources: Source[];
  error: string | null;
  onSendMessage: (text: string) => void;
  onStop: () => void;
  onRetry: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  conversationTitle,
  isStreaming,
  streamingContent,
  streamingSources,
  error,
  onSendMessage,
  onStop,
  onRetry,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on messages/streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const starterPrompts = [
    {
      icon: TrendingUp,
      title: 'Track Recent Changes',
      prompt: 'What has changed in pricing or product updates since our last discussion?',
    },
    {
      icon: History,
      title: 'Historical Memory',
      prompt: 'What did we conclude about the best option in our previous research?',
    },
    {
      icon: Compass,
      title: 'Pricing Comparison',
      prompt: 'Compare current pricing with previous pricing for the tools we shortlisted.',
    },
    {
      icon: Search,
      title: 'Live Web Research',
      prompt: 'Research the current pricing and tier limits of Supabase and Neon Postgres.',
    },
  ];

  return (
    <main className="flex-1 flex flex-col h-screen bg-surface overflow-hidden relative">
      {/* Top Header */}
      <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-surface/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-xs text-text-primary truncate">
            {conversationTitle || 'New Research Session'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-ivory-dark text-taupe font-medium border border-border">
            Dual Memory + Web Search
          </span>
        </div>
      </header>

      {/* Message Stream or Empty Welcome */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !isStreaming ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-highlight border border-accent/20 flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary tracking-tight mb-2">
                Minimi Research Agent
              </h2>
              <p className="text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
                A persistent research partner that remembers your past conversations, verifies live facts on the web, and tracks what changed over time.
              </p>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                {starterPrompts.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => onSendMessage(p.prompt)}
                      className="p-3.5 rounded-xl border border-border bg-ivory hover:border-accent hover:bg-highlight/30 transition-all duration-150 flex flex-col gap-1.5 text-left group"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                        <Icon className="w-3.5 h-3.5 text-accent" />
                        <span>{p.title}</span>
                      </div>
                      <span className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {p.prompt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isLatestAssistant={index === messages.length - 1 && msg.role === 'assistant'}
                  onRetry={onRetry}
                />
              ))}

              {/* Streaming Bubble */}
              {isStreaming && (
                <MessageItem
                  message={{
                    id: 'streaming-temp',
                    conversationId: 'temp',
                    role: 'assistant',
                    content: streamingContent || 'Investigating memory and web evidence...',
                    createdAt: new Date().toISOString(),
                    sources: streamingSources,
                  }}
                />
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="my-4 p-3 rounded-xl bg-highlight/60 border border-accent/30 text-xs text-accent flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={onRetry}
                className="underline font-medium hover:text-accent-hover ml-3"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Tray */}
      <ChatInput
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onStop={onStop}
      />
    </main>
  );
};
