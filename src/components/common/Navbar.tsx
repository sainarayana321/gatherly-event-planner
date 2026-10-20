import React from 'react';
import {
  Sparkles,
  Plus,
  DollarSign,
  Clock,
  CheckSquare,
  Printer,
  Key,
  ChevronDown,
  LayoutDashboard,
  Heart,
  Cake,
  Users,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { EventType } from '../../types/event';

interface NavbarProps {
  currentTab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'assistant';
  onSelectTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'assistant') => void;
  onOpenCreateModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  showLanding: boolean;
  onToggleLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  onOpenExportModal,
  onOpenSettingsModal,
  showLanding,
  onToggleLanding,
}) => {
  const { events, activeEvent, setActiveEvent, apiKey } = useEventContext();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'birthday':
        return <Cake className="w-3.5 h-3.5 text-gold-600" />;
      case 'community':
        return <Users className="w-3.5 h-3.5 text-forest-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-stone-border shadow-subtle no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Event Selector */}
          <div className="flex items-center gap-6">
            <button
              onClick={onToggleLanding}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-lg p-1"
              aria-label="Gatherly Home"
            >
              <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-cream-50 shadow-sm group-hover:bg-forest-800 transition-colors">
                <Sparkles className="w-5 h-5 text-gold-300" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-forest-900 group-hover:text-forest-700 transition-colors">
                  Gatherly
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded border border-gold-200">
                  GenAI Planner
                </span>
              </div>
            </button>

            {/* Event Switcher Dropdown */}
            {!showLanding && activeEvent && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-border bg-white hover:bg-cream-100 text-stone-dark text-xs sm:text-sm font-medium transition-colors shadow-subtle max-w-[200px] sm:max-w-xs truncate"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="shrink-0">{getTypeIcon(activeEvent.type)}</span>
                  <span className="truncate">{activeEvent.name}</span>
                  <ChevronDown className="w-4 h-4 text-stone-muted shrink-0 ml-auto" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute left-0 mt-1.5 w-72 bg-cream-50 rounded-xl shadow-elevated border border-stone-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold text-stone-muted uppercase tracking-wider">
                      Your Celebration Plans
                    </div>
                    {events.map((evt) => (
                      <button
                        key={evt.id}
                        onClick={() => {
                          setActiveEvent(evt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                          evt.id === activeEvent.id
                            ? 'bg-forest-50 text-forest-900 font-semibold border-l-4 border-forest-600'
                            : 'text-stone-dark hover:bg-cream-100'
                        }`}
                        role="menuitem"
                      >
                        {getTypeIcon(evt.type)}
                        <div className="truncate flex-1">
                          <p className="truncate">{evt.name}</p>
                          <p className="text-[11px] text-stone-muted">
                            {evt.date} • {evt.guestCount} guests
                          </p>
                        </div>
                      </button>
                    ))}
                    <div className="my-1 border-t border-stone-border" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenCreateModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-forest-700 hover:bg-forest-50 transition-colors"
                      role="menuitem"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Celebration Plan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs (visible when in workspace mode) */}
          {!showLanding && (
            <nav className="hidden md:flex items-center gap-1 bg-cream-200/80 p-1 rounded-xl border border-stone-border">
              <button
                onClick={() => onSelectTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'overview'
                    ? 'bg-white text-forest-900 shadow-subtle font-semibold'
                    : 'text-stone-muted hover:text-stone-dark'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Overview
              </button>
              <button
                onClick={() => onSelectTab('budget')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'budget'
                    ? 'bg-white text-forest-900 shadow-subtle font-semibold'
                    : 'text-stone-muted hover:text-stone-dark'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Budget
              </button>
              <button
                onClick={() => onSelectTab('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'timeline'
                    ? 'bg-white text-forest-900 shadow-subtle font-semibold'
                    : 'text-stone-muted hover:text-stone-dark'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Timeline
              </button>
              <button
                onClick={() => onSelectTab('vendors')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'vendors'
                    ? 'bg-white text-forest-900 shadow-subtle font-semibold'
                    : 'text-stone-muted hover:text-stone-dark'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Vendors
              </button>
              <button
                onClick={() => onSelectTab('assistant')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'assistant'
                    ? 'bg-forest-700 text-cream-50 shadow-subtle font-semibold'
                    : 'text-forest-800 hover:text-forest-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                GenAI Assistant
              </button>
            </nav>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettingsModal}
              title="Gemini AI Key Settings"
              className={`p-2 rounded-lg border transition-colors ${
                apiKey
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-stone-border bg-white text-stone-muted hover:text-stone-dark hover:bg-cream-100'
              }`}
              aria-label="AI Settings"
            >
              <Key className="w-4 h-4" />
            </button>

            {!showLanding && (
              <button
                onClick={onOpenExportModal}
                title="Export or Print Plan"
                className="p-2 rounded-lg border border-stone-border bg-white text-stone-muted hover:text-stone-dark hover:bg-cream-100 transition-colors"
                aria-label="Export or Print Plan"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg shadow-subtle transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Plan</span>
            </button>

            <button
              onClick={onToggleLanding}
              className="ml-1 text-xs font-medium text-stone-muted hover:text-forest-800 px-2 py-1.5 rounded transition-colors"
            >
              {showLanding ? 'Go to Workspace →' : 'Home'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      {!showLanding && (
        <div className="md:hidden flex border-t border-stone-border bg-cream-100 px-2 py-1.5 overflow-x-auto justify-between text-xs">
          <button
            onClick={() => onSelectTab('overview')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg ${
              currentTab === 'overview' ? 'text-forest-900 font-bold bg-white' : 'text-stone-muted'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => onSelectTab('budget')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg ${
              currentTab === 'budget' ? 'text-forest-900 font-bold bg-white' : 'text-stone-muted'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Budget</span>
          </button>
          <button
            onClick={() => onSelectTab('timeline')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg ${
              currentTab === 'timeline' ? 'text-forest-900 font-bold bg-white' : 'text-stone-muted'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => onSelectTab('vendors')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg ${
              currentTab === 'vendors' ? 'text-forest-900 font-bold bg-white' : 'text-stone-muted'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Vendors</span>
          </button>
          <button
            onClick={() => onSelectTab('assistant')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg ${
              currentTab === 'assistant' ? 'text-forest-900 font-bold bg-forest-100' : 'text-stone-muted'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>AI Ideas</span>
          </button>
        </div>
      )}
    </header>
  );
};
