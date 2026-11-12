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
    <header className="h-14 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-white z-10 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-background-secondary text-text-secondary hover:text-text-primary transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-coral text-white flex items-center justify-center font-bold text-[10px] shadow-xs flex-shrink-0">
            M
          </div>
          <h1 className="font-semibold text-xs sm:text-sm text-text-primary truncate max-w-sm sm:max-w-md">
            {title || 'New Research Session'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-coral hover:bg-coral-hover text-white text-xs font-medium transition-colors shadow-xs active:scale-95"
          title="Start new research conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
