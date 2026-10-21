import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Filter,
  Check,
  X,
  Info,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { formatCurrency, normalizeAmount } from '../../services/currency';
import { VendorCategory, VendorChecklistItem, VendorStatus } from '../../types/event';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: 'Venue & Facilities',
  catering: 'Catering & Dining',
  decor: 'Decor & Floristry',
  photography: 'Photo & Video',
  entertainment: 'Music & Acts',
  logistics: 'Rentals & Staging',
  permits: 'Permits & Municipal',
  misc: 'Miscellaneous Services',
};

export const VendorChecklist: React.FC = () => {
  const {
    activeEvent,
    addVendorItem,
    updateVendorItem,
    deleteVendorItem,
  } = useEventContext();

  const [filterStatus, setFilterStatus] = useState<VendorStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<VendorCategory | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Vendor Form
  const [newTitle, setNewTitle] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newCategory, setNewCategory] = useState<VendorCategory>('catering');
  const [newCost, setNewCost] = useState('');
  const [newStatus, setNewStatus] = useState<VendorStatus>('not_started');
  const [newNotes, setNewNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inline Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editVendorName, setEditVendorName] = useState('');
  const [editCategory, setEditCategory] = useState<VendorCategory>('catering');
  const [editCost, setEditCost] = useState('');
  const [editStatus, setEditStatus] = useState<VendorStatus>('not_started');
  const [editNotes, setEditNotes] = useState('');

  if (!activeEvent) return null;

  const currency = activeEvent.currency;
  const items = activeEvent.vendorChecklist;

  const totalItems = items.length;
  const bookedOrDoneCount = items.filter(
    (i) => i.status === 'booked' || i.status === 'completed'
  ).length;
  const progressPct = totalItems > 0 ? (bookedOrDoneCount / totalItems) * 100 : 0;

  const totalEstimatedCost = items.reduce(
    (sum, item) => sum + (item.estimatedCost || 0),
    0
  );

  const handleStartEdit = (item: VendorChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditVendorName(item.vendorName || '');
    setEditCategory(item.category);
    setEditCost(item.estimatedCost !== undefined ? String(item.estimatedCost) : '');
    setEditStatus(item.status);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateVendorItem(id, {
      title: editTitle.trim(),
      vendorName: editVendorName.trim() || undefined,
      category: editCategory,
      estimatedCost: editCost ? normalizeAmount(editCost) : undefined,
      status: editStatus,
      notes: editNotes.trim() || undefined,
    });
    setEditingId(null);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Please specify a service or vendor title');
      return;
    }

    addVendorItem({
      title: newTitle.trim(),
      vendorName: newVendorName.trim() || undefined,
      category: newCategory,
      estimatedCost: newCost ? normalizeAmount(newCost) : undefined,
      status: newStatus,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewVendorName('');
    setNewCost('');
    setNewStatus('not_started');
    setNewNotes('');
    setErrorMsg('');
    setIsAdding(false);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-900 tracking-tight">
            Vendor & Service Checklist
          </h2>
          <p className="text-sm text-stone-muted mt-1">
            Contract agreements, inquiries, and booking confirmations for your event.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAdding(!isAdding)}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Close Form' : 'Add Vendor Item'}
        </Button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card">
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Readiness Progress
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {bookedOrDoneCount} / {totalItems} Confirmed
          </div>
          <ProgressBar value={progressPct} variant="forest" className="mt-3" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card">
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Inquiries Pending
          </div>
          <div className="text-2xl font-serif font-bold text-gold-700">
            {items.filter((i) => i.status === 'in_inquiry' || i.status === 'not_started').length} Services
          </div>
          <p className="text-xs text-stone-muted mt-1">Awaiting proposals or outreach</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-border shadow-card">
          <div className="text-xs font-semibold text-stone-muted uppercase tracking-wider mb-2">
            Total Estimated Vendor Cost
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {formatCurrency(totalEstimatedCost, currency)}
          </div>
          <p className="text-xs text-stone-muted mt-1">Across all planned services</p>
        </div>
      </div>

      {/* Add New Vendor Form */}
      {isAdding && (
        <div className="bg-cream-50 p-6 rounded-2xl border border-gold-300 shadow-card animate-in fade-in duration-200">
          <h3 className="font-serif font-bold text-lg text-forest-900 mb-3">
            Add Service / Vendor
          </h3>
          {errorMsg && (
            <p className="mb-3 text-xs text-rose-600 font-medium">
              {errorMsg}
            </p>
          )}
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="vendor-title" className="block text-xs font-semibold text-stone-dark mb-1">Service / Role *</label>
                <input
                  id="vendor-title"
                  type="text"
                  placeholder="e.g. Acoustic Violinist for Processional"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label htmlFor="vendor-name" className="block text-xs font-semibold text-stone-dark mb-1">Vendor / Company Name</label>
                <input
                  id="vendor-name"
                  type="text"
                  placeholder="e.g. Strings & Harmony Collective"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label htmlFor="vendor-category" className="block text-xs font-semibold text-stone-dark mb-1">Category</label>
                <select
                  id="vendor-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VendorCategory)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                >
                  {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vendor-cost" className="block text-xs font-semibold text-stone-dark mb-1">Estimated Cost ({currency})</label>
                <input
                  id="vendor-cost"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="vendor-status" className="block text-xs font-semibold text-stone-dark mb-1">Booking Status</label>
                <select
                  id="vendor-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as VendorStatus)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_inquiry">In Inquiry</option>
                  <option value="booked">Booked (Deposit Paid)</option>
                  <option value="completed">Service Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="vendor-notes" className="block text-xs font-semibold text-stone-dark mb-1">Notes / Contract Details</label>
                <input
                  id="vendor-notes"
                  type="text"
                  placeholder="e.g. Includes travel within 25 miles; 50% deposit paid..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary">
                Add to Checklist
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-muted" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-muted">Status:</span>
            <select
              aria-label="Filter vendors by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as VendorStatus | 'all')}
              className="text-xs bg-white border border-stone-border rounded-lg px-2.5 py-1 font-medium focus:ring-2 focus:ring-gold-400"
            >
              <option value="all">All Statuses ({totalItems})</option>
              <option value="not_started">Not Started</option>
              <option value="in_inquiry">In Inquiry</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-muted">Category:</span>
            <select
              aria-label="Filter vendors by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as VendorCategory | 'all')}
              className="text-xs bg-white border border-stone-border rounded-lg px-2.5 py-1 font-medium focus:ring-2 focus:ring-gold-400"
            >
              <option value="all">All Categories</option>
              {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-stone-muted font-medium">
          Showing {filteredItems.length} of {totalItems} vendor items
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-muted bg-white rounded-xl border border-stone-border">
            No vendor checklist items match the current filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isEditingThis = editingId === item.id;

            if (isEditingThis) {
              return (
                <div key={item.id} className="p-5 rounded-2xl border border-gold-300 bg-gold-50/40 shadow-card space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-sm font-semibold bg-white border border-stone-border rounded p-1.5"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editVendorName}
                      onChange={(e) => setEditVendorName(e.target.value)}
                      placeholder="Vendor name"
                      className="text-xs bg-white border border-stone-border rounded p-1.5"
                    />
                    <input
                      type="number"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      placeholder="Estimated cost"
                      className="text-xs bg-white border border-stone-border rounded p-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      aria-label="Edit vendor status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as VendorStatus)}
                      className="text-xs bg-white border border-stone-border rounded p-1.5"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_inquiry">In Inquiry</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                    </select>
                    <select
                      aria-label="Edit vendor category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as VendorCategory)}
                      className="text-xs bg-white border border-stone-border rounded p-1.5"
                    >
                      {Object.entries(VENDOR_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes"
                    className="w-full text-xs bg-white border border-stone-border rounded p-1.5"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => handleSaveEdit(item.id)}>
                      <Check className="w-3.5 h-3.5" /> Save
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-stone-border shadow-card hover:border-gold-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-serif font-bold text-forest-900 text-base">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-muted mt-0.5">
                        <span className="font-medium text-stone-dark">
                          {item.vendorName ? item.vendorName : 'Vendor unassigned'}
                        </span>
                        <span>•</span>
                        <span>{VENDOR_CATEGORY_LABELS[item.category]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 text-stone-muted hover:text-stone-dark hover:bg-cream-200 rounded"
                        title="Edit vendor"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteVendorItem(item.id)}
                        className="p-1 text-stone-muted hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete vendor"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-muted mt-2 leading-relaxed bg-cream-50 p-2.5 rounded-lg border border-stone-border/60">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-stone-dark text-xs">
                    <DollarSign className="w-3.5 h-3.5 text-forest-700" />
                    {item.estimatedCost !== undefined
                      ? formatCurrency(item.estimatedCost, currency)
                      : 'Unestimated'}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Update vendor status"
                      value={item.status}
                      onChange={(e) => updateVendorItem(item.id, { status: e.target.value as VendorStatus })}
                      className="text-xs bg-cream-100 border border-stone-border rounded-lg px-2 py-1 font-medium text-stone-dark focus:ring-2 focus:ring-gold-400"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_inquiry">In Inquiry</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vendor Integrity Disclaimer */}
      <div className="text-xs text-stone-muted flex items-center gap-1.5 p-3 rounded-lg bg-cream-50 border border-stone-border">
        <Info className="w-4 h-4 text-gold-600 shrink-0" />
        <span>
          Vendor names, estimates, and contacts are user-managed planning records and do not imply automated live bookings or merchant guarantees.
        </span>
      </div>
    </div>
  );
};
