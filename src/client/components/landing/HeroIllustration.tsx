import React from 'react';
import { Globe, Database, TrendingUp, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[520px] aspect-[16/13] flex items-center justify-center select-none mx-auto">
      {/* 1. Soft Backdrop Organic Shapes (Peach & Pink) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        viewBox="0 0 520 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="380" cy="120" r="110" fill="#FFF2ED" />
        <circle cx="120" cy="310" r="95" fill="#FFF0F5" />
        <path
          d="M180 80C260 40 340 70 380 140C420 210 370 290 290 320C210 350 130 300 110 220C90 140 100 120 180 80Z"
          fill="#FFF2ED"
          fillOpacity="0.5"
        />

        {/* 2. Dotted Orbit Lines (Connecting floating elements) */}
        <ellipse
          cx="260"
          cy="210"
          rx="210"
          ry="130"
          stroke="#F0644F"
          strokeWidth="1.5"
          strokeDasharray="4 7"
          strokeOpacity="0.25"
          className="animate-pulse-subtle"
        />
        <ellipse
          cx="260"
          cy="210"
          rx="145"
          ry="90"
          stroke="#E91E63"
          strokeWidth="1.2"
          strokeDasharray="3 6"
          strokeOpacity="0.2"
        />
      </svg>

      {/* 3. Centerpiece: Floating Sleek Laptop */}
      <div className="relative z-10 w-[78%] max-w-[370px] animate-float transition-transform">
        {/* Laptop Screen Bezel */}
        <div className="bg-[#292929] rounded-t-xl p-2 pb-1 shadow-2xl border border-[#403D44]">
          {/* Top Bar with Camera & Window Controls */}
          <div className="flex items-center justify-between px-2 py-1 bg-[#1F1E21] rounded-t-md mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F0644F]" />
              <span className="w-2 h-2 rounded-full bg-[#E91E63]" />
              <span className="w-2 h-2 rounded-full bg-[#FFF2ED]" />
            </div>
            <div className="flex items-center gap-1 text-[9px] font-medium text-[#A69FA8]">
              <Sparkles className="w-2.5 h-2.5 text-[#F0644F]" />
              <span>minimi.ai/research</span>
            </div>
            <div className="w-8" />
          </div>

          {/* Screen Content Window */}
          <div className="bg-white rounded-b-md p-3 h-[180px] flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Mock Search Prompt */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FFFCFB] border border-[#EEE8E6] text-[10px]">
              <span className="text-[#292929] font-medium truncate">
                "What changed in Supabase & Neon pricing since Monday?"
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0644F] animate-ping flex-shrink-0" />
            </div>

            {/* Mock AI Memory Recall & Live Verification */}
            <div className="space-y-1.5 my-1">
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFF2ED] text-[#F0644F] font-semibold border border-[#EEE8E6]">
                  <Database className="w-2.5 h-2.5" /> 2 past discussions matched
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFF0F5] text-[#E91E63] font-semibold border border-[#EEE8E6]">
                  <Globe className="w-2.5 h-2.5" /> 2 live sources verified
                </span>
              </div>

              {/* Miniature Comparison Rows */}
              <div className="p-1.5 rounded-md border border-[#EEE8E6] bg-[#FFFCFB] space-y-1 text-[9px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#292929]">Supabase Pro</span>
                  <div className="flex items-center gap-1 text-[#77717F]">
                    <span>$25 → $25/mo</span>
                    <span className="text-[#F0644F] font-bold">Unchanged</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#292929]">Neon Scale</span>
                  <div className="flex items-center gap-1 text-[#77717F]">
                    <span>$69 → $69/mo</span>
                    <span className="text-[#F0644F] font-bold">Unchanged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Citation Chip */}
            <div className="flex items-center justify-between pt-1 border-t border-[#EEE8E6] text-[8px] text-[#77717F]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#F0644F]" />
                Sources: supabase.com/pricing · neon.tech
              </span>
              <span className="text-[#E91E63] font-medium">Temporal diff verified</span>
            </div>
          </div>
        </div>

        {/* Laptop Base & Hinge */}
        <div className="relative -mt-0.5">
          <div className="h-2.5 bg-gradient-to-b from-[#333136] to-[#1F1E21] rounded-b-xl shadow-md border-t border-[#48454D] flex items-center justify-center">
            <div className="w-10 h-1 bg-[#4A4750] rounded-sm" />
          </div>
          <div className="h-1 bg-[#141315] mx-4 rounded-b-lg opacity-40 shadow-xl" />
        </div>
      </div>

      {/* 4. Satellite Badge 1: Live Web Search (Top-Left) */}
      <div className="absolute top-[8%] left-[2%] z-20 animate-float-slow">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EEE8E6] shadow-card">
          <div className="w-7 h-7 rounded-lg bg-[#FFF2ED] text-[#F0644F] flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#292929] leading-tight">
              Live Web Search
            </div>
            <div className="text-[9px] text-[#F0644F] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F0644F] animate-pulse" />
              Tavily Verified
            </div>
          </div>
        </div>
      </div>

      {/* 5. Satellite Badge 2: Persistent Memory (Bottom-Left) */}
      <div className="absolute bottom-[10%] left-[0%] z-20 animate-float-delay">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EEE8E6] shadow-card">
          <div className="w-7 h-7 rounded-lg bg-[#FFF0F5] text-[#E91E63] flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#292929] leading-tight">
              Smart Memory
            </div>
            <div className="text-[9px] text-[#E91E63] font-medium">
              SQLite FTS5 Storage
            </div>
          </div>
        </div>
      </div>

      {/* 6. Satellite Badge 3: Change Tracking / Analytics (Top-Right) */}
      <div className="absolute top-[12%] right-[2%] z-20 animate-float">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EEE8E6] shadow-card">
          <div className="w-7 h-7 rounded-lg bg-[#FFF2ED] text-[#F0644F] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#292929] leading-tight">
              Change Tracking
            </div>
            <div className="text-[9px] text-[#F0644F] font-semibold">
              Delta & Diff Engine
            </div>
          </div>
        </div>
      </div>

      {/* 7. Satellite Badge 4: Continuous Research Sync (Bottom-Right) */}
      <div className="absolute bottom-[8%] right-[0%] z-20 animate-float-slow">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EEE8E6] shadow-card">
          <div className="w-7 h-7 rounded-lg bg-[#FFF0F5] text-[#E91E63] flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#292929] leading-tight">
              Continuous Sync
            </div>
            <div className="text-[9px] text-[#77717F] font-medium">
              Multi-Session Context
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
