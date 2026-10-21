import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Check,
  X,
  PieChart,
  Filter,
  Info,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency, normalizeAmount } from '../../services/currency';
import { BudgetCategory, BudgetItem } from '../../types/event';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

const CATEGORY_NAMES: Record<BudgetCategory, string> = {
  venue: 'Venue & Facilities',
  catering: 'Catering & Beverages',
  decor: 'Decor & Florals',
  photography: 'Photo & Video',
  entertainment: 'Music & Entertainment',
  attire: 'Attire & Styling',
  logistics: 'Logistics & Rentals',
  misc: 'Miscellaneous & Contingency',
};

export const BudgetPlanner: React.FC = () => {
  const {
    activeEvent,
    budgetSummary,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateEventDetails,
  } = useEventContext();

  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Inline edit state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<BudgetCategory>('catering');
  const [editPlanned, setEditPlanned] = useState('');
  const [editActual, setEditActual] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Add Item State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<BudgetCategory>('catering');
  const [newPlanned, setNewPlanned] = useState('');
  const [newActual, setNewActual] = useState('0');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Total budget quick edit state
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [tempTotal, setTempTotal] = useState('');

  if (!activeEvent) return null;

  const currency = activeEvent.currency;

  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPlanned(String(item.plannedAmount));
    setEditActual(String(item.actualAmount));
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    const planned = normalizeAmount(editPlanned);
    const actual = normalizeAmount(editActual);

    updateBudgetItem(id, {
      name: editName.trim() || 'Expense Item',
      category: editCategory,
      plannedAmount: planned,
      actualAmount: actual,
      notes: editNotes.trim() || undefined,
    });

    setEditingId(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Please enter an item name');
      return;
    }

    const planned = normalizeAmount(newPlanned);
    const actual = normalizeAmount(newActual);

    addBudgetItem({
      name: newName.trim(),
      category: newCategory,
      plannedAmount: planned,
      actualAmount: actual,
      notes: newNotes.trim() || undefined,
    });

    // Reset form
    setNewName('');
    setNewPlanned('');
    setNewActual('0');
    setNewNotes('');
    setFormError('');
    setIsAdding(false);
  };

  const handleSaveTotalBudget = () => {
    const parsed = normalizeAmount(tempTotal);
    updateEventDetails({ totalBudget: parsed });
    setIsEditingTotal(false);
  };

  const filteredItems = selectedCategory === 'all'
    ? activeEvent.budgetItems
    : activeEvent.budgetItems.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 tracking-tight">
            Budget Management
          </h2>
          <p className="text-sm text-stone-muted mt-1">
            Real-time tracking of allocations, actual expenditures, and remaining funds.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAdding(!isAdding)}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Close Form' : 'Add Expense'}
        </Button>
      </div>

      {/* KPI Tiles Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card relative">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            <span>Total Budget Limit</span>
            <button
              onClick={() => {
                setTempTotal(String(activeEvent.totalBudget));
                setIsEditingTotal(true);
              }}
              className="p-1 hover:bg-cream-100 rounded text-stone-muted hover:text-forest-900"
              title="Edit total budget"
              aria-label="Edit total budget limit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditingTotal ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                min="0"
                value={tempTotal}
                onChange={(e) => setTempTotal(e.target.value)}
                className="w-full text-lg font-bold border border-gold-300 rounded px-2 py-1 bg-white"
                autoFocus
              />
              <Button size="sm" variant="primary" onClick={handleSaveTotalBudget}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingTotal(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="text-2xl font-serif font-bold text-forest-900">
              {formatCurrency(budgetSummary.totalBudget, currency)}
            </div>
          )}
          <p className="text-xs text-stone-muted mt-1">Target allocation limit</p>
        </div>

        {/* Planned Expenses */}
        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card">
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Planned Expenses
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {formatCurrency(budgetSummary.totalPlanned, currency)}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            {activeEvent.totalBudget > 0
              ? `${Math.round((budgetSummary.totalPlanned / activeEvent.totalBudget) * 100)}% of total allocated`
              : '0% allocated'}
          </p>
        </div>

        {/* Actual Spent */}
        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card">
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Actual Paid Out
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {formatCurrency(budgetSummary.totalActual, currency)}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            Confirmed payments to date
          </p>
        </div>

        {/* Remaining Planned Balance */}
        <div
          className={`p-5 rounded-xl border shadow-card ${
            budgetSummary.isOverBudget
              ? 'bg-rose-50 border-rose-300'
              : 'bg-white border-stone-border'
          }`}
        >
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Remaining Buffer
          </div>
          <div
            className={`text-2xl font-serif font-bold ${
              budgetSummary.isOverBudget ? 'text-rose-700' : 'text-forest-900'
            }`}
          >
            {formatCurrency(budgetSummary.remainingPlanned, currency)}
          </div>
          <p className="text-xs text-stone-muted mt-1">
            {budgetSummary.isOverBudget
              ? `Over limit by ${formatCurrency(budgetSummary.overBudgetAmount, currency)}`
              : 'Available for remaining bookings'}
          </p>
        </div>
      </div>

      {/* Overbudget Warning Alert */}
      {budgetSummary.isOverBudget && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-rose-900">
              Total Planned Spending Exceeds Budget!
            </h4>
            <p className="text-rose-700 text-xs sm:text-sm mt-0.5">
              You are currently allocated at {formatCurrency(budgetSummary.totalPlanned, currency)}, which is{' '}
              {formatCurrency(budgetSummary.overBudgetAmount, currency)} over your {formatCurrency(budgetSummary.totalBudget, currency)} budget ceiling.
              Consider reducing non-essential category lines or utilizing the GenAI Assistant’s Cost Saver ideas.
            </p>
          </div>
        </div>
      )}

      {/* Visual Category Allocations */}
      <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg text-forest-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-forest-700" />
            Category-wise Allocation
          </h3>
          <span className="text-xs text-stone-muted">
            Estimates are indicative guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(budgetSummary.categoryBreakdown) as BudgetCategory[]).map((cat) => {
            const data = budgetSummary.categoryBreakdown[cat];
            const pct = budgetSummary.totalPlanned > 0
              ? Math.round((data.planned / budgetSummary.totalPlanned) * 100)
              : 0;

            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'border-forest-600 bg-forest-50/60 ring-2 ring-forest-200'
                    : 'border-stone-border bg-cream-50/50 hover:bg-cream-100'
                }`}
              >
                <div className="flex justify-between items-start text-xs mb-1">
                  <span className="font-semibold text-forest-900 truncate">{CATEGORY_NAMES[cat]}</span>
                  <span className="font-medium text-stone-muted">{pct}%</span>
                </div>
                <div className="text-base font-serif font-bold text-stone-dark">
                  {formatCurrency(data.planned, currency)}
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-muted mt-2">
                  <span>Actual: {formatCurrency(data.actual, currency)}</span>
                  <span>{data.count} items</span>
                </div>
                <ProgressBar value={pct} variant="forest" className="mt-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Expense Form */}
      {isAdding && (
        <div className="bg-cream-50 p-6 rounded-2xl border border-gold-300 shadow-card animate-in fade-in duration-200">
          <h3 className="font-serif font-bold text-lg text-forest-900 mb-4">
            Add New Expense Line
          </h3>
          {formError && (
            <p className="mb-3 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {formError}
            </p>
          )}
          <form onSubmit={handleCreateItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label htmlFor="expense-category" className="block text-xs font-semibold text-stone-dark mb-1">Category</label>
              <select
                id="expense-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as BudgetCategory)}
                className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
              >
                {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="expense-name" className="block text-xs font-semibold text-stone-dark mb-1">Item Name *</label>
              <input
                id="expense-name"
                type="text"
                placeholder="e.g. Wedding Cake & Dessert Stand"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label htmlFor="expense-planned" className="block text-xs font-semibold text-stone-dark mb-1">Planned Amount</label>
              <input
                id="expense-planned"
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={newPlanned}
                onChange={(e) => setNewPlanned(e.target.value)}
                className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div>
              <label htmlFor="expense-actual" className="block text-xs font-semibold text-stone-dark mb-1">Actual Paid (optional)</label>
              <input
                id="expense-actual"
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={newActual}
                onChange={(e) => setNewActual(e.target.value)}
                className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="primary" className="flex-1">
                Save Item
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-border shadow-card overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 sm:p-5 border-b border-stone-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cream-50/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-muted">
              Filter by Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="text-xs bg-white border border-stone-border rounded-lg px-2.5 py-1 font-medium focus:ring-2 focus:ring-gold-400"
            >
              <option value="all">All Categories ({activeEvent.budgetItems.length})</option>
              {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-stone-muted">
            Showing {filteredItems.length} of {activeEvent.budgetItems.length} expenses
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-cream-100 text-stone-muted font-semibold text-xs uppercase tracking-wider border-b border-stone-border">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Item & Notes</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Planned</th>
                <th className="py-3.5 px-4 text-right">Actual Paid</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-muted">
                    No budget items found in this view. Click "Add Expense" to start planning!
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditingThis = editingId === item.id;
                  const variance = item.plannedAmount - item.actualAmount;

                  if (isEditingThis) {
                    return (
                      <tr key={item.id} className="bg-gold-50/50">
                        <td className="py-3 px-4 sm:px-6">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full text-xs bg-white border border-stone-border rounded p-1 mb-1 font-medium"
                          />
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes..."
                            className="w-full text-[11px] bg-white border border-stone-border rounded p-1 text-stone-muted"
                          />
                        </td>
                        <td className="py-3 px-4 text-xs text-stone-muted">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as BudgetCategory)}
                            className="text-xs bg-white border border-stone-border rounded p-1"
                          >
                            {Object.entries(CATEGORY_NAMES).map(([k, label]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={editPlanned}
                            onChange={(e) => setEditPlanned(e.target.value)}
                            className="w-24 text-xs bg-white border border-stone-border rounded p-1 text-right"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            min="0"
                            value={editActual}
                            onChange={(e) => setEditActual(e.target.value)}
                            className="w-24 text-xs bg-white border border-stone-border rounded p-1 text-right"
                          />
                        </td>
                        <td className="py-3 px-4 text-right text-xs">
                          {(() => {
                            const livePlanned = normalizeAmount(editPlanned);
                            const liveActual = normalizeAmount(editActual);
                            const liveDiff = livePlanned - liveActual;
                            return (
                              <span className={liveDiff < 0 ? 'text-rose-600 font-semibold' : 'text-stone-muted'}>
                                {liveDiff < 0 ? '-' : '+'}
                                {formatCurrency(Math.abs(liveDiff), currency)}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="primary" onClick={() => handleSaveEdit(item.id)}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-stone-dark">{item.name}</div>
                        {item.notes && (
                          <div className="text-xs text-stone-muted mt-0.5">{item.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge size="sm" variant="neutral">
                          {CATEGORY_NAMES[item.category]}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-stone-dark">
                        {formatCurrency(item.plannedAmount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-800">
                        {formatCurrency(item.actualAmount, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs">
                        <span
                          className={
                            variance < 0
                              ? 'text-rose-600 font-semibold'
                              : 'text-stone-muted'
                          }
                        >
                          {variance < 0 ? '-' : '+'}
                          {formatCurrency(Math.abs(variance), currency)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-stone-muted hover:text-stone-dark hover:bg-cream-200 rounded"
                            title="Edit"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBudgetItem(item.id)}
                            className="p-1 text-stone-muted hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-cream-100 font-semibold text-xs sm:text-sm text-stone-dark border-t border-stone-border">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6" colSpan={2}>
                    Total ({filteredItems.length} items)
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {formatCurrency(
                      filteredItems.reduce((acc, curr) => acc + curr.plannedAmount, 0),
                      currency
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-800">
                    {formatCurrency(
                      filteredItems.reduce((acc, curr) => acc + curr.actualAmount, 0),
                      currency
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Transparency Disclaimer */}
      <div className="text-xs text-stone-muted flex items-center gap-1.5 p-3 rounded-lg bg-cream-50 border border-stone-border">
        <Info className="w-4 h-4 text-gold-600 shrink-0" />
        <span>
          Planning estimates are indicative allocations for budget management and do not constitute formal quotes or contractual vendor commitments.
        </span>
      </div>
    </div>
  );
};
