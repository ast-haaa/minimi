import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent-soft border border-accent/20 flex items-center justify-center text-accent">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-text-primary">
              MINIMI
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Conversational research agent with persistent SQLite memory, live Tavily web research, and temporal change detection.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-xs text-text-secondary">
          <div className="space-y-2">
            <span className="font-semibold text-text-primary block">Product</span>
            <Link to="/app" className="block hover:text-accent transition-colors">
              Workspace
            </Link>
            <a href="#overview" className="block hover:text-accent transition-colors">
              Overview
            </a>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-text-primary block">Architecture</span>
            <a href="#capabilities" className="block hover:text-accent transition-colors">
              FTS5 Memory
            </a>
            <a href="#features" className="block hover:text-accent transition-colors">
              Temporal Engine
            </a>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-text-primary block">Legal</span>
            <span className="block text-text-secondary">Local-first SQLite storage</span>
            <span className="block text-text-secondary">No persistent external tracking</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-text-secondary">
        <span>© {new Date().getFullYear()} Minimi AI. Built for the Minimi hiring challenge.</span>
        <span>Engineered with TypeScript, SQLite, Groq, and Tavily.</span>
      </div>
    </footer>
  );
};
