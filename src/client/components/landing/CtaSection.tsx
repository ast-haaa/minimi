import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CtaSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="rounded-3xl border border-accent/20 bg-accent-soft p-8 sm:p-14 text-center flex flex-col items-center shadow-card">
        <div className="w-12 h-12 rounded-2xl bg-white border border-accent/30 text-accent flex items-center justify-center mb-6 shadow-subtle">
          <Sparkles className="w-6 h-6 fill-current" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary max-w-xl mb-4 leading-tight">
          Your next question starts where the last one ended.
        </h2>

        <p className="text-sm text-text-secondary max-w-lg mb-8 leading-relaxed">
          Open the Minimi workspace and start exploring technical questions with persistent memory and verified web research.
        </p>

        <Link
          to="/app"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-card hover:shadow-card-hover transition-all duration-150 active:scale-[0.98]"
        >
          <span>Start researching</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
