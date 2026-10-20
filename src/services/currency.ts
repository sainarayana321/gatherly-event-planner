import { Currency } from '../types/event';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'CA$',
  AUD: 'A$',
};

export const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

/**
 * Formats a monetary amount safely with currency symbol and standard grouping.
 */
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || '$'}0`;
  }

  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency] || 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Validates and normalizes input amounts to positive finite numbers.
 */
export function normalizeAmount(value: unknown): number {
  if (typeof value === 'number') {
    return isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
  }
  return 0;
}
