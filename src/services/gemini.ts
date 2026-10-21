import { EventPlan, PersonalizedIdea, BudgetItem, TimelineMilestone } from '../types/event';
import { generatePersonalizedIdeas } from './ruleBasedPlanner';
import { getSavedApiKey } from './storage';

export interface AiGenerationResult {
  provider: 'gemini' | 'rule_based';
  isFallback: boolean;
  summary: string;
  ideas: PersonalizedIdea[];
  suggestedBudgetItems?: Partial<BudgetItem>[];
  suggestedMilestones?: Partial<TimelineMilestone>[];
  errorMessage?: string;
}

/**
 * Extracts JSON content safely from model response text (strips markdown code fences).
 */
function extractJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Generates personalized planning advice and structured suggestions.
 * Transparently falls back to local deterministic rule-based generator when no API key is available or on error.
 */
export async function generateAiEventPlan(
  event: EventPlan,
  customQuery?: string,
  providedKey?: string
): Promise<AiGenerationResult> {
  const apiKey = (providedKey || getSavedApiKey()).trim();

  // If no Gemini key is provided, transparently return rule-based intelligence
  if (!apiKey) {
    const fallbackIdeas = generatePersonalizedIdeas(
      event.type,
      event.guestCount,
      event.totalBudget,
      event.theme
    );

    return {
      provider: 'rule_based',
      isFallback: true,
      summary: `Generated via Gatherly Rule-Based Planning Engine for ${event.name}. Configured without active Gemini API credentials. All suggestions, timelines, and budgets are deterministic and customizable.`,
      ideas: fallbackIdeas,
    };
  }

  // Attempt live Gemini API call
  try {
    const prompt = `You are Gatherly's expert celebration planner.
Analyze the following event and provide creative, practical, budget-conscious ideas and structured recommendations.

EVENT DETAILS:
- Name: ${event.name}
- Type: ${event.type}
- Date: ${event.date}
- Guest Count: ${event.guestCount}
- Total Budget: ${event.totalBudget} ${event.currency}
- Location: ${event.location || 'Not specified'}
- Theme/Preferences: ${event.theme || 'None specified'}
- Additional Notes: ${event.notes || 'None'}
${customQuery ? `- User Specific Question/Goal: ${customQuery}` : ''}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "Short 2-sentence executive summary tailored specifically to this event",
  "ideas": [
    {
      "id": "gemini-idea-1",
      "category": "theme_decor | budget_saving | catering | entertainment | guest_experience | priorities",
      "title": "Concise compelling title",
      "description": "2-3 actionable sentences with clear rationale and ideas",
      "estimatedImpact": "High Impact | Cost Saver | Crowd Pleaser | Essential"
    }
  ]
}
Provide exactly 5 diverse, high-value ideas across different categories. Note: Any cost estimates must be explicitly indicative.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText.substring(0, 100)}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Gemini API returned empty text candidate');
    }

    const parsed = extractJson(rawText) as { summary?: string; ideas?: Array<Record<string, unknown>> } | null;

    if (!parsed || !Array.isArray(parsed.ideas)) {
      throw new Error('Gemini output could not be parsed into valid ideas schema');
    }

    const ideas: PersonalizedIdea[] = parsed.ideas.map((item, idx: number) => ({
      id: typeof item.id === 'string' ? item.id : `gemini-idea-${idx + 1}-${Date.now()}`,
      category: (item.category as PersonalizedIdea['category']) || 'guest_experience',
      title: String(item.title || 'Event Recommendation'),
      description: String(item.description || ''),
      estimatedImpact: (item.estimatedImpact as PersonalizedIdea['estimatedImpact']) || 'High Impact',
    }));

    return {
      provider: 'gemini',
      isFallback: false,
      summary: parsed.summary || `Live GenAI plan produced by Gemini 1.5 Flash for ${event.name}.`,
      ideas,
    };
  } catch (error: unknown) {
    console.warn('Gemini API failed or timed out, gracefully falling back to rule-based engine:', error);
    const errorMsg = error instanceof Error ? error.message : String(error || 'Connection unavailable');

    const fallbackIdeas = generatePersonalizedIdeas(
      event.type,
      event.guestCount,
      event.totalBudget,
      event.theme
    );

    return {
      provider: 'rule_based',
      isFallback: true,
      summary: `Fallback Planning Engine activated. (Live API Notice: ${errorMsg}). Displaying reliable rule-based suggestions.`,
      ideas: fallbackIdeas,
      errorMessage: errorMsg,
    };
  }
}
