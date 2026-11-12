import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { ConversationListItem, HealthResponse } from '../../shared/types.js';
import * as api from '../lib/api.js';

interface SidebarProps {
  conversations: ConversationListItem[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}) => {
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.checkHealth().then(setHealth).catch(() => null);
  }, []);

  // Filter conversations
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const term = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.preview && c.preview.toLowerCase().includes(term))
    );
  }, [conversations, search]);

  // Group by relative date
  const grouped = useMemo(() => {
    const today: ConversationListItem[] = [];
    const yesterday: ConversationListItem[] = [];
    const pastWeek: ConversationListItem[] = [];
    const older: ConversationListItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfPastWeek = startOfToday - 86400000 * 7;

    for (const c of filtered) {
      const time = new Date(c.updatedAt).getTime();
      if (time >= startOfToday) {
        today.push(c);
      } else if (time >= startOfYesterday) {
        yesterday.push(c);
      } else if (time >= startOfPastWeek) {
        pastWeek.push(c);
      } else {
        older.push(c);
      }
    }

    return [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: pastWeek },
      { label: 'Older', items: older },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center py-4 px-2 border-r border-border bg-ivory h-screen">
        <button
          onClick={onToggle}
          title="Open sidebar"
          className="p-2 rounded-lg hover:bg-ivory-dark text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={onNew}
          title="New conversation"
          className="p-2 rounded-lg bg-highlight text-accent hover:bg-highlight/80 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-screen bg-ivory border-r border-border select-none">
      {/* Brand & New Conversation */}
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent text-surface flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-text-primary">
                Minimi
              </span>
              <span className="text-[10px] text-taupe uppercase tracking-wider font-medium">
                Research Agent
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="p-1.5 rounded-lg hover:bg-ivory-dark text-taupe hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-highlight hover:bg-highlight/80 text-accent font-medium text-xs border border-accent/20 transition-all duration-150 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-taupe pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-primary placeholder:text-taupe focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {grouped.length === 0 ? (
          <div className="text-center py-8 text-xs text-taupe">
            {search ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-taupe uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = item.id === currentId;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isActive
                        ? 'bg-surface border border-border text-text-primary font-medium shadow-xs'
                        : 'text-text-secondary hover:bg-ivory-dark hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-6">
                      <MessageSquare className="w-3.5 h-3.5 text-taupe flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      title="Delete conversation"
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-ivory text-taupe hover:text-accent transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-border bg-ivory-dark/40 flex items-center justify-between text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-taupe" />
          <span>FTS5 Memory Active</span>
        </div>
        <div className="flex items-center gap-1">
          {health?.status === 'ok' ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-accent font-medium">
              <CheckCircle2 className="w-3 h-3 text-accent" />
              Ready
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-taupe font-medium"
              title="Add API keys to .env for live agent calls"
            >
              <AlertCircle className="w-3 h-3 text-taupe" />
              Local DB
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

