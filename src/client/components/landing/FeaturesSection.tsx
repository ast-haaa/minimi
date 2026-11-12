import React from 'react';
import { Database, Search, GitCompare, MessageSquareCode, ShieldCheck, Layers } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Database,
      title: 'Persistent Memory',
      tagline: 'Continue where your previous research ended.',
      description:
        'Minimi stores structured entities, pricing plans, and shortlist decisions in SQLite so you never lose context between sessions.',
    },
    {
      icon: Search,
      title: 'Live Web Research',
      tagline: 'Get current information backed by real sources.',
      description:
        'When facts might be stale, Minimi uses Tavily live search to fetch authoritative official pricing, documentation, and release notes.',
    },
    {
      icon: GitCompare,
      title: 'Change Detection',
      tagline: 'Understand what changed between your previous research and today.',
      description:
        'A deterministic temporal comparison engine classifies price changes, plan discontinuations, and feature updates with honest uncertainty.',
    },
    {
      icon: MessageSquareCode,
      title: 'Context-Aware Conversations',
      tagline: 'Ask follow-up questions without repeating everything.',
      description:
        'Resolve pronouns and implicit references ("What about their cheaper plan?") using both recent conversational turns and recalled memory.',
    },
    {
      icon: ShieldCheck,
      title: 'Evidence-First Answers',
      tagline: 'Know which sources support each important claim.',
      description:
        'Every web claim comes with clickable citations to official domains, stripped of tracking parameters and protected against prompt injection.',
    },
    {
      icon: Layers,
      title: 'Research Continuity',
      tagline: 'Keep your research connected across conversations.',
      description:
        'Switch between multiple topics or open research from weeks ago without the agent forgetting decisions made in prior discussions.',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mb-3">
          Designed for rigorous technical research
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Not another generic AI chat interface. Minimi is built from the ground up for software architects, engineering leaders, and product teams comparing technologies over time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border bg-white hover:border-accent/40 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-105 transition-transform duration-150">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-xs font-medium text-accent mb-2">
                  {f.tagline}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
