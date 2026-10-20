import { EventPlan } from '../types/event';
import { createInitialPlan } from './ruleBasedPlanner';

const STORAGE_EVENTS_KEY = 'gatherly_events_v1';
const STORAGE_ACTIVE_ID_KEY = 'gatherly_active_id_v1';
const STORAGE_API_KEY = 'gatherly_gemini_key_v1';

// In-memory fallback if localStorage is disabled or throws QuotaExceededError
let memoryEvents: EventPlan[] | null = null;
let memoryActiveId: string | null = null;
let memoryApiKey: string = '';

/**
 * Calculates a future date in YYYY-MM-DD format (offset in days).
 */
function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Generates rich pre-seeded sample events for each supported event type.
 */
export function getSampleEvents(): EventPlan[] {
  const wedding = createInitialPlan({
    name: 'Elena & Marcus’s Botanical Greenhouse Wedding',
    type: 'wedding',
    date: getFutureDate(120),
    guestCount: 135,
    totalBudget: 35000,
    currency: 'USD',
    location: 'Conservatory at Park Highlands',
    theme: 'Warm Candlelight, Wild Eucalyptus & Brass',
    notes: 'Indoor/outdoor ceremony with plated 3-course dinner and live 5-piece soul band.',
  });
  wedding.id = 'sample-wedding-01';

  const birthday = createInitialPlan({
    name: 'Julian’s 30th Golden Hour Rooftop Bash',
    type: 'birthday',
    date: getFutureDate(28),
    guestCount: 50,
    totalBudget: 5500,
    currency: 'USD',
    location: 'The Skyline Loft & Patio',
    theme: 'Retro Disco, Warm Neon & Signature Cocktails',
    notes: 'Sunset party with artisan sliders, grazing charcuterie board, and DJ set.',
  });
  birthday.id = 'sample-birthday-02';

  const community = createInitialPlan({
    name: 'Oakwood Annual Neighborhood Harvest Festival',
    type: 'community',
    date: getFutureDate(45),
    guestCount: 350,
    totalBudget: 8500,
    currency: 'USD',
    location: 'Oakwood Civic Memorial Park',
    theme: 'Family Carnival, Local Makers & Live Acoustic Stage',
    notes: 'Open to all residents. Food truck rodeo, kids pumpkin painting, and pie contest.',
  });
  community.id = 'sample-community-03';

  return [wedding, birthday, community];
}

/**
 * Loads saved event plans with fallback to initial sample plans.
 */
export function loadEvents(): EventPlan[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_EVENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Storage read warning, falling back to in-memory state:', err);
  }

  if (memoryEvents && memoryEvents.length > 0) {
    return memoryEvents;
  }

  // Pre-seed with sample events on initial launch
  const samples = getSampleEvents();
  saveEvents(samples);
  return samples;
}

/**
 * Saves events to localStorage with robust error handling.
 */
export function saveEvents(events: EventPlan[]): void {
  memoryEvents = events;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    }
  } catch (err) {
    console.warn('Could not persist events to localStorage (quota or disabled):', err);
  }
}

/**
 * Gets currently active event ID.
 */
export function getActiveEventId(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(STORAGE_ACTIVE_ID_KEY) || memoryActiveId;
    }
  } catch {
    // ignore
  }
  return memoryActiveId;
}

/**
 * Sets active event ID.
 */
export function setActiveEventId(id: string): void {
  memoryActiveId = id;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
    }
  } catch {
    // ignore
  }
}

/**
 * Gets user-configured Gemini API Key (if provided in-app).
 */
export function getSavedApiKey(): string {
  // Check Vite environment variable first
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_API_KEY);
      if (stored) return stored;
    }
  } catch {
    // ignore
  }
  return memoryApiKey;
}

/**
 * Saves user-configured Gemini API Key locally in browser session/storage.
 */
export function saveApiKey(key: string): void {
  memoryApiKey = key.trim();
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (key.trim()) {
        window.localStorage.setItem(STORAGE_API_KEY, key.trim());
      } else {
        window.localStorage.removeItem(STORAGE_API_KEY);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Exports all plans as formatted JSON string.
 */
export function exportEventsJson(events: EventPlan[]): string {
  return JSON.stringify(events, null, 2);
}

/**
 * Imports plans from JSON string with strict structure validation.
 */
export function importEventsJson(jsonStr: string): EventPlan[] | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    // Validate that each item has mandatory fields
    for (const item of parsed) {
      if (!item.id || !item.name || !item.type || !item.date) {
        return null;
      }
      if (!Array.isArray(item.budgetItems) || !Array.isArray(item.timeline) || !Array.isArray(item.vendorChecklist)) {
        return null;
      }
    }

    return parsed as EventPlan[];
  } catch {
    return null;
  }
}
