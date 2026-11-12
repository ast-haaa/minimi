import React from 'react';
import { MessageSquare, Database, ArrowRightLeft } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Discuss',
      action: 'Ask questions and explore a topic.',
      description:
        'Shortlist tools, analyze architectural trade-offs, and examine pricing plans. Minimi tracks what matters in real time.',
      icon: MessageSquare,
    },
    {
      step: '02',
      title: 'Remember',
      action: 'Minimi stores useful context from your previous research.',
      description:
        'Key entities, stated requirements, observed prices, and shortlist selections are extracted into persistent SQLite memory.',
      icon: Database,
    },
    {
      step: '03',
      title: 'Revisit',
      action: 'Ask what changed and get updated, source-backed answers.',
      description:
        'When you return days or weeks later, Minimi retrieves historical memory, conducts live web search, and compares the differences.',
      icon: ArrowRightLeft,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-background-secondary border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 block">
            Continuous Research Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mb-3">
            How Minimi connects your research over time
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Eliminate repetitive prompting and stale assumptions with a single continuous research memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="relative p-6 sm:p-8 rounded-2xl bg-white border border-border shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-accent">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent/20 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs font-medium text-text-primary mb-2">
                    {s.action}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
