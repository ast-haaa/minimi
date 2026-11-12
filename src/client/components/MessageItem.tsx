import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, User, Link as LinkIcon } from 'lucide-react';
import type { Message } from '../../shared/types.js';
import { SourceCard } from './SourceCard.js';

interface MessageItemProps {
  message: Message;
  isLatestAssistant?: boolean;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

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
        <div className="max-w-[80%] rounded-2xl bg-ivory-dark border border-border px-4 py-3 text-text-primary shadow-sm">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-8 group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg bg-highlight flex items-center justify-center flex-shrink-0 mt-0.5 border border-border">
        <Sparkles className="w-4 h-4 text-accent" />
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        {/* Header / Memory Pills */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-primary">Minimi</span>
            {memoryRefs.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-highlight text-accent font-medium border border-accent/20">
                <span>🧠 {memoryRefs.length} memory match{memoryRefs.length > 1 ? 'es' : ''}</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy answer"
              className="p-1 rounded text-taupe hover:text-text-primary hover:bg-ivory-dark transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Markdown Rendered Content */}
        <div className="prose prose-sm max-w-none text-text-primary leading-relaxed break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Sources Cards Grid */}
        {sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-accent transition-colors mb-2.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{sources.length} Cited Source{sources.length > 1 ? 's' : ''}</span>
              <span className="text-[10px] text-taupe">({showSources ? 'Hide' : 'Show'})</span>
            </button>

            {showSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
