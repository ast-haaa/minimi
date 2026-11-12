import React from 'react';
import { X, Database, Globe, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import type { HealthResponse } from '../../../shared/types.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthResponse | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  health,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/20 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white border border-border p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              Developer Diagnostics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Database */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-coral" />
              <div>
                <span className="font-medium text-text-primary block">SQLite Memory (WAL + FTS5)</span>
                <span className="text-[11px] text-text-secondary">Full-text indexing & entity store</span>
              </div>
            </div>
            {health?.checks.database ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-coral font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-status-error font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Error
              </span>
            )}
          </div>

          {/* AI Model Provider */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-magenta" />
              <div>
                <span className="font-medium text-text-primary block">
                  AI Provider: {health?.checks.aiProvider ? health.checks.aiProvider.toUpperCase() : 'Active'}
                </span>
                <span className="text-[11px] text-text-secondary">OpenAI-compatible tool calling</span>
              </div>
            </div>
            {health?.checks.groq || health?.checks.openai ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-coral font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-status-warning font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Degraded
              </span>
            )}
          </div>

          {/* Tavily Web Search */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background-secondary border border-border">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-coral" />
              <div>
                <span className="font-medium text-text-primary block">Tavily Search API</span>
                <span className="text-[11px] text-text-secondary">External live web verification</span>
              </div>
            </div>
            {health?.checks.tavily ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-coral font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-status-warning font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Missing Key
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-coral hover:bg-coral-hover text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
