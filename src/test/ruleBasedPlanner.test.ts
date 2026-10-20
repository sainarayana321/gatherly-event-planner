import { describe, it, expect } from 'vitest';
import {
  createInitialPlan,
  generateTimelineMilestones,
  generatePersonalizedIdeas,
} from '../services/ruleBasedPlanner';

describe('Rule-Based Planning Intelligence Engine', () => {
  const futureDate120 = new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0];
  const shortDate3 = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  it('creates complete initial wedding plan with correct proportions', () => {
    const plan = createInitialPlan({
      name: 'Claire & Julien Wedding',
      type: 'wedding',
      date: futureDate120,
      guestCount: 150,
      totalBudget: 40000,
      currency: 'USD',
    });

    expect(plan.name).toBe('Claire & Julien Wedding');
    expect(plan.type).toBe('wedding');
    expect(plan.totalBudget).toBe(40000);
    expect(plan.budgetItems.length).toBeGreaterThan(4);
    expect(plan.timeline.length).toBeGreaterThan(4);
    expect(plan.vendorChecklist.length).toBeGreaterThan(3);
    expect(plan.ideas.length).toBeGreaterThan(3);

    // Verify wedding specific items
    expect(plan.budgetItems.some((b) => b.category === 'venue')).toBe(true);
    expect(plan.budgetItems.some((b) => b.category === 'catering')).toBe(true);
    expect(plan.budgetItems.some((b) => b.category === 'attire')).toBe(true);
  });

  it('creates distinct birthday plans with appropriate categories', () => {
    const plan = createInitialPlan({
      name: 'Sam 30th Birthday',
      type: 'birthday',
      date: futureDate120,
      guestCount: 40,
      totalBudget: 4000,
      currency: 'USD',
    });

    expect(plan.type).toBe('birthday');
    expect(plan.budgetItems.some((b) => b.name.toLowerCase().includes('cake'))).toBe(true);
    expect(plan.ideas.some((i) => i.title.toLowerCase().includes('neon') || i.title.toLowerCase().includes('party'))).toBe(true);
  });

  it('creates distinct community event plans with permits and staging', () => {
    const plan = createInitialPlan({
      name: 'Spring Civic Fair',
      type: 'community',
      date: futureDate120,
      guestCount: 300,
      totalBudget: 7500,
      currency: 'USD',
    });

    expect(plan.type).toBe('community');
    expect(plan.budgetItems.some((b) => b.category === 'logistics')).toBe(true);
    expect(plan.vendorChecklist.some((v) => v.category === 'permits')).toBe(true);
  });

  it('ensures generated milestones are ordered chronologically', () => {
    const milestones = generateTimelineMilestones('wedding', futureDate120);

    for (let i = 0; i < milestones.length - 1; i++) {
      const current = new Date(milestones[i].dueDate).getTime();
      const next = new Date(milestones[i + 1].dueDate).getTime();
      expect(current).toBeLessThanOrEqual(next);
    }
  });

  it('handles short preparation windows without creating past deadlines', () => {
    const milestones = generateTimelineMilestones('wedding', shortDate3);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    milestones.forEach((m) => {
      const dueDate = new Date(m.dueDate + 'T00:00:00');
      expect(dueDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });
  });

  it('handles events occurring today gracefully', () => {
    const milestones = generateTimelineMilestones('birthday', todayStr);
    expect(milestones.length).toBeGreaterThan(0);
    milestones.forEach((m) => {
      expect(m.dueDate).toBe(todayStr);
    });
  });

  it('generates different personalized ideas for different event types', () => {
    const weddingIdeas = generatePersonalizedIdeas('wedding', 100, 30000);
    const birthdayIdeas = generatePersonalizedIdeas('birthday', 30, 2000);
    const communityIdeas = generatePersonalizedIdeas('community', 400, 10000);

    expect(weddingIdeas[0].title).not.toEqual(birthdayIdeas[0].title);
    expect(birthdayIdeas[0].title).not.toEqual(communityIdeas[0].title);
    expect(weddingIdeas.every((i) => i.actionableImport !== undefined)).toBe(true);
  });
});
