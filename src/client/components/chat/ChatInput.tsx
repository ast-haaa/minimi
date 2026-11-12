import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStop,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStop();
      return;
    }
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2 rounded-2xl border border-border bg-white shadow-card focus-within:border-coral focus-within:ring-2 focus-within:ring-coral/15 transition-all duration-150"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, compare tools, or track pricing changes..."
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none max-h-44 leading-relaxed"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-coral hover:bg-coral-hover text-white flex items-center justify-center transition-colors shadow-subtle"
            title="Stop generation"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 shadow-subtle ${
              input.trim() && !disabled
                ? 'bg-coral hover:bg-coral-hover text-white active:scale-95'
                : 'bg-background-secondary text-text-secondary/40 cursor-not-allowed'
            }`}
            title="Send message (Enter)"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </form>

      <div className="flex justify-center items-center px-2 pt-2 text-[10px] text-text-secondary/80">
        <span>Press Enter to send · Shift + Enter for new line</span>
      </div>
    </div>
  );
};
