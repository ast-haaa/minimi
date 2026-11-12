import React from 'react';
import { Sparkles, TrendingUp, History, GitCompare, Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  const starterPrompts = [
    {
      icon: TrendingUp,
      title: 'Track Recent Changes',
      prompt: 'What has changed in pricing or product updates since our last discussion?',
    },
    {
      icon: History,
      title: 'Historical Memory',
      prompt: 'Recheck the pricing and tier limits we researched earlier.',
    },
    {
      icon: GitCompare,
      title: 'Compare Shortlisted Options',
      prompt: 'Compare products we shortlisted in previous research.',
    },
    {
      icon: Globe,
      title: 'Live Web Research',
      prompt: 'Research the current pricing, tier limits, and feature updates of Supabase and Neon.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 px-4 flex flex-col items-center text-center max-w-2xl mx-auto">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center text-accent mb-5 shadow-subtle">
        <Sparkles className="w-6 h-6 fill-current" />
      </div>

      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2.5">
        What would you like to research?
      </h2>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
        Ask anything. Minimi remembers your previous research and helps you accurately understand what changes over time.
      </p>

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {starterPrompts.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={i}
              onClick={() => onSelectPrompt(p.prompt)}
              className="p-4 rounded-xl border border-border bg-white hover:border-accent/50 hover:bg-background-secondary/50 hover:shadow-subtle transition-all duration-150 flex flex-col gap-1.5 text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                <Icon className="w-3.5 h-3.5 text-accent" />
                <span>{p.title}</span>
              </div>
              <span className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                {p.prompt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
