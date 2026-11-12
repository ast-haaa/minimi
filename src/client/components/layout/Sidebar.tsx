import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Pin,
  MoreHorizontal,
  Pencil,
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
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onRename?: (id: string, newTitle: string) => void;
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
  onTogglePin,
  onRename,
  isOpen,
  onToggle,
  isMobileDrawer = false,
}) => {
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.checkHealth().then(setHealth).catch(() => null);
  }, []);

  // Close three-dot menu when clicking outside
  useEffect(() => {
    if (!menuOpenId) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpenId]);

  // Clean titles, eliminate empty placeholder duplicates, and filter by search
  const filtered = useMemo(() => {
    // 1. Filter out empty conversations with 0 messages unless active or pinned
    const valid = conversations.filter((c) => {
      if (c.isPinned) return true;
      if (c.id === currentId) return true;
      if (c.messageCount > 0) return true;
      return false;
    });

    // 2. Clean titles: strip outer quotes and never show placeholder 'New Conversation'
    const cleaned = valid.map((c) => {
      let title = c.title || '';
      if (title.startsWith('"') && title.endsWith('"') && title.length > 2) {
        title = title.slice(1, -1);
      }
      if (title === 'New Conversation' || !title.trim()) {
        if (c.preview && c.preview.trim()) {
          const text = c.preview.replace(/^["']|["']$/g, '').trim();
          title = text.length <= 50 ? text : text.slice(0, 47) + '…';
        } else {
          title = 'Research Session';
        }
      }
      return { ...c, title };
    });

    if (!search.trim()) return cleaned;
    const term = search.toLowerCase();
    return cleaned.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.preview && c.preview.toLowerCase().includes(term))
    );
  }, [conversations, search, currentId]);

  // Split into Pinned and Recent
  const { pinned, recentGrouped } = useMemo(() => {
    const pinnedList: ConversationListItem[] = [];
    const unpinnedList: ConversationListItem[] = [];

    for (const c of filtered) {
      if (c.isPinned) {
        pinnedList.push(c);
      } else {
        unpinnedList.push(c);
      }
    }

    // Group unpinned by relative date
    const today: ConversationListItem[] = [];
    const yesterday: ConversationListItem[] = [];
    const pastWeek: ConversationListItem[] = [];
    const older: ConversationListItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfPastWeek = startOfToday - 86400000 * 7;

    for (const c of unpinnedList) {
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

    const groups = [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'Previous 7 Days', items: pastWeek },
      { label: 'Older', items: older },
    ].filter((g) => g.items.length > 0);

    return { pinned: pinnedList, recentGrouped: groups };
  }, [filtered]);

  const targetDeleteConv = conversations.find((c) => c.id === deletingId);

  // Render a conversation item row
  const renderConversationItem = (item: ConversationListItem, isPinnedSection: boolean) => {
    const isActive = item.id === currentId;
    const isRenaming = renamingId === item.id;
    const isMenuOpen = menuOpenId === item.id;

    return (
      <div
        key={item.id}
        onClick={() => {
          if (!isRenaming) {
            onSelect(item.id);
          }
        }}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer text-xs transition-all ${
          isActive
            ? 'bg-white border-l-[3px] border-l-coral border-y border-r border-border text-text-primary font-medium shadow-subtle'
            : 'text-text-secondary hover:bg-white/80 hover:text-text-primary border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-6">
          {item.isPinned ? (
            <Pin className="w-3.5 h-3.5 text-coral fill-current flex-shrink-0 -rotate-45" />
          ) : (
            <MessageSquare
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                isActive ? 'text-coral' : 'text-text-secondary/70'
              }`}
            />
          )}

          {isRenaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (renameTitle.trim() && onRename) {
                  onRename(item.id, renameTitle.trim());
                }
                setRenamingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0"
            >
              <input
                type="text"
                autoFocus
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onBlur={() => {
                  if (renameTitle.trim() && onRename && renameTitle.trim() !== item.title) {
                    onRename(item.id, renameTitle.trim());
                  }
                  setRenamingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setRenamingId(null);
                  }
                }}
                className="w-full px-2 py-0.5 text-xs bg-white border border-coral rounded-md focus:outline-none focus:ring-1 focus:ring-coral text-text-primary"
              />
            </form>
          ) : (
            <span className="truncate">{item.title}</span>
          )}
        </div>

        {/* Three-dot action menu trigger */}
        {!isRenaming && (
          <div className="absolute right-1.5 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(isMenuOpen ? null : item.id);
              }}
              title="Conversation actions"
              className={`p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-opacity ${
                isMenuOpen ? 'opacity-100 bg-background-secondary text-text-primary' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 z-30 w-36 py-1 bg-white rounded-xl border border-border shadow-card text-xs animate-in fade-in duration-100"
              >
                <button
                  onClick={() => {
                    onTogglePin?.(item.id, !item.isPinned);
                    setMenuOpenId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-text-primary hover:bg-background-secondary transition-colors"
                >
                  <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'text-coral fill-current' : 'text-text-secondary'}`} />
                  <span>{item.isPinned ? 'Unpin' : 'Pin to top'}</span>
                </button>

                <button
                  onClick={() => {
                    setRenamingId(item.id);
                    setRenameTitle(item.title);
                    setMenuOpenId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-text-primary hover:bg-background-secondary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Rename</span>
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  onClick={() => {
                    setDeletingId(item.id);
                    setMenuOpenId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-status-error hover:bg-pink-soft/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
          className="p-2 rounded-lg bg-coral text-white hover:bg-coral-hover transition-all shadow-subtle"
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white font-medium text-xs shadow-subtle transition-all duration-150 active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
            placeholder="Search conversations..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-border text-xs text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-coral transition-colors"
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
        {/* Pinned Section */}
        {pinned.length > 0 && (
          <div className="space-y-1 pb-2 mb-2 border-b border-border/80">
            <div className="px-2.5 py-1 text-[10px] font-bold text-coral uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-coral fill-current -rotate-45" />
                <span>PINNED</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-peach-soft text-coral font-semibold border border-border">
                {pinned.length}
              </span>
            </div>
            {pinned.map((item) => renderConversationItem(item, true))}
          </div>
        )}

        {/* Recent Section */}
        {recentGrouped.length === 0 && pinned.length === 0 ? (
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
          recentGrouped.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                {group.label}
              </div>
              {group.items.map((item) => renderConversationItem(item, false))}
            </div>
          ))
        )}
      </div>

      {/* Subtle Status Footer (No technical provider labels) */}
      <div className="p-3 border-t border-border bg-white flex items-center justify-between text-xs text-text-secondary">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors text-[11px]"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Diagnostics</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-success" />
          <span className="text-[10px] font-medium text-text-secondary">
            Ready
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
