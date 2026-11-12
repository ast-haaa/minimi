/**
 * Resolves relative date references like "last Monday", "3 days ago", "November 3"
 * to actual date ranges for database queries.
 */

export interface DateRange {
  from: Date;
  to: Date;
  description: string;
}

export function resolveRelativeDate(text: string, timezone: string = 'UTC'): DateRange | null {
  const now = new Date();
  const lower = text.toLowerCase().trim();

  // "today"
  if (/\btoday\b/.test(lower)) {
    return dayRange(now, 'today');
  }

  // "yesterday"
  if (/\byesterday\b/.test(lower)) {
    const d = daysAgo(now, 1);
    return dayRange(d, 'yesterday');
  }

  // "X days ago"
  const daysAgoMatch = lower.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) {
    const n = parseInt(daysAgoMatch[1], 10);
    const d = daysAgo(now, n);
    return dayRange(d, `${n} days ago`);
  }

  // "last week"
  if (/\blast\s+week\b/.test(lower)) {
    const startOfThisWeek = getStartOfWeek(now);
    const startOfLastWeek = daysAgo(startOfThisWeek, 7);
    return {
      from: startOfDay(startOfLastWeek),
      to: endOfDay(daysAgo(startOfThisWeek, 1)),
      description: 'last week',
    };
  }

  // "this week"
  if (/\bthis\s+week\b/.test(lower)) {
    const startOfThisWeek = getStartOfWeek(now);
    return {
      from: startOfDay(startOfThisWeek),
      to: endOfDay(now),
      description: 'this week',
    };
  }

  // "earlier this month"
  if (/\bearlier\s+this\s+month\b/.test(lower)) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: startOfDay(startOfMonth),
      to: endOfDay(now),
      description: 'earlier this month',
    };
  }

  // "last Monday", "last Tuesday", etc.
  const lastDayMatch = lower.match(/\blast\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (lastDayMatch) {
    const targetDay = dayNameToNumber(lastDayMatch[1]);
    const d = getLastDayOfWeek(now, targetDay);
    return dayRange(d, `last ${lastDayMatch[1]}`);
  }

  // Just day name: "on Monday", "on Tuesday"
  const onDayMatch = lower.match(/\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (onDayMatch) {
    const targetDay = dayNameToNumber(onDayMatch[1]);
    const d = getLastDayOfWeek(now, targetDay);
    return dayRange(d, `on ${onDayMatch[1]}`);
  }

  // "November 3", "3 November", "Nov 3", etc.
  const monthDayMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/) ||
    lower.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/);

  if (monthDayMatch) {
    let monthStr: string, dayStr: string;
    if (/^\d/.test(monthDayMatch[1])) {
      dayStr = monthDayMatch[1];
      monthStr = monthDayMatch[2];
    } else {
      monthStr = monthDayMatch[1];
      dayStr = monthDayMatch[2];
    }
    const month = monthNameToNumber(monthStr);
    const day = parseInt(dayStr, 10);
    
    // Check for year
    const yearMatch = lower.match(/\b(20\d{2})\b/);
    let year = now.getFullYear();
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    } else {
      // If the date is in the future, use last year
      const candidate = new Date(year, month, day);
      if (candidate > now) year--;
    }
    
    const d = new Date(year, month, day);
    return dayRange(d, `${monthStr} ${day}, ${year}`);
  }

  // "last month"
  if (/\blast\s+month\b/.test(lower)) {
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: startOfDay(firstOfLastMonth),
      to: endOfDay(lastOfLastMonth),
      description: 'last month',
    };
  }

  // "X weeks ago"
  const weeksAgoMatch = lower.match(/(\d+)\s+weeks?\s+ago/);
  if (weeksAgoMatch) {
    const n = parseInt(weeksAgoMatch[1], 10);
    const center = daysAgo(now, n * 7);
    return {
      from: startOfDay(daysAgo(center, 3)),
      to: endOfDay(daysAgo(center, -3)),
      description: `${n} weeks ago`,
    };
  }

  return null;
}

/**
 * Detect date references in text and return all resolved ranges.
 */
export function detectDateReferences(text: string, timezone: string = 'UTC'): DateRange[] {
  const patterns = [
    /\btoday\b/gi,
    /\byesterday\b/gi,
    /\d+\s+days?\s+ago/gi,
    /\blast\s+week\b/gi,
    /\bthis\s+week\b/gi,
    /\bearlier\s+this\s+month\b/gi,
    /\blast\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}\b/gi,
    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
    /\blast\s+month\b/gi,
    /\d+\s+weeks?\s+ago/gi,
  ];

  const ranges: DateRange[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const range = resolveRelativeDate(match, timezone);
        if (range) ranges.push(range);
      }
    }
  }

  return ranges;
}

// Helper functions
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function dayRange(d: Date, description: string): DateRange {
  return { from: startOfDay(d), to: endOfDay(d), description };
}

function daysAgo(from: Date, n: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

function getStartOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is start
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function dayNameToNumber(name: string): number {
  const map: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
  };
  return map[name.toLowerCase()] ?? 0;
}

function getLastDayOfWeek(from: Date, targetDay: number): Date {
  const d = new Date(from);
  const currentDay = d.getDay();
  let diff = currentDay - targetDay;
  if (diff <= 0) diff += 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function monthNameToNumber(name: string): number {
  const map: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5,
    july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
  };
  return map[name.toLowerCase()] ?? 0;
}
