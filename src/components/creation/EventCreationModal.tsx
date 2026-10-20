import React, { useState } from 'react';
import { Heart, Cake, Users, Calendar, DollarSign, MapPin, Palette, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { EventType, Currency } from '../../types/event';
import { useEventContext } from '../../context/EventContext';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createNewEvent } = useEventContext();

  const [type, setType] = useState<EventType>('wedding');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [guestCount, setGuestCount] = useState<string>('100');
  const [totalBudget, setTotalBudget] = useState<string>('20000');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Minimum date is today
  const todayStr = new Date().toISOString().split('T')[0];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Please provide a celebration name (e.g. "Maya & Noah’s Wedding")';
    }

    if (!date) {
      errs.date = 'Please pick a celebration date';
    } else {
      const selected = new Date(date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selected.getTime())) {
        errs.date = 'Invalid date format';
      } else if (selected < today) {
        errs.date = 'Celebration date must be today or in the future';
      }
    }

    const parsedGuests = parseInt(guestCount, 10);
    if (isNaN(parsedGuests) || parsedGuests <= 0) {
      errs.guestCount = 'Guest count must be at least 1';
    }

    const parsedBudget = parseFloat(totalBudget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      errs.totalBudget = 'Total budget must be a positive number or zero';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createNewEvent({
      name: name.trim(),
      type,
      date,
      guestCount: parseInt(guestCount, 10),
      totalBudget: parseFloat(totalBudget),
      currency,
      location: location.trim() || undefined,
      theme: theme.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset fields
    setName('');
    setDate('');
    setGuestCount('100');
    setTotalBudget('20000');
    setLocation('');
    setTheme('');
    setNotes('');
    setErrors({});

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Celebration Plan"
      subtitle="Gatherly's intelligence engine will craft a date-aware milestone timeline, category-wise budget, and curated vendor checklist."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Event Type Cards */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-muted mb-2">
            1. Select Celebration Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Wedding */}
            <button
              type="button"
              onClick={() => setType('wedding')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                type === 'wedding'
                  ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-300'
                  : 'border-stone-border bg-white hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-rose-100 text-rose-700">
                  <Heart className="w-5 h-5" />
                </span>
                {type === 'wedding' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-base">Wedding</h4>
              <p className="text-xs text-stone-muted mt-0.5">
                Receptions, ceremonies, tastings & photography
              </p>
            </button>

            {/* Birthday */}
            <button
              type="button"
              onClick={() => setType('birthday')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                type === 'birthday'
                  ? 'border-gold-400 bg-gold-50/70 ring-2 ring-gold-300'
                  : 'border-stone-border bg-white hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-gold-100 text-gold-700">
                  <Cake className="w-5 h-5" />
                </span>
                {type === 'birthday' && (
                  <span className="w-2 h-2 rounded-full bg-gold-500" />
                )}
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-base">Birthday Bash</h4>
              <p className="text-xs text-stone-muted mt-0.5">
                Milestone parties, themes, entertainment & cakes
              </p>
            </button>

            {/* Community */}
            <button
              type="button"
              onClick={() => setType('community')}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                type === 'community'
                  ? 'border-forest-400 bg-forest-50/70 ring-2 ring-forest-300'
                  : 'border-stone-border bg-white hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-forest-100 text-forest-800">
                  <Users className="w-5 h-5" />
                </span>
                {type === 'community' && (
                  <span className="w-2 h-2 rounded-full bg-forest-600" />
                )}
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-base">Community Event</h4>
              <p className="text-xs text-stone-muted mt-0.5">
                Civic festivals, block parties, permits & staging
              </p>
            </button>
          </div>
        </div>

        {/* Name & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-name" className="block text-xs font-semibold text-stone-dark mb-1">
              Celebration Name *
            </label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type === 'wedding'
                  ? 'e.g. Chloe & David’s Vineyard Wedding'
                  : type === 'birthday'
                  ? 'e.g. Noah’s 25th Sunset Soirée'
                  : 'e.g. Riverside Summer Community Block Party'
              }
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-stone-border focus:ring-gold-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="event-date" className="block text-xs font-semibold text-stone-dark mb-1">
              Event Date *
            </label>
            <div className="relative">
              <input
                id="event-date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                  errors.date
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-stone-border focus:ring-gold-300'
                }`}
              />
              <Calendar className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.date}
              </p>
            )}
          </div>
        </div>

        {/* Budget, Currency & Guest Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="event-budget" className="block text-xs font-semibold text-stone-dark mb-1">
              Total Budget *
            </label>
            <div className="relative">
              <input
                id="event-budget"
                type="number"
                min="0"
                step="50"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="20000"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                  errors.totalBudget
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-stone-border focus:ring-gold-300'
                }`}
              />
              <DollarSign className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.totalBudget && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.totalBudget}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="event-currency" className="block text-xs font-semibold text-stone-dark mb-1">
              Currency
            </label>
            <select
              id="event-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-300"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-guests" className="block text-xs font-semibold text-stone-dark mb-1">
              Estimated Guests *
            </label>
            <input
              id="event-guests"
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="100"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                errors.guestCount
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-stone-border focus:ring-gold-300'
              }`}
            />
            {errors.guestCount && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.guestCount}
              </p>
            )}
          </div>
        </div>

        {/* Optional Location & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="event-location" className="block text-xs font-semibold text-stone-dark mb-1">
              Venue / Location (Optional)
            </label>
            <div className="relative">
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sunset Ridge Botanical Gardens"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-300"
              />
              <MapPin className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="event-theme" className="block text-xs font-semibold text-stone-dark mb-1">
              Theme / Aesthetic Preference (Optional)
            </label>
            <div className="relative">
              <input
                id="event-theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Tuscan Sun, Modern Minimalist, Disco Neon"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-300"
              />
              <Palette className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="event-notes" className="block text-xs font-semibold text-stone-dark mb-1">
            Special Notes or Dietary / Entertainment Preferences (Optional)
          </label>
          <div className="relative">
            <textarea
              id="event-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian catering options requested, outdoor ceremony with backup rain pavilion..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold-300"
            />
            <FileText className="w-4 h-4 text-stone-muted absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Generate Celebration Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};
