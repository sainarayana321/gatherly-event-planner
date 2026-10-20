import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAiEventPlan } from '../services/gemini';
import { getSampleEvents } from '../services/storage';

describe('GenAI Planning Assistant & Fallback Service', () => {
  const sampleEvent = getSampleEvents()[0];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('transparently activates rule-based engine when no API key is provided', async () => {
    const result = await generateAiEventPlan(sampleEvent, undefined, '');

    expect(result.provider).toBe('rule_based');
    expect(result.isFallback).toBe(true);
    expect(result.ideas.length).toBeGreaterThan(0);
    expect(result.summary).toContain('Rule-Based');
  });

  it('handles simulated Gemini API failures by gracefully falling back without crashing', async () => {
    // Mock fetch to simulate a 500 server error
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Model Error'),
      } as any)
    );

    const result = await generateAiEventPlan(sampleEvent, 'How to save budget?', 'fake-api-key');

    expect(result.provider).toBe('rule_based');
    expect(result.isFallback).toBe(true);
    expect(result.errorMessage).toBeDefined();
    expect(result.ideas.length).toBeGreaterThan(0);
  });

  it('processes valid structured mock Gemini responses correctly', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  summary: 'Live custom Gemini recommendations for your event.',
                  ideas: [
                    {
                      id: 'gemini-1',
                      category: 'catering',
                      title: 'Farm-to-Table Grazing Tapas',
                      description: 'Locally sourced charcuterie and seasonal fruit boards.',
                      estimatedImpact: 'Crowd Pleaser',
                    },
                    {
                      id: 'gemini-2',
                      category: 'budget_saving',
                      title: 'BYO Dessert Buffet',
                      description: 'Have local bakers provide mini desserts.',
                      estimatedImpact: 'Cost Saver',
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    };

    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as any)
    );

    const result = await generateAiEventPlan(sampleEvent, 'Menu suggestions', 'valid-api-key');

    expect(result.provider).toBe('gemini');
    expect(result.isFallback).toBe(false);
    expect(result.ideas.length).toBe(2);
    expect(result.ideas[0].title).toBe('Farm-to-Table Grazing Tapas');
  });
});
