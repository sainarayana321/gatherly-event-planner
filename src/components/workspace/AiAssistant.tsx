import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  ShieldAlert,
  Key,
  DollarSign,
  Calendar,
  Layers,
  Tag,
  Info,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { PersonalizedIdea, IdeaCategory } from '../../types/event';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const CATEGORY_NAMES: Record<IdeaCategory, string> = {
  theme_decor: 'Theme & Decor',
  budget_saving: 'Budget Saver',
  catering: 'Catering & Dining',
  entertainment: 'Entertainment & Music',
  guest_experience: 'Guest Experience',
  priorities: 'Preparation Priority',
};

interface AiAssistantProps {
  onOpenSettingsModal: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onOpenSettingsModal }) => {
  const {
    activeEvent,
    apiKey,
    isAiLoading,
    aiStatusMessage,
    refreshAiIdeas,
    applyIdeaToPlanner,
  } = useEventContext();

  const [customPrompt, setCustomPrompt] = useState('');
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);

  if (!activeEvent) return null;

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    await refreshAiIdeas(customPrompt.trim());
    setCustomPrompt('');
  };

  const handleApplyIdea = (idea: PersonalizedIdea) => {
    const success = applyIdeaToPlanner(idea);
    if (success) {
      setImportedIds((prev) => new Set(prev).add(idea.id));
      setNotification(`Successfully added "${idea.title}" into your planner workspace!`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const getImpactBadgeVariant = (impact?: string) => {
    switch (impact) {
      case 'High Impact':
        return 'forest';
      case 'Cost Saver':
        return 'success';
      case 'Crowd Pleaser':
        return 'gold';
      case 'Essential':
        return 'rose';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Provider Transparency Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 tracking-tight">
              GenAI Planning Assistant
            </h2>
            <Sparkles className="w-5 h-5 text-gold-500" />
          </div>
          <p className="text-sm text-stone-muted mt-1">
            Personalized celebration architecture tailored to {activeEvent.name}.
          </p>
        </div>

        {/* Provider Status Pill */}
        <div className="flex items-center gap-3">
          {apiKey ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs text-emerald-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Model: Google Gemini 1.5 Flash</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold-300 bg-gold-50 text-xs text-gold-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-gold-500" />
              <span>Demo Mode: Gatherly Rule-Based Engine</span>
              <button
                onClick={onOpenSettingsModal}
                className="underline hover:text-gold-900 font-semibold ml-1 flex items-center gap-1"
                title="Add Gemini API key"
              >
                <Key className="w-3 h-3" /> Connect Live Key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Interactive Assistant Query Card */}
      <div className="bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-cream-50 p-6 sm:p-8 rounded-2xl shadow-elevated border border-forest-700">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-700/80 text-gold-300">
              <Lightbulb className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-cream-50">
                Ask Gatherly’s Celebration Architect
              </h3>
              <p className="text-xs sm:text-sm text-cream-200/80">
                Generate budget-saving swaps, guest activities, signature menus, or schedule tips.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendQuery} className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. How can we save $1,500 on catering without compromising quality?"
              disabled={isAiLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-forest-950/80 border border-forest-700 text-cream-50 placeholder-cream-200/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="gold"
              isLoading={isAiLoading}
              disabled={isAiLoading || !customPrompt.trim()}
              className="px-5 py-3 rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Ask Assistant</span>
            </Button>
          </form>

          {/* Quick Prompts Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-cream-200/60 font-medium">Quick suggestions:</span>
            <button
              onClick={() => {
                setCustomPrompt('Give me 3 memorable signature cocktail and mocktail concepts');
              }}
              className="px-2.5 py-1 rounded-full bg-forest-700/60 hover:bg-forest-700 text-cream-100 border border-forest-600/50 transition-colors"
            >
              Signature Drinks
            </button>
            <button
              onClick={() => {
                setCustomPrompt('How to organize seating and guest flow smoothly?');
              }}
              className="px-2.5 py-1 rounded-full bg-forest-700/60 hover:bg-forest-700 text-cream-100 border border-forest-600/50 transition-colors"
            >
              Guest Flow & Seating
            </button>
            <button
              onClick={() => {
                setCustomPrompt('What are high-impact low-cost decoration alternatives?');
              }}
              className="px-2.5 py-1 rounded-full bg-forest-700/60 hover:bg-forest-700 text-cream-100 border border-forest-600/50 transition-colors"
            >
              Cost-Saving Decor
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis Status Output */}
      {aiStatusMessage && (
        <div className="p-4 rounded-xl border border-stone-border bg-white text-xs sm:text-sm text-stone-dark flex items-start gap-3 shadow-subtle">
          <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-forest-900">Assistant Synthesis: </span>
            {aiStatusMessage}
          </div>
        </div>
      )}

      {/* Generated Ideas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl text-forest-900">
            Personalized Recommendations ({activeEvent.ideas.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refreshAiIdeas()}
            isLoading={isAiLoading}
          >
            Regenerate Ideas
          </Button>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeEvent.ideas.map((idea) => {
            const isImported = importedIds.has(idea.id);
            const hasAction = !!idea.actionableImport;

            return (
              <div
                key={idea.id}
                className="bg-white p-6 rounded-2xl border border-stone-border shadow-card hover:border-gold-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="neutral" size="sm">
                      <Tag className="w-3 h-3 text-forest-700" />
                      {CATEGORY_NAMES[idea.category] || idea.category}
                    </Badge>
                    {idea.estimatedImpact && (
                      <Badge variant={getImpactBadgeVariant(idea.estimatedImpact)} size="sm">
                        {idea.estimatedImpact}
                      </Badge>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-lg text-forest-900 group-hover:text-forest-700 transition-colors">
                    {idea.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-muted mt-2 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                {/* 1-Click Actionable Import Button */}
                <div className="mt-5 pt-4 border-t border-stone-border flex items-center justify-between">
                  <div className="text-xs text-stone-muted">
                    {idea.actionableImport && (
                      <span className="font-medium text-stone-dark flex items-center gap-1">
                        {idea.actionableImport.type === 'budget' && (
                          <>
                            <DollarSign className="w-3.5 h-3.5 text-forest-700" />
                            Add to Budget
                          </>
                        )}
                        {idea.actionableImport.type === 'timeline' && (
                          <>
                            <Calendar className="w-3.5 h-3.5 text-forest-700" />
                            Add to Timeline
                          </>
                        )}
                        {idea.actionableImport.type === 'vendor' && (
                          <>
                            <Layers className="w-3.5 h-3.5 text-forest-700" />
                            Add to Vendor List
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {hasAction ? (
                    <Button
                      size="sm"
                      variant={isImported ? 'secondary' : 'primary'}
                      onClick={() => handleApplyIdea(idea)}
                      disabled={isImported}
                    >
                      {isImported ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Imported
                        </>
                      ) : (
                        <>
                          <span>Apply to Planner</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-stone-muted italic">Inspirational concept</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Integrity Notice */}
      <div className="text-xs text-stone-muted flex items-start gap-2 p-4 rounded-xl bg-cream-50 border border-stone-border">
        <ShieldAlert className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Security & AI Architecture:</strong> When a Google Gemini API key is configured, calls are executed with strict JSON schemas and output validation. Keys are never embedded in static assets or logged. When credentials are not set, Gatherly uses deterministic rule-based planning heuristics to safeguard uninterrupted functionality.
        </div>
      </div>
    </div>
  );
};
