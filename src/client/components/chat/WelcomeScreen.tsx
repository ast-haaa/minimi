import React from 'react';
import { Sparkles, TrendingUp, History, GitCompare, Globe, ArrowUpRight } from 'lucide-react';

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
    <div className="py-10 sm:py-14 px-4 flex flex-col items-center text-center max-w-xl mx-auto">
      {/* Icon */}
      <div className="w-11 h-11 rounded-2xl bg-peach-soft border border-border flex items-center justify-center text-coral mb-4 shadow-subtle animate-float-slow">
        <Sparkles className="w-5 h-5 fill-current" />
      </div>

      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
        What would you like to research?
      </h2>

      {/* Supporting text */}
      <p className="text-xs sm:text-sm text-text-secondary max-w-md mb-7 leading-relaxed">
        Ask anything. Minimi remembers your previous research and helps you understand what changes over time.
      </p>

      {/* Suggested prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {starterPrompts.map((p, i) => {
          const Icon = p.icon;
          const isMagenta = i % 2 === 1;
          return (
            <button
              key={i}
              onClick={() => onSelectPrompt(p.prompt)}
              className="p-3.5 rounded-xl border border-border bg-white hover:border-coral/50 hover:bg-background-secondary/60 hover:shadow-card transition-all duration-150 flex flex-col gap-1.5 text-left group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary group-hover:text-coral transition-colors">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isMagenta ? 'bg-pink-soft text-magenta' : 'bg-peach-soft text-coral'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{p.title}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-text-secondary/50 group-hover:text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <span className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 pl-0.5">
                {p.prompt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
