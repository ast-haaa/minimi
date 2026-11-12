import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { ProductPreview } from './ProductPreview.js';

export const HeroSection: React.FC = () => {
  return (
    <section id="overview" className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Personal AI Research Partner</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary leading-[1.12] mb-6">
          Research once.{' '}
          <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
            Remember everything.
          </span>
        </h1>

        {/* Supporting copy */}
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mb-8">
          An AI research agent that remembers your previous discussions, searches the live web, and accurately determines what has changed over time.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-card hover:shadow-card-hover transition-all duration-150 active:scale-[0.98]"
          >
            <span>Start researching</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-background-secondary hover:bg-border/60 border border-border text-text-primary text-sm font-medium transition-all duration-150"
          >
            <BookOpen className="w-4 h-4 text-text-secondary" />
            <span>Explore how it works</span>
          </a>
        </div>
      </div>

      {/* Interface Demonstration Preview */}
      <div className="relative max-w-4xl mx-auto">
        <ProductPreview />
      </div>
    </section>
  );
};
