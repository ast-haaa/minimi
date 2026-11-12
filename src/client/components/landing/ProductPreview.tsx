import React from 'react';
import { Sparkles, ArrowRight, ExternalLink, Globe, Check, RefreshCw } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="w-full rounded-2xl border border-border bg-white shadow-card overflow-hidden">
      {/* Window bar */}
      <div className="px-4 py-3 border-b border-border bg-background-secondary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <span className="ml-2 text-[11px] font-mono text-text-secondary">
            minimi — research workspace
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-soft text-accent text-[10px] font-medium border border-accent/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>FTS5 Memory + Live Tavily</span>
        </div>
      </div>

      {/* Content pane */}
      <div className="p-5 sm:p-6 space-y-4 bg-white text-xs leading-relaxed text-text-primary">
        {/* User prompt */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-xl bg-background-secondary border border-border px-3.5 py-2.5 text-text-primary">
            On Monday we shortlisted Supabase, Neon, and AWS RDS for our 20-person engineering team. Has any pricing or tier limits changed since?
          </div>
        </div>

        {/* Assistant Response Simulation */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent-soft border border-accent/20 text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 space-y-3 min-w-0">
            {/* Memory Recall Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background-secondary border border-border text-[11px] text-text-secondary">
              <span className="font-medium text-accent">🧠 Memory Recalled:</span>
              <span>Shortlist from Monday (Nov 10) matched across 3 providers</span>
            </div>

            <p className="text-text-primary">
              I checked current pricing and recent changelogs across your three shortlisted database providers. Here is what has changed compared to our discussion earlier this week:
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-background-secondary border-b border-border font-semibold text-text-primary">
                    <th className="py-2 px-3">Provider / Tier</th>
                    <th className="py-2 px-3">Previous (Nov 10)</th>
                    <th className="py-2 px-3">Current (Verified)</th>
                    <th className="py-2 px-3">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-background-secondary/50">
                    <td className="py-2 px-3 font-medium">Supabase Pro</td>
                    <td className="py-2 px-3 text-text-secondary">$25 / month</td>
                    <td className="py-2 px-3 text-text-primary font-medium">$25 / month</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-background-secondary border border-border text-text-secondary">
                        <Check className="w-2.5 h-2.5" /> No change
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-background-secondary/50">
                    <td className="py-2 px-3 font-medium">Neon Launch</td>
                    <td className="py-2 px-3 text-text-secondary">$19 / month</td>
                    <td className="py-2 px-3 text-text-primary font-medium">$19 / month</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-accent-soft text-accent border border-accent/20">
                        <RefreshCw className="w-2.5 h-2.5" /> Storage limit +5GB
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-background-secondary/50">
                    <td className="py-2 px-3 font-medium">AWS RDS db.t4g.small</td>
                    <td className="py-2 px-3 text-text-secondary">~$38 / month</td>
                    <td className="py-2 px-3 text-text-primary font-medium">~$38 / month</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-background-secondary border border-border text-text-secondary">
                        <Check className="w-2.5 h-2.5" /> No change
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Citations Preview */}
            <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-background-secondary border border-border text-text-secondary">
                <Globe className="w-3 h-3 text-accent" />
                <span>supabase.com/pricing</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-text-secondary" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-background-secondary border border-border text-text-secondary">
                <Globe className="w-3 h-3 text-accent" />
                <span>neon.tech/docs/changelog</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-text-secondary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
