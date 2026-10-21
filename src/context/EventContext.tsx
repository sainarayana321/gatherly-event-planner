import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  EventPlan,
  EventType,
  BudgetItem,
  TimelineMilestone,
  VendorChecklistItem,
  PersonalizedIdea,
  BudgetSummary,
  BudgetCategory,
  Currency,
} from '../types/event';
import {
  loadEvents,
  saveEvents,
  getActiveEventId,
  setActiveEventId,
  getSampleEvents,
  getSavedApiKey,
  saveApiKey,
} from '../services/storage';
import {
  createInitialPlan,
  generateTimelineMilestones,
} from '../services/ruleBasedPlanner';
import { generateAiEventPlan } from '../services/gemini';

interface EventContextType {
  events: EventPlan[];
  activeEvent: EventPlan | null;
  activeId: string | null;
  budgetSummary: BudgetSummary;
  apiKey: string;
  isAiLoading: boolean;
  aiStatusMessage: string | null;

  // Event management
  setActiveEvent: (id: string) => void;
  createNewEvent: (params: {
    name: string;
    type: EventType;
    date: string;
    guestCount: number;
    totalBudget: number;
    currency: Currency;
    location?: string;
    theme?: string;
    notes?: string;
  }) => EventPlan;
  updateEventDetails: (details: Partial<EventPlan>) => void;
  deleteEvent: (id: string) => void;
  resetAllToSamples: () => void;

  // Budget operations
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Timeline operations
  addMilestone: (milestone: Omit<TimelineMilestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<TimelineMilestone>) => void;
  toggleMilestone: (id: string) => void;
  deleteMilestone: (id: string) => void;
  regenerateMilestonesForDate: (newDate: string) => void;

  // Vendor Checklist operations
  addVendorItem: (item: Omit<VendorChecklistItem, 'id'>) => void;
  updateVendorItem: (id: string, updates: Partial<VendorChecklistItem>) => void;
  deleteVendorItem: (id: string) => void;

  // AI & Ideas operations
  refreshAiIdeas: (customPrompt?: string) => Promise<void>;
  applyIdeaToPlanner: (idea: PersonalizedIdea) => boolean;

  // Settings
  updateApiKey: (key: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventPlan[]>(() => loadEvents());
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    const saved = getActiveEventId();
    const initialEvents = loadEvents();
    if (saved && initialEvents.some((e) => e.id === saved)) {
      return saved;
    }
    return initialEvents[0]?.id || null;
  });

  const [apiKey, setApiKeyState] = useState<string>(() => getSavedApiKey());
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  // Sync to local storage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      saveEvents(events);
    }
  }, [events]);

  const activeEvent = useMemo(() => {
    if (!activeId) return events[0] || null;
    return events.find((e) => e.id === activeId) || events[0] || null;
  }, [events, activeId]);

  const setActiveEvent = useCallback((id: string) => {
    setActiveIdState(id);
    setActiveEventId(id);
  }, []);

  const updateApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    saveApiKey(key);
  }, []);

  // Compute single source of truth for budget
  const budgetSummary = useMemo<BudgetSummary>(() => {
    if (!activeEvent) {
      return {
        totalBudget: 0,
        totalPlanned: 0,
        totalActual: 0,
        remainingPlanned: 0,
        remainingActual: 0,
        isOverBudget: false,
        overBudgetAmount: 0,
        categoryBreakdown: {
          venue: { planned: 0, actual: 0, count: 0 },
          catering: { planned: 0, actual: 0, count: 0 },
          decor: { planned: 0, actual: 0, count: 0 },
          photography: { planned: 0, actual: 0, count: 0 },
          entertainment: { planned: 0, actual: 0, count: 0 },
          attire: { planned: 0, actual: 0, count: 0 },
          logistics: { planned: 0, actual: 0, count: 0 },
          misc: { planned: 0, actual: 0, count: 0 },
        },
      };
    }

    const totalBudget = activeEvent.totalBudget || 0;
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

    activeEvent.budgetItems.forEach((item) => {
      const planned = typeof item.plannedAmount === 'number' && isFinite(item.plannedAmount) ? Math.max(0, item.plannedAmount) : 0;
      const actual = typeof item.actualAmount === 'number' && isFinite(item.actualAmount) ? Math.max(0, item.actualAmount) : 0;

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
  }, [activeEvent]);

  // Create new event
  const createNewEvent = useCallback((params: {
    name: string;
    type: EventType;
    date: string;
    guestCount: number;
    totalBudget: number;
    currency: Currency;
    location?: string;
    theme?: string;
    notes?: string;
  }): EventPlan => {
    const newPlan = createInitialPlan(params);
    setEvents((prev) => [newPlan, ...prev]);
    setActiveEvent(newPlan.id);
    return newPlan;
  }, [setActiveEvent]);

  // Update current event details
  const updateEventDetails = useCallback((details: Partial<EventPlan>) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            ...details,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  // Delete event
  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      if (filtered.length === 0) {
        const fallback = getSampleEvents();
        setActiveEvent(fallback[0].id);
        return fallback;
      }
      if (activeId === id) {
        setActiveEvent(filtered[0].id);
      }
      return filtered;
    });
  }, [activeId, setActiveEvent]);

  // Reset to default sample plans
  const resetAllToSamples = useCallback(() => {
    const samples = getSampleEvents();
    setEvents(samples);
    setActiveEvent(samples[0].id);
    saveEvents(samples);
  }, [setActiveEvent]);

  // Budget items modifiers
  const addBudgetItem = useCallback((item: Omit<BudgetItem, 'id'>) => {
    if (!activeId) return;
    const newItem: BudgetItem = {
      ...item,
      id: 'bud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      plannedAmount: Math.max(0, item.plannedAmount || 0),
      actualAmount: Math.max(0, item.actualAmount || 0),
    };
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            budgetItems: [...e.budgetItems, newItem],
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const updateBudgetItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            budgetItems: e.budgetItems.map((bi) => {
              if (bi.id === id) {
                return {
                  ...bi,
                  ...updates,
                  plannedAmount: updates.plannedAmount !== undefined ? Math.max(0, updates.plannedAmount) : bi.plannedAmount,
                  actualAmount: updates.actualAmount !== undefined ? Math.max(0, updates.actualAmount) : bi.actualAmount,
                };
              }
              return bi;
            }),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const deleteBudgetItem = useCallback((id: string) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            budgetItems: e.budgetItems.filter((bi) => bi.id !== id),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  // Timeline modifiers
  const addMilestone = useCallback((milestone: Omit<TimelineMilestone, 'id'>) => {
    if (!activeId) return;
    const newMilestone: TimelineMilestone = {
      ...milestone,
      id: 'tl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          const updated = [...e.timeline, newMilestone].sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
          return {
            ...e,
            timeline: updated,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const updateMilestone = useCallback((id: string, updates: Partial<TimelineMilestone>) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          const updated = e.timeline.map((m) => (m.id === id ? { ...m, ...updates } : m)).sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
          return {
            ...e,
            timeline: updated,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const toggleMilestone = useCallback((id: string) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            timeline: e.timeline.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const deleteMilestone = useCallback((id: string) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            timeline: e.timeline.filter((m) => m.id !== id),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const regenerateMilestonesForDate = useCallback((newDate: string) => {
    if (!activeId || !activeEvent) return;
    const regenerated = generateTimelineMilestones(activeEvent.type, newDate);
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            date: newDate,
            timeline: regenerated,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId, activeEvent]);

  // Vendor Checklist modifiers
  const addVendorItem = useCallback((item: Omit<VendorChecklistItem, 'id'>) => {
    if (!activeId) return;
    const newItem: VendorChecklistItem = {
      ...item,
      id: 'vc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      estimatedCost: item.estimatedCost !== undefined ? Math.max(0, item.estimatedCost) : undefined,
    };
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            vendorChecklist: [...e.vendorChecklist, newItem],
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const updateVendorItem = useCallback((id: string, updates: Partial<VendorChecklistItem>) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            vendorChecklist: e.vendorChecklist.map((v) =>
              v.id === id
                ? {
                    ...v,
                    ...updates,
                    estimatedCost:
                      updates.estimatedCost !== undefined
                        ? Math.max(0, updates.estimatedCost)
                        : v.estimatedCost,
                  }
                : v
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  const deleteVendorItem = useCallback((id: string) => {
    if (!activeId) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === activeId) {
          return {
            ...e,
            vendorChecklist: e.vendorChecklist.filter((v) => v.id !== id),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  }, [activeId]);

  // Refresh AI / rule-based suggestions
  const refreshAiIdeas = useCallback(async (customPrompt?: string) => {
    if (!activeEvent) return;
    setIsAiLoading(true);
    setAiStatusMessage('Gatherly planning assistant is synthesizing recommendations...');

    try {
      const result = await generateAiEventPlan(activeEvent, customPrompt, apiKey);
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id === activeEvent.id) {
            return {
              ...e,
              ideas: result.ideas,
              aiProviderUsed: result.provider,
              updatedAt: new Date().toISOString(),
            };
          }
          return e;
        })
      );
      setAiStatusMessage(result.summary);
    } catch (err: any) {
      setAiStatusMessage('Unable to complete assistance refresh: ' + err.message);
    } finally {
      setIsAiLoading(false);
    }
  }, [activeEvent, apiKey]);

  // Apply an idea to planner
  const applyIdeaToPlanner = useCallback((idea: PersonalizedIdea): boolean => {
    if (!idea.actionableImport || !activeEvent) return false;
    const { type, item } = idea.actionableImport;

    if (type === 'budget' && item) {
      addBudgetItem({
        category: (item as any).category || 'misc',
        name: (item as any).name || idea.title,
        plannedAmount: (item as any).plannedAmount || 150,
        actualAmount: (item as any).actualAmount || 0,
        notes: (item as any).notes || idea.description,
      });
      return true;
    }

    if (type === 'timeline' && item) {
      addMilestone({
        title: (item as any).title || idea.title,
        description: (item as any).description || idea.description,
        dueDate: (item as any).dueDate || activeEvent.date,
        category: (item as any).category || 'coordination',
        completed: false,
        priority: (item as any).priority || 'medium',
      });
      return true;
    }

    if (type === 'vendor' && item) {
      addVendorItem({
        category: (item as any).category || 'misc',
        title: (item as any).title || idea.title,
        vendorName: (item as any).vendorName || undefined,
        estimatedCost: (item as any).estimatedCost || 150,
        status: (item as any).status || 'not_started',
        notes: (item as any).notes || idea.description,
      });
      return true;
    }

    return false;
  }, [activeEvent, addBudgetItem, addMilestone, addVendorItem]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeId,
        budgetSummary,
        apiKey,
        isAiLoading,
        aiStatusMessage,
        setActiveEvent,
        createNewEvent,
        updateEventDetails,
        deleteEvent,
        resetAllToSamples,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addMilestone,
        updateMilestone,
        toggleMilestone,
        deleteMilestone,
        regenerateMilestonesForDate,
        addVendorItem,
        updateVendorItem,
        deleteVendorItem,
        refreshAiIdeas,
        applyIdeaToPlanner,
        updateApiKey,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
