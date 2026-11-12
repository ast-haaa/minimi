import React from 'react';
import { Database, Globe, History } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const capabilities = [
    {
      icon: Database,
      title: 'Persistent Conversation Memory',
      description: 'Indexed locally with SQLite FTS5 for hybrid keyword, entity, and date retrieval.',
    },
    {
      icon: Globe,
      title: 'Live Web Research',
      description: 'Direct Tavily search tool calling with prompt-injection defense and URL deduplication.',
    },
    {
      icon: History,
      title: 'Historical Change Detection',
      description: 'Temporal difference classification distinguishing verified deltas from unverified claims.',
    },
  ];

  return (
    <section id="capabilities" className="border-y border-border bg-background-secondary py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-accent flex-shrink-0 shadow-subtle">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                  {cap.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
