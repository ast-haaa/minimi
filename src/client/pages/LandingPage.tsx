import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Globe, TrendingUp, Sparkles } from 'lucide-react';
import { HeroIllustration } from '../components/landing/HeroIllustration.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-background text-text-primary flex flex-col justify-between selection:bg-accent-soft selection:text-coral font-sans">
      {/* 1. Minimal Navbar */}
      <header className="h-14 border-b border-border px-4 sm:px-8 lg:px-12 flex items-center justify-between bg-white flex-shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-coral text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-coral-hover transition-colors">
            M
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-text-primary">
              MINIMI
            </span>
            <span className="text-[10px] font-semibold text-coral uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-peach-soft border border-border">
              RESEARCH AGENT
            </span>
          </div>
        </Link>

        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </header>

      {/* 2. Hero — Balanced Two-Column Layout (Desktop Single-Screen) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-0 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
          {/* LEFT SIDE: Content, Headline, CTA, Inline Capabilities */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-4 sm:space-y-5">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-soft border border-border text-coral text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-coral fill-current" />
              <span>YOUR PERSONAL AI RESEARCH PARTNER</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-text-primary leading-[1.12]">
              Research once.
              <br />
              <span className="bg-gradient-to-r from-coral to-magenta bg-clip-text text-transparent">
                Remember everything.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
              Your AI research companion that remembers past conversations, searches the live web, and tracks what changes over time.
            </p>

            {/* Primary Action Button */}
            <div className="pt-1">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-coral hover:bg-coral-hover text-white text-sm font-semibold transition-all shadow-card hover:shadow-card-hover active:scale-95 group"
              >
                <span>Start researching</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Three Small Inline Capabilities */}
            <div className="pt-2 border-t border-border/80 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5 font-medium text-text-primary">
                <Database className="w-3.5 h-3.5 text-coral" />
                <span>Smart Memory</span>
              </div>
              <span className="text-border text-sm font-light select-none">|</span>
              <div className="flex items-center gap-1.5 font-medium text-text-primary">
                <Globe className="w-3.5 h-3.5 text-magenta" />
                <span>Live Web Search</span>
              </div>
              <span className="text-border text-sm font-light select-none">|</span>
              <div className="flex items-center gap-1.5 font-medium text-text-primary">
                <TrendingUp className="w-3.5 h-3.5 text-coral" />
                <span>Change Tracking</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Vector Hero Illustration */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <HeroIllustration />
          </div>
        </div>
      </main>

      {/* 3. Minimal Clean Sub-Footer Note */}
      <footer className="py-2.5 border-t border-border px-4 sm:px-8 text-center text-xs text-text-secondary bg-white flex-shrink-0">
        <span>Minimi Research Agent · Persistent Memory · Verified Live Sources · Change Detection</span>
      </footer>
    </div>
  );
};
