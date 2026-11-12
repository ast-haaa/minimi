import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, Link as LinkIcon, RotateCcw } from 'lucide-react';
import type { Message } from '../../../shared/types.js';
import { SourceCard } from './SourceCard.js';

interface MessageItemProps {
  message: Message;
  isLatestAssistant?: boolean;
  onRetry?: () => void;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLatestAssistant,
  onRetry,
  isStreaming,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sources = message.sources || [];
  const memoryRefs = message.metadata?.memoryReferences || [];

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-background-secondary border border-border px-4 py-3 text-text-primary shadow-subtle">
          <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 mb-8 group animate-in fade-in duration-150">
      {/* Assistant Avatar */}
      <div className="w-8 h-8 rounded-xl bg-pink-soft border border-magenta/20 text-magenta flex items-center justify-center flex-shrink-0 mt-0.5 shadow-subtle">
        <Sparkles className="w-4 h-4 fill-current" />
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        {/* Header / Memory Pills & Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-primary tracking-tight">
              Minimi
            </span>

            {/* Memory indicator badge */}
            {memoryRefs.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-peach-soft text-coral font-medium border border-border">
                <span>🧠 {memoryRefs.length} past discussion{memoryRefs.length > 1 ? 's' : ''} referenced</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy response"
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-coral" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {isLatestAssistant && onRetry && !isStreaming && (
              <button
                onClick={onRetry}
                title="Regenerate response"
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Markdown Rendered Content */}
        <div className="prose prose-sm max-w-none text-text-primary text-xs sm:text-sm leading-relaxed break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-coral animate-pulse align-middle" />
          )}
        </div>

        {/* Cited Sources Grid */}
        {sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-coral transition-colors mb-2.5"
            >
              <LinkIcon className="w-3.5 h-3.5 text-coral" />
              <span>{sources.length} Verified Source{sources.length > 1 ? 's' : ''}</span>
              <span className="text-[10px] text-text-secondary/70">
                ({showSources ? 'Hide' : 'Show'})
              </span>
            </button>

            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sources.map((src, i) => (
                  <SourceCard key={src.id || i} source={src} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
