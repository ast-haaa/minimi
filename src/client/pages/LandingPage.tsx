import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  Database,
  Globe,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-text-primary flex flex-col justify-between selection:bg-accent-soft selection:text-accent-hover font-sans">
      {/* 1. Minimal Navbar */}
      <header className="h-14 border-b border-border px-4 sm:px-8 flex items-center justify-between bg-white flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-accent-hover transition-colors">
            M
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-text-primary">
              Minimi
            </span>
            <span className="text-[10px] font-medium text-accent uppercase tracking-wider">
              Research Agent
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-xs font-medium text-text-secondary hover:text-accent transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            How It Works
          </button>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-all shadow-sm"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Main Hero + Compact Preview Content (Single-Screen on Desktop) */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col justify-between">
        {/* Hero Header */}
        <div className="text-center flex flex-col items-center gap-1.5 max-w-2xl mx-auto">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-soft border border-border text-accent text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>AI Research Agent with Dual Memory & Live Web</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-text-primary leading-tight">
            Research once. Remember everything.
          </h1>

          {/* Short Two-Line Description */}
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-lg">
            A conversational research assistant that remembers past discussions,
            searches the live web, and pinpoints what changed over time.
          </p>

          {/* Two Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-sm"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background-secondary hover:bg-accent-soft text-text-primary text-xs font-medium border border-border transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* 3. Compact Product Preview */}
        <div className="w-full max-w-3xl mx-auto my-2 rounded-xl border border-border bg-white shadow-card overflow-hidden">
          {/* Preview Window Header */}
          <div className="bg-background-secondary border-b border-border px-3 py-1.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAE5F0]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAE5F0]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAE5F0]" />
              <span className="ml-2 font-medium text-text-secondary text-[10px]">
                minimi-agent — session: Postgres Hosting & Pricing
              </span>
            </div>
            <span className="text-[10px] text-accent font-medium bg-accent-soft px-2 py-0.5 rounded-full border border-border">
              SQLite FTS5 + Tavily Live
            </span>
          </div>

          {/* Chat Exchange Body */}
          <div className="p-3 sm:p-4 space-y-2.5 text-xs bg-white">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-background-secondary border border-border text-text-primary px-3 py-1.5 rounded-xl rounded-tr-xs max-w-md text-xs">
                "On Monday we shortlisted Supabase and Neon. Has any pricing changed since?"
              </div>
            </div>

            {/* Minimi Assistant Response */}
            <div className="flex gap-2.5 text-left">
              <div className="w-6 h-6 rounded-md bg-accent-soft text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-border">
                M
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary text-[11px]">Minimi</span>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full bg-accent-soft text-accent font-medium border border-border">
                    <Database className="w-2.5 h-2.5" />
                    Recalled shortlist from Monday (Nov 10)
                  </span>
                </div>

                <p className="text-text-secondary text-[11px] leading-relaxed">
                  I verified both providers against current pricing documentation via web search. Neither has increased prices since our discussion:
                </p>

                {/* Compact Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="p-2 rounded-lg border border-border bg-background-secondary/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary text-[11px]">Supabase Pro</div>
                      <div className="text-[10px] text-text-secondary">Was $25/mo · Now $25/mo</div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold text-[10px] border border-border">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                      Unchanged
                    </span>
                  </div>

                  <div className="p-2 rounded-lg border border-border bg-background-secondary/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-primary text-[11px]">Neon Scale</div>
                      <div className="text-[10px] text-text-secondary">Was $69/mo · Now $69/mo</div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold text-[10px] border border-border">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                      Unchanged
                    </span>
                  </div>
                </div>

                {/* Source chips */}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-text-secondary">
                  <span>Verified via:</span>
                  <span className="inline-flex items-center gap-1 text-accent hover:underline">
                    <ExternalLink className="w-2.5 h-2.5" /> supabase.com/pricing
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-accent hover:underline">
                    <ExternalLink className="w-2.5 h-2.5" /> neon.tech/pricing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Three Small Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-w-3xl mx-auto w-full pt-1">
          <div className="p-2.5 rounded-xl border border-border bg-white shadow-subtle hover:border-accent transition-colors flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent-soft text-accent flex-shrink-0 border border-border">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-primary">Smart Memory</h3>
              <p className="text-[11px] text-text-secondary leading-normal mt-0.5">
                SQLite FTS5 full-text indexing recalls past shortlists, dates & decisions.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-border bg-white shadow-subtle hover:border-accent transition-colors flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent-soft text-accent flex-shrink-0 border border-border">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-primary">Live Web Search</h3>
              <p className="text-[11px] text-text-secondary leading-normal mt-0.5">
                Single bounded tool queries Tavily with domain authority & pricing boosts.
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-border bg-white shadow-subtle hover:border-accent transition-colors flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-accent-soft text-accent flex-shrink-0 border border-border">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-text-primary">Change Tracking</h3>
              <p className="text-[11px] text-text-secondary leading-normal mt-0.5">
                Temporal diff engine detects price increases, feature drops & unknowns.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Minimal Desktop Footer Note */}
      <footer className="py-2 border-t border-border/80 text-center text-[11px] text-text-secondary bg-white flex-shrink-0">
        <span>Minimi Research Agent · Persistent Memory · Verified Live Sources</span>
      </footer>

      {/* How It Works Modal (Clean, Non-Scrolling Walkthrough) */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292432]/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-border shadow-card max-w-md w-full p-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-text-primary">
                  How Minimi Works
                </h3>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-text-primary text-xs">
                    Research & Memory Formation
                  </h4>
                  <p className="text-text-secondary text-[11px] leading-relaxed mt-0.5">
                    Ask Minimi to investigate tools, pricing, or technical options. Minimi extracts key entities and facts into persistent SQLite tables.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-text-primary text-xs">
                    Hybrid Retrieval on Return
                  </h4>
                  <p className="text-text-secondary text-[11px] leading-relaxed mt-0.5">
                    When you refer to "Monday's shortlist" or "November 3", Minimi's date resolver and FTS5 search retrieve exact matching records before generation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-accent text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-text-primary text-xs">
                    Live Web Verification & Temporal Diff
                  </h4>
                  <p className="text-text-secondary text-[11px] leading-relaxed mt-0.5">
                    Minimi searches current web sources, compares old vs new data points, and transparently classifies changes (price deltas, new plans, or unverified claims).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Close
              </button>
              <Link
                to="/app"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-all shadow-sm"
              >
                <span>Start Researching</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
