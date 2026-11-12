import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';
import type { ConversationListItem, HealthResponse } from '../../../shared/types.js';
import * as api from '../../lib/api.js';
import { DeleteModal } from './DeleteModal.js';
import { SettingsModal } from './SettingsModal.js';

interface SidebarProps {
  conversations: ConversationListItem[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
  isMobileDrawer = false,
}) => {
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    api.checkHealth().then(setHealth).catch(() => null);
  }, []);

  // Filter conversations: eliminate duplicate empty "New Conversation" entries with 0 messages unless active
  const filtered = useMemo(() => {
    const valid = conversations.filter((c) => {
      // Keep if it has messages, or has a real title, or is the active one
      if (c.id === currentId) return true;
      if (c.messageCount > 0) return true;
      if (c.title && !c.title.includes('New Conversation')) return true;
      return false;
    });

    if (!search.trim()) return valid;
    const term = search.toLowerCase();
    return valid.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.preview && c.preview.toLowerCase().includes(term))
    );
  }, [conversations, search, currentId]);

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

  const targetDeleteConv = conversations.find((c) => c.id === deletingId);

  // Collapsed Sidebar view (Desktop)
  if (!isOpen && !isMobileDrawer) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 border-r border-border bg-background-secondary h-screen w-14 flex-shrink-0 transition-all duration-200">
        <button
          onClick={onToggle}
          title="Open sidebar"
          className="p-2 rounded-lg hover:bg-white text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNew}
          title="New research chat"
          className="p-2 rounded-lg bg-accent-soft text-accent hover:bg-accent hover:text-white transition-all shadow-subtle"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const sidebarContent = (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-background-secondary border-r border-border select-none">
      {/* Brand & New Conversation */}
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-coral text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-coral-hover transition-colors">
              M
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-text-primary">
                  MINIMI
                </span>
                <span className="text-[8px] font-semibold text-coral uppercase tracking-widest px-1 py-0.2 rounded bg-peach-soft border border-border">
                  AGENT
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="p-1 rounded-lg hover:bg-white text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-xs shadow-subtle transition-all duration-150 active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions & memory..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-border text-xs text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 text-text-secondary hover:text-text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {grouped.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-1 text-xs text-text-secondary">
            <p className="font-medium text-text-primary">
              {search ? 'No matching discussions' : 'No previous research yet'}
            </p>
            <p className="text-[11px] leading-relaxed">
              {search
                ? 'Try a different keyword or clear search'
                : 'Start a new conversation to begin building your research memory.'}
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
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
                        ? 'bg-white border-l-[3px] border-l-coral border-y border-r border-border text-text-primary font-medium shadow-subtle'
                        : 'text-text-secondary hover:bg-white/70 hover:text-text-primary border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-6">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-coral' : 'text-text-secondary'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(item.id);
                      }}
                      title="Delete conversation"
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background-secondary text-text-secondary hover:text-status-error transition-all"
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
      <div className="p-3 border-t border-border bg-white flex items-center justify-between text-xs text-text-secondary">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors text-[11px]"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>System Status</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-success" />
          <span className="text-[10px] font-medium text-text-secondary">
            {health?.checks.aiProvider ? health.checks.aiProvider.toUpperCase() : 'Ready'}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingId)}
        conversationTitle={targetDeleteConv?.title}
        onConfirm={() => {
          if (deletingId) {
            onDelete(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />

      {/* Settings / System Info Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        health={health}
      />
    </aside>
  );

  if (isMobileDrawer) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex md:hidden">
        {/* Backdrop */}
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-text-primary/20 backdrop-blur-xs animate-in fade-in"
        />
        {/* Drawer */}
        <div className="relative z-10 w-72 h-full bg-background-secondary shadow-card animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return sidebarContent;
};
