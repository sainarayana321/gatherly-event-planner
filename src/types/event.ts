export type EventType = 'wedding' | 'birthday' | 'community';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'decor'
  | 'photography'
  | 'entertainment'
  | 'attire'
  | 'logistics'
  | 'misc';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  plannedAmount: number;
  actualAmount: number;
  notes?: string;
}

export type MilestoneCategory =
  | 'planning'
  | 'booking'
  | 'coordination'
  | 'execution'
  | 'wrapup';

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  category: MilestoneCategory;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'decor'
  | 'photography'
  | 'entertainment'
  | 'logistics'
  | 'permits'
  | 'misc';

export type VendorStatus = 'not_started' | 'in_inquiry' | 'booked' | 'completed';

export interface VendorChecklistItem {
  id: string;
  category: VendorCategory;
  title: string;
  vendorName?: string;
  estimatedCost?: number;
  status: VendorStatus;
  notes?: string;
}

export type IdeaCategory =
  | 'theme_decor'
  | 'budget_saving'
  | 'catering'
  | 'entertainment'
  | 'guest_experience'
  | 'priorities';

export interface PersonalizedIdea {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  estimatedImpact?: 'High Impact' | 'Cost Saver' | 'Crowd Pleaser' | 'Essential';
  actionableImport?: {
    type: 'budget' | 'timeline' | 'vendor';
    item: Partial<BudgetItem> | Partial<TimelineMilestone> | Partial<VendorChecklistItem>;
  };
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  guestCount: number;
  totalBudget: number;
  currency: Currency;
  location?: string;
  theme?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendorChecklist: VendorChecklistItem[];
  ideas: PersonalizedIdea[];
  aiProviderUsed?: 'gemini' | 'rule_based';
}

export interface BudgetSummary {
  totalBudget: number;
  totalPlanned: number;
  totalActual: number;
  remainingPlanned: number;
  remainingActual: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  categoryBreakdown: Record<BudgetCategory, { planned: number; actual: number; count: number }>;
}
