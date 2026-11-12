import { describe, it, expect } from 'vitest';
import { resolveRelativeDate, detectDateReferences } from '../../src/server/utils/date-resolver.js';

describe('Date & Time Resolution Engine', () => {
  it('resolves "today" to current day boundaries', () => {
    const range = resolveRelativeDate('today');
    expect(range).not.toBeNull();
    expect(range?.description).toBe('today');
    expect(range?.from.getTime()).toBeLessThan(range!.to.getTime());
  });

  it('resolves "yesterday" correctly', () => {
    const range = resolveRelativeDate('yesterday');
    expect(range).not.toBeNull();
    expect(range?.description).toBe('yesterday');
    expect(range?.from.getDate()).not.toBe(new Date().getDate());
  });

  it('resolves "last week" to a 7-day window', () => {
    const range = resolveRelativeDate('last week');
    expect(range).not.toBeNull();
    const durationDays = (range!.to.getTime() - range!.from.getTime()) / 86400000;
    expect(durationDays).toBeGreaterThanOrEqual(6);
  });

  it('resolves "3 days ago"', () => {
    const range = resolveRelativeDate('3 days ago');
    expect(range).not.toBeNull();
    expect(range?.description).toBe('3 days ago');
  });

  it('resolves "last Tuesday" or "on Monday"', () => {
    const tuesdayRange = resolveRelativeDate('last Tuesday');
    expect(tuesdayRange).not.toBeNull();
    expect(tuesdayRange?.from.getDay()).toBe(2); // Tuesday is 2

    const mondayRange = resolveRelativeDate('on Monday');
    expect(mondayRange).not.toBeNull();
    expect(mondayRange?.from.getDay()).toBe(1); // Monday is 1
  });

  it('resolves exact dates like "November 3" or "3 November"', () => {
    const range = resolveRelativeDate('November 3');
    expect(range).not.toBeNull();
    expect(range?.from.getMonth()).toBe(10); // November is index 10
    expect(range?.from.getDate()).toBe(3);
  });

  it('detects multiple date references in conversational sentences', () => {
    const text = 'On Monday we shortlisted tools, but yesterday we checked again.';
    const detected = detectDateReferences(text);
    expect(detected.length).toBeGreaterThanOrEqual(2);
  });
});

