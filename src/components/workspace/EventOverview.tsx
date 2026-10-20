import React, { useState } from 'react';
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Edit2,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency } from '../../services/currency';
import { getDaysUntil } from '../../services/ruleBasedPlanner';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

interface EventOverviewProps {
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors' | 'assistant') => void;
}

export const EventOverview: React.FC<EventOverviewProps> = ({ onNavigateTab }) => {
  const { activeEvent, budgetSummary, updateEventDetails, regenerateMilestonesForDate } = useEventContext();
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState(activeEvent?.name || '');
  const [editDate, setEditDate] = useState(activeEvent?.date || '');
  const [editGuests, setEditGuests] = useState(String(activeEvent?.guestCount || 100));
  const [editLocation, setEditLocation] = useState(activeEvent?.location || '');
  const [editTheme, setEditTheme] = useState(activeEvent?.theme || '');

  if (!activeEvent) {
    return (
      <div className="p-8 text-center text-stone-muted">
        No active celebration plan selected.
      </div>
    );
  }

  const daysRemaining = getDaysUntil(activeEvent.date);

  const completedMilestones = activeEvent.timeline.filter((m) => m.completed).length;
  const totalMilestones = activeEvent.timeline.length;
  const timelineProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const bookedVendors = activeEvent.vendorChecklist.filter(
    (v) => v.status === 'booked' || v.status === 'completed'
  ).length;
  const totalVendors = activeEvent.vendorChecklist.length;
  const vendorProgress = totalVendors > 0 ? (bookedVendors / totalVendors) * 100 : 0;

  const budgetPercent = activeEvent.totalBudget > 0
    ? (budgetSummary.totalPlanned / activeEvent.totalBudget) * 100
    : 0;

  const handleStartEdit = () => {
    setEditName(activeEvent.name);
    setEditDate(activeEvent.date);
    setEditGuests(String(activeEvent.guestCount));
    setEditLocation(activeEvent.location || '');
    setEditTheme(activeEvent.theme || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const parsedGuests = parseInt(editGuests, 10);
    const dateChanged = editDate !== activeEvent.date;

    updateEventDetails({
      name: editName.trim() || activeEvent.name,
      guestCount: isNaN(parsedGuests) || parsedGuests <= 0 ? activeEvent.guestCount : parsedGuests,
      location: editLocation.trim() || undefined,
      theme: editTheme.trim() || undefined,
      date: editDate || activeEvent.date,
    });

    if (dateChanged && editDate) {
      regenerateMilestonesForDate(editDate);
    }

    setIsEditing(false);
  };

  const getDaysBadge = () => {
    if (daysRemaining < 0) {
      return <Badge variant="neutral">Completed Celebration</Badge>;
    }
    if (daysRemaining === 0) {
      return <Badge variant="gold">Happening Today!</Badge>;
    }
    if (daysRemaining <= 7) {
      return <Badge variant="warning">{daysRemaining} days remaining (Final stretch!)</Badge>;
    }
    return <Badge variant="forest">{daysRemaining} days until event</Badge>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200 border border-stone-border rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={activeEvent.type === 'wedding' ? 'rose' : activeEvent.type === 'birthday' ? 'gold' : 'forest'}>
                {activeEvent.type.toUpperCase()}
              </Badge>
              {getDaysBadge()}
              {activeEvent.theme && (
                <span className="text-xs text-stone-muted flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-gold-600" />
                  {activeEvent.theme}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-2xl font-serif font-bold text-forest-900 bg-white border border-stone-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="text-xs bg-white border border-stone-border rounded px-2.5 py-1.5"
                  />
                  <input
                    type="number"
                    value={editGuests}
                    onChange={(e) => setEditGuests(e.target.value)}
                    placeholder="Guest count"
                    className="text-xs bg-white border border-stone-border rounded px-2.5 py-1.5"
                  />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Venue / City"
                    className="text-xs bg-white border border-stone-border rounded px-2.5 py-1.5"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveEdit}>
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-forest-900 tracking-tight">
                  {activeEvent.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-stone-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-forest-700" />
                    {activeEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-forest-700" />
                    {activeEvent.guestCount} Guests
                  </span>
                  {activeEvent.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-forest-700" />
                      {activeEvent.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-semibold text-stone-dark">
                    <DollarSign className="w-4 h-4 text-forest-700" />
                    Budget: {formatCurrency(activeEvent.totalBudget, activeEvent.currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex flex-col sm:flex-row gap-2.5 self-start md:self-center">
              <Button size="sm" variant="outline" onClick={handleStartEdit}>
                <Edit2 className="w-3.5 h-3.5" />
                Edit Event
              </Button>
              <Button size="sm" variant="primary" onClick={() => onNavigateTab('assistant')}>
                <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                Ask AI Assistant
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overbudget Warning Alert */}
      {budgetSummary.isOverBudget && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 flex items-start gap-3 shadow-subtle">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-semibold text-rose-900">
              Budget Alert: Planned expenses exceed budget by{' '}
              {formatCurrency(budgetSummary.overBudgetAmount, activeEvent.currency)}
            </h4>
            <p className="text-rose-700 mt-0.5">
              Your planned expenses total {formatCurrency(budgetSummary.totalPlanned, activeEvent.currency)} against a limit of {formatCurrency(budgetSummary.totalBudget, activeEvent.currency)}. Review the budget planner to adjust line items or increase your allocation.
            </p>
          </div>
          <Button size="sm" variant="danger" onClick={() => onNavigateTab('budget')}>
            Fix Budget
          </Button>
        </div>
      )}

      {/* KPI Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget KPI */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="bg-white p-5 rounded-xl border border-stone-border shadow-card hover:border-gold-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Budget Allocated</span>
            <DollarSign className="w-4 h-4 text-forest-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {formatCurrency(budgetSummary.totalPlanned, activeEvent.currency)}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            of {formatCurrency(activeEvent.totalBudget, activeEvent.currency)} limit
          </p>
          <ProgressBar
            value={budgetPercent}
            variant={budgetSummary.isOverBudget ? 'rose' : 'forest'}
            className="mt-3"
          />
        </div>

        {/* Timeline KPI */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="bg-white p-5 rounded-xl border border-stone-border shadow-card hover:border-gold-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Milestones Done</span>
            <Clock className="w-4 h-4 text-forest-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {completedMilestones} / {totalMilestones}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            {totalMilestones - completedMilestones} tasks pending action
          </p>
          <ProgressBar
            value={timelineProgress}
            variant="gold"
            className="mt-3"
          />
        </div>

        {/* Vendors KPI */}
        <div
          onClick={() => onNavigateTab('vendors')}
          className="bg-white p-5 rounded-xl border border-stone-border shadow-card hover:border-gold-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-muted text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Vendors Booked</span>
            <CheckCircle2 className="w-4 h-4 text-forest-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {bookedVendors} / {totalVendors}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            {totalVendors - bookedVendors} services to confirm
          </p>
          <ProgressBar
            value={vendorProgress}
            variant="forest"
            className="mt-3"
          />
        </div>

        {/* AI Ideas KPI */}
        <div
          onClick={() => onNavigateTab('assistant')}
          className="bg-gradient-to-br from-forest-800 to-forest-950 text-cream-50 p-5 rounded-xl border border-forest-900 shadow-card hover:border-gold-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>AI Ideas Ready</span>
            <Sparkles className="w-4 h-4 text-gold-300 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-2xl font-serif font-bold text-cream-50">
            {activeEvent.ideas.length} Recommendations
          </div>
          <p className="text-xs text-cream-200/80 mt-1">
            {activeEvent.aiProviderUsed === 'gemini' ? 'Gemini 1.5 Model' : 'Rule-Based Engine'}
          </p>
          <div className="mt-3 flex items-center text-xs text-gold-300 font-medium group-hover:underline">
            <span>Review & Import</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Snapshot Cards Grid: Timeline Next Steps & Budget Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Milestones Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-border">
              <div>
                <h3 className="font-serif font-bold text-lg text-forest-900">
                  Immediate Milestones
                </h3>
                <p className="text-xs text-stone-muted">Upcoming chronological deadlines</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onNavigateTab('timeline')}>
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="divide-y divide-stone-border mt-2">
              {activeEvent.timeline.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="py-3 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${milestone.completed ? 'bg-emerald-500' : 'bg-gold-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${milestone.completed ? 'line-through text-stone-muted' : 'text-stone-dark'}`}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-stone-muted truncate">
                      Due: {milestone.dueDate} • {milestone.category}
                    </p>
                  </div>
                  <Badge variant={milestone.completed ? 'success' : 'neutral'} size="sm">
                    {milestone.completed ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Status Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-border">
              <div>
                <h3 className="font-serif font-bold text-lg text-forest-900">
                  Key Vendor Partners
                </h3>
                <p className="text-xs text-stone-muted">Booking status and cost estimates</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onNavigateTab('vendors')}>
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="divide-y divide-stone-border mt-2">
              {activeEvent.vendorChecklist.slice(0, 4).map((vendor) => (
                <div key={vendor.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-dark truncate">
                      {vendor.title}
                    </p>
                    <p className="text-xs text-stone-muted truncate">
                      {vendor.vendorName || 'Vendor not assigned'} • {vendor.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      size="sm"
                      variant={
                        vendor.status === 'booked'
                          ? 'success'
                          : vendor.status === 'in_inquiry'
                          ? 'gold'
                          : 'neutral'
                      }
                    >
                      {vendor.status.replace('_', ' ')}
                    </Badge>
                    {vendor.estimatedCost !== undefined && (
                      <p className="text-xs text-stone-muted mt-0.5">
                        {formatCurrency(vendor.estimatedCost, activeEvent.currency)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
