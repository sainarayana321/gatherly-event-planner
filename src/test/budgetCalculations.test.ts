import { describe, it, expect } from 'vitest';
import { createInitialPlan } from '../services/ruleBasedPlanner';
import { BudgetItem, BudgetSummary, BudgetCategory } from '../types/event';
import { normalizeAmount } from '../services/currency';

function computeBudgetSummary(totalBudget: number, items: BudgetItem[]): BudgetSummary {
  let totalPlanned = 0;
  let totalActual = 0;

  const categoryBreakdown: Record<BudgetCategory, { planned: number; actual: number; count: number }> = {
    venue: { planned: 0, actual: 0, count: 0 },
    catering: { planned: 0, actual: 0, count: 0 },
    decor: { planned: 0, actual: 0, count: 0 },
    photography: { planned: 0, actual: 0, count: 0 },
    entertainment: { planned: 0, actual: 0, count: 0 },
    attire: { planned: 0, actual: 0, count: 0 },
    logistics: { planned: 0, actual: 0, count: 0 },
    misc: { planned: 0, actual: 0, count: 0 },
  };

  items.forEach((item) => {
    const planned = normalizeAmount(item.plannedAmount);
    const actual = normalizeAmount(item.actualAmount);
    totalPlanned += planned;
    totalActual += actual;

    const cat = item.category in categoryBreakdown ? item.category : 'misc';
    categoryBreakdown[cat].planned += planned;
    categoryBreakdown[cat].actual += actual;
    categoryBreakdown[cat].count += 1;
  });

  const remainingPlanned = totalBudget - totalPlanned;
  const remainingActual = totalBudget - totalActual;
  const isOverBudget = totalPlanned > totalBudget;
  const overBudgetAmount = isOverBudget ? totalPlanned - totalBudget : 0;

  return {
    totalBudget,
    totalPlanned,
    totalActual,
    remainingPlanned,
    remainingActual,
    isOverBudget,
    overBudgetAmount,
    categoryBreakdown,
  };
}

describe('Detailed Budget Governance Calculations', () => {
  it('correctly calculates total, spent, and remaining buffer with valid items', () => {
    const items: BudgetItem[] = [
      { id: '1', name: 'Venue', category: 'venue', plannedAmount: 5000, actualAmount: 5000 },
      { id: '2', name: 'Catering', category: 'catering', plannedAmount: 3000, actualAmount: 1500 },
      { id: '3', name: 'Flowers', category: 'decor', plannedAmount: 1000, actualAmount: 0 },
    ];

    const summary = computeBudgetSummary(10000, items);

    expect(summary.totalBudget).toBe(10000);
    expect(summary.totalPlanned).toBe(9000);
    expect(summary.totalActual).toBe(6500);
    expect(summary.remainingPlanned).toBe(1000);
    expect(summary.remainingActual).toBe(3500);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overBudgetAmount).toBe(0);
  });

  it('detects when planned expenses exceed total budget limit', () => {
    const items: BudgetItem[] = [
      { id: '1', name: 'Grand Ballroom', category: 'venue', plannedAmount: 12000, actualAmount: 12000 },
      { id: '2', name: 'Live Band', category: 'entertainment', plannedAmount: 4000, actualAmount: 2000 },
    ];

    const summary = computeBudgetSummary(15000, items);

    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(1000); // 16000 - 15000
    expect(summary.remainingPlanned).toBe(-1000);
  });

  it('correctly handles zero budget and empty expenses', () => {
    const emptySummary = computeBudgetSummary(0, []);
    expect(emptySummary.totalBudget).toBe(0);
    expect(emptySummary.totalPlanned).toBe(0);
    expect(emptySummary.totalActual).toBe(0);
    expect(emptySummary.isOverBudget).toBe(false);

    // Zero budget with expenses
    const items: BudgetItem[] = [
      { id: '1', name: 'Sound System', category: 'entertainment', plannedAmount: 500, actualAmount: 200 },
    ];
    const overSummary = computeBudgetSummary(0, items);
    expect(overSummary.isOverBudget).toBe(true);
    expect(overSummary.overBudgetAmount).toBe(500);
  });

  it('sanitizes negative, non-finite, and NaN amounts without breaking calculations', () => {
    const corruptedItems: BudgetItem[] = [
      { id: '1', name: 'Valid Item', category: 'catering', plannedAmount: 1000, actualAmount: 500 },
      { id: '2', name: 'Negative Item', category: 'decor', plannedAmount: -800, actualAmount: -300 },
      { id: '3', name: 'NaN Item', category: 'misc', plannedAmount: NaN, actualAmount: NaN },
      { id: '4', name: 'Infinity Item', category: 'venue', plannedAmount: Infinity, actualAmount: Infinity },
    ];

    const summary = computeBudgetSummary(5000, corruptedItems);

    expect(summary.totalPlanned).toBe(1000);
    expect(summary.totalActual).toBe(500);
    expect(summary.remainingPlanned).toBe(4000);
  });

  it('verifies category breakdown sums match overall totals', () => {
    const plan = createInitialPlan({
      name: 'Verification Celebration',
      type: 'wedding',
      date: '2026-12-31',
      guestCount: 100,
      totalBudget: 25000,
      currency: 'USD',
    });

    const summary = computeBudgetSummary(plan.totalBudget, plan.budgetItems);

    let sumCategoryPlanned = 0;
    let sumCategoryActual = 0;
    Object.values(summary.categoryBreakdown).forEach((cat) => {
      sumCategoryPlanned += cat.planned;
      sumCategoryActual += cat.actual;
    });

    expect(sumCategoryPlanned).toBe(summary.totalPlanned);
    expect(sumCategoryActual).toBe(summary.totalActual);
  });
});
