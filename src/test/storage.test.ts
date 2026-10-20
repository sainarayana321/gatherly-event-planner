import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadEvents,
  saveEvents,
  getSampleEvents,
  exportEventsJson,
  importEventsJson,
} from '../services/storage';

describe('Storage and Serialization Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('pre-seeds 3 sample events when storage is uninitialized', () => {
    const events = loadEvents();
    expect(events.length).toBe(3);
    expect(events.some((e) => e.type === 'wedding')).toBe(true);
    expect(events.some((e) => e.type === 'birthday')).toBe(true);
    expect(events.some((e) => e.type === 'community')).toBe(true);
  });

  it('persists and restores updated events correctly', () => {
    const samples = getSampleEvents();
    samples[0].name = 'Custom Renamed Wedding';
    saveEvents(samples);

    const reloaded = loadEvents();
    expect(reloaded[0].name).toBe('Custom Renamed Wedding');
  });

  it('handles corrupted localStorage data without crashing', () => {
    localStorage.setItem('gatherly_events_v1', 'corrupted-broken-json{[{');
    const events = loadEvents();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it('exports and re-imports valid JSON plans successfully', () => {
    const samples = getSampleEvents();
    const jsonStr = exportEventsJson(samples);
    expect(typeof jsonStr).toBe('string');

    const imported = importEventsJson(jsonStr);
    expect(imported).not.toBeNull();
    expect(imported?.length).toBe(3);
    expect(imported?.[0].id).toBe(samples[0].id);
  });

  it('rejects invalid or malformed JSON during import', () => {
    expect(importEventsJson('invalid json string')).toBeNull();
    expect(importEventsJson('{}')).toBeNull(); // not an array
    expect(importEventsJson(JSON.stringify([{ invalid: true }]))).toBeNull(); // missing mandatory fields
  });
});
