import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Circle,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Flag,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { getDaysUntil } from '../../services/ruleBasedPlanner';
import { MilestoneCategory, TimelineMilestone } from '../../types/event';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  planning: 'Planning & Vision',
  booking: 'Vendor Booking',
  coordination: 'Coordination & RSVPs',
  execution: 'Day-of Execution',
  wrapup: 'Post-Event Wrapup',
};

export const TimelineView: React.FC = () => {
  const {
    activeEvent,
    addMilestone,
    updateMilestone,
    toggleMilestone,
    deleteMilestone,
    regenerateMilestonesForDate,
  } = useEventContext();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New milestone state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState<MilestoneCategory>('planning');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit milestone state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState<MilestoneCategory>('planning');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');

  if (!activeEvent) return null;

  const totalMilestones = activeEvent.timeline.length;
  const completedMilestones = activeEvent.timeline.filter((m) => m.completed).length;

  const handleStartEdit = (m: TimelineMilestone) => {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditDesc(m.description);
    setEditDate(m.dueDate);
    setEditCategory(m.category);
    setEditPriority(m.priority);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateMilestone(id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      dueDate: editDate,
      category: editCategory,
      priority: editPriority,
    });
    setEditingId(null);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Please specify a milestone title');
      return;
    }
    if (!newDate) {
      setErrorMsg('Please select a due date');
      return;
    }

    addMilestone({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom planning milestone',
      dueDate: newDate,
      category: newCategory,
      priority: newPriority,
      completed: false,
    });

    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setErrorMsg('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 tracking-tight">
            Celebration Timeline & Milestones
          </h2>
          <p className="text-sm text-stone-muted mt-1">
            Chronological date-aware countdown to {activeEvent.name} ({activeEvent.date}).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateMilestonesForDate(activeEvent.date)}
            title="Recalculate milestone dates based on current event date"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate Dates
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Close Form' : 'Add Milestone'}
          </Button>
        </div>
      </div>

      {/* Progress Summary Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700 font-serif font-bold text-lg">
            {completedMilestones}/{totalMilestones}
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-forest-900">
              {completedMilestones === totalMilestones && totalMilestones > 0
                ? 'All Milestones Completed! Outstanding preparation!'
                : `${totalMilestones - completedMilestones} Milestones Remaining`}
            </h4>
            <p className="text-xs text-stone-muted">
              Milestones adapt dynamically to your celebration date: {activeEvent.date}
            </p>
          </div>
        </div>

        <Badge variant={completedMilestones === totalMilestones ? 'success' : 'gold'}>
          {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}% Complete
        </Badge>
      </div>

      {/* Add New Milestone Card */}
      {isAdding && (
        <div className="bg-cream-50 p-6 rounded-2xl border border-gold-300 shadow-card animate-in fade-in duration-200">
          <h3 className="font-serif font-bold text-lg text-forest-900 mb-3">
            Add Custom Milestone
          </h3>
          {errorMsg && (
            <p className="mb-3 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </p>
          )}
          <form onSubmit={handleCreateMilestone} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="milestone-title" className="block text-xs font-semibold text-stone-dark mb-1">Title *</label>
                <input
                  id="milestone-title"
                  type="text"
                  placeholder="e.g. Confirm Seating Chart & Place Cards"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label htmlFor="milestone-date" className="block text-xs font-semibold text-stone-dark mb-1">Due Date *</label>
                <input
                  id="milestone-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label htmlFor="milestone-category" className="block text-xs font-semibold text-stone-dark mb-1">Category</label>
                <select
                  id="milestone-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MilestoneCategory)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="milestone-priority" className="block text-xs font-semibold text-stone-dark mb-1">Priority</label>
                <select
                  id="milestone-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="milestone-desc" className="block text-xs font-semibold text-stone-dark mb-1">Description</label>
              <input
                id="milestone-desc"
                type="text"
                placeholder="Actionable details or contacts needed for this milestone..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Add Milestone
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Chronological Milestone List */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-border space-y-6">
        {activeEvent.timeline.length === 0 ? (
          <div className="p-8 text-center text-stone-muted bg-white rounded-xl border border-stone-border">
            No milestones planned yet. Click "Add Milestone" or "Recalculate Dates" to populate your timeline!
          </div>
        ) : (
          activeEvent.timeline.map((item) => {
            const daysLeft = getDaysUntil(item.dueDate);
            const isOverdue = !item.completed && daysLeft < 0;
            const isDueToday = !item.completed && daysLeft === 0;
            const isEditingThis = editingId === item.id;

            return (
              <div key={item.id} className="relative group">
                {/* Node on the vertical line */}
                <button
                  onClick={() => toggleMilestone(item.id)}
                  className={`absolute -left-[35px] sm:-left-[43px] top-4 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    item.completed
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-cream-100'
                      : isOverdue
                      ? 'bg-rose-500 text-white shadow-sm ring-4 ring-cream-100'
                      : isDueToday
                      ? 'bg-gold-500 text-white shadow-sm ring-4 ring-cream-100'
                      : 'bg-white text-stone-muted border-2 border-stone-border hover:border-forest-600 ring-4 ring-cream-100'
                  }`}
                  title={item.completed ? 'Mark incomplete' : 'Mark completed'}
                  aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`}
                >
                  {item.completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 fill-current" />
                  )}
                </button>

                {/* Milestone Card */}
                <div
                  className={`bg-white p-5 rounded-2xl border transition-all shadow-card ${
                    item.completed
                      ? 'border-stone-border bg-cream-50/40 opacity-75'
                      : isOverdue
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-stone-border hover:border-gold-300'
                  }`}
                >
                  {isEditingThis ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="sm:col-span-2 text-sm font-semibold bg-white border border-stone-border rounded px-2.5 py-1.5"
                        />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="text-xs bg-white border border-stone-border rounded px-2.5 py-1.5"
                        />
                      </div>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-border rounded px-2.5 py-1.5"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => handleSaveEdit(item.id)}>
                          <Check className="w-3.5 h-3.5" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-serif font-bold text-base ${
                              item.completed
                                ? 'line-through text-stone-muted'
                                : 'text-forest-900'
                            }`}
                          >
                            {item.title}
                          </span>
                          <Badge size="sm" variant="neutral">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </Badge>
                          {item.priority === 'high' && (
                            <Badge size="sm" variant="rose">
                              <Flag className="w-3 h-3 text-rose-500" /> High Priority
                            </Badge>
                          )}
                        </div>

                        {/* Status chip */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {isOverdue && (
                            <Badge size="sm" variant="rose">
                              Overdue by {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'}
                            </Badge>
                          )}
                          {isDueToday && (
                            <Badge size="sm" variant="gold">
                              Action Required Today!
                            </Badge>
                          )}
                          {!isOverdue && !isDueToday && !item.completed && (
                            <span className="text-xs text-stone-muted flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-forest-700" />
                              {daysLeft} days remaining
                            </span>
                          )}

                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1 text-stone-muted hover:text-stone-dark hover:bg-cream-200 rounded"
                              title="Edit milestone"
                              aria-label={`Edit ${item.title}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMilestone(item.id)}
                              className="p-1 text-stone-muted hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete milestone"
                              aria-label={`Delete ${item.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-muted mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-stone-border/60 flex items-center justify-between text-xs text-stone-muted">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-forest-700" />
                          Target Due: {item.dueDate}
                        </span>
                        <button
                          onClick={() => toggleMilestone(item.id)}
                          className={`text-xs font-semibold hover:underline ${
                            item.completed ? 'text-stone-muted' : 'text-forest-700'
                          }`}
                        >
                          {item.completed ? 'Re-open Milestone' : 'Mark as Complete ✓'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
