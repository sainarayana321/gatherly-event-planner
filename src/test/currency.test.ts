import { describe, it, expect } from 'vitest';
import { formatCurrency, normalizeAmount } from '../services/currency';

describe('Currency and Number Normalization Service', () => {
  it('formats various currencies accurately', () => {
    expect(formatCurrency(25000, 'USD')).toContain('25,000');
    expect(formatCurrency(25000, 'USD')).toContain('$');

    expect(formatCurrency(5000, 'EUR')).toContain('5.000');
    expect(formatCurrency(5000, 'EUR')).toContain('€');

    expect(formatCurrency(12000, 'GBP')).toContain('12,000');
    expect(formatCurrency(12000, 'GBP')).toContain('£');

    expect(formatCurrency(850000, 'INR')).toContain('8,50,000');
  });

  it('handles zero, negative, NaN, and non-finite numbers safely', () => {
    expect(formatCurrency(0, 'USD')).toContain('0');
    expect(formatCurrency(NaN, 'USD')).toBe('$0');
    expect(formatCurrency(Infinity, 'USD')).toBe('$0');
    expect(formatCurrency(-500, 'USD')).toContain('500');
  });

  it('normalizes input amounts correctly to positive numbers', () => {
    expect(normalizeAmount(150)).toBe(150);
    expect(normalizeAmount('250.75')).toBe(250.75);
    expect(normalizeAmount('$1,200.50')).toBe(1200.5);
    expect(normalizeAmount(-450)).toBe(0);
    expect(normalizeAmount('invalid-text')).toBe(0);
    expect(normalizeAmount(NaN)).toBe(0);
    expect(normalizeAmount(Infinity)).toBe(0);
    expect(normalizeAmount(null)).toBe(0);
    expect(normalizeAmount(undefined)).toBe(0);
  });
});
