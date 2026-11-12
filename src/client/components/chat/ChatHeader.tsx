import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Home } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onToggleSidebar,
  onNewChat,
}) => {
  return (
    <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-white/95 backdrop-blur-sm z-10 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text-primary transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="font-semibold text-xs text-text-primary truncate max-w-sm sm:max-w-md">
          {title || 'New Research Session'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Research Capability Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-peach-soft text-coral text-[11px] font-medium border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
          <span>FTS5 Memory + Live Tavily</span>
        </div>

        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          title="Start new research conversation"
        >
          <Plus className="w-4 h-4" />
        </button>

        <Link
          to="/"
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          title="Back to Landing Page"
        >
          <Home className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
