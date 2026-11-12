import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import type { Source } from '../../../shared/types.js';

interface SourceCardProps {
  source: Source;
  index?: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  const domain = source.domain || extractDomain(source.url);
  const formattedDate = source.publishedDate ? formatDate(source.publishedDate) : null;

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-3 rounded-xl border border-border bg-white hover:border-accent hover:shadow-subtle transition-all duration-150 text-left"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span className="text-[11px] font-medium text-text-secondary truncate">
            {domain}
          </span>
        </div>
        <ExternalLink className="w-3 h-3 text-text-secondary group-hover:text-accent transition-colors flex-shrink-0" />
      </div>

      <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
        {index !== undefined ? `${index + 1}. ` : ''}
        {source.title || domain}
      </p>

      {formattedDate && (
        <span className="text-[10px] text-text-secondary mt-1.5 font-mono">
          {formattedDate}
        </span>
      )}
    </a>
  );
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
