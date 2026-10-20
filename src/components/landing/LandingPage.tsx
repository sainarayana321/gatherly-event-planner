import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Cake,
  Users,
  DollarSign,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onOpenCreateModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
  onOpenCreateModal,
}) => {
  const { setActiveEvent } = useEventContext();

  const handleSelectSample = (id: string) => {
    setActiveEvent(id);
    onEnterWorkspace();
  };

  return (
    <div className="space-y-24 py-8 sm:py-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-300 bg-gold-50/70 text-xs font-semibold text-gold-800 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Prompt Wars Challenge 5 — Masterpiece Edition</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-forest-900 tracking-tight leading-[1.15]">
          The Art of Celebration,{' '}
          <span className="italic font-normal text-forest-700">Architected by Intelligence.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-stone-muted leading-relaxed font-normal">
          Organize unforgettable weddings, milestone birthdays, and community festivals with date-aware timelines, dynamic budget governance, and personalized GenAI recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={onEnterWorkspace}
            className="w-full sm:w-auto shadow-elevated"
          >
            <span>Launch Planning Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={onOpenCreateModal}
            className="w-full sm:w-auto"
          >
            + Create New Celebration
          </Button>
        </div>

        {/* Hero Visual Preview Card */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-stone-border to-cream-200 shadow-elevated border border-stone-border">
            <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 text-left border border-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-border">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-gold-400" />
                  <span className="w-3 h-3 rounded-full bg-forest-400" />
                  <span className="text-xs font-serif font-bold text-forest-900 ml-2">
                    Gatherly Celebration Workspace
                  </span>
                </div>
                <Badge variant="forest" size="sm">
                  Active Intelligence Engine
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-stone-border shadow-subtle">
                  <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Heart className="w-4 h-4" /> Weddings
                  </div>
                  <h4 className="font-serif font-bold text-forest-900 text-sm">
                    Elena & Marcus’s Greenhouse Wedding
                  </h4>
                  <p className="text-xs text-stone-muted mt-1">
                    $35,000 budget • 135 guests • 8 milestones • 6 vendors
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-border shadow-subtle">
                  <div className="flex items-center gap-2 text-gold-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Cake className="w-4 h-4" /> Birthdays
                  </div>
                  <h4 className="font-serif font-bold text-forest-900 text-sm">
                    Julian’s 30th Golden Hour Rooftop
                  </h4>
                  <p className="text-xs text-stone-muted mt-1">
                    $5,500 budget • 50 guests • Custom neon & signature drinks
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-border shadow-subtle">
                  <div className="flex items-center gap-2 text-forest-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Users className="w-4 h-4" /> Community
                  </div>
                  <h4 className="font-serif font-bold text-forest-900 text-sm">
                    Harvest Festival & Food Trucks
                  </h4>
                  <p className="text-xs text-stone-muted mt-1">
                    $8,500 budget • 350 residents • Civic permits & live acoustic
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest-900">
            Engineered for Every Milestone
          </h2>
          <p className="text-sm sm:text-base text-stone-muted">
            Whether an intimate dinner, a grand reception, or a neighborhood civic fair, Gatherly adapts its planning logic to your unique celebration archetype.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weddings */}
          <div className="bg-white p-8 rounded-3xl border border-stone-border shadow-card flex flex-col justify-between hover:border-rose-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-forest-900">
                Romantic Weddings
              </h3>
              <p className="text-stone-muted text-sm leading-relaxed">
                Seamlessly coordinate multi-tier budgets, floral decor, catering tastings, photographer shot-lists, and the sacred 15-minute sanctuary pause.
              </p>
              <ul className="text-xs space-y-2 text-stone-dark pt-2">
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                  Plated dining & cocktail ratios
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                  Date-aware RSVP & tasting countdown
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                  Floral installation & lighting staging
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={() => handleSelectSample('sample-wedding-01')}
              >
                Inspect Wedding Workspace →
              </Button>
            </div>
          </div>

          {/* Birthdays */}
          <div className="bg-white p-8 rounded-3xl border border-stone-border shadow-card flex flex-col justify-between hover:border-gold-300 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
                <Cake className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-forest-900">
                Milestone Birthdays
              </h3>
              <p className="text-stone-muted text-sm leading-relaxed">
                Design electrifying rooftop soirées or intimate retro dinners with themed neon backdrops, artisanal bakeries, live DJ sets, and interactive memories.
              </p>
              <ul className="text-xs space-y-2 text-stone-dark pt-2">
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                  Custom dessert & cake bakery tracker
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                  Instant photo booth & guestbook ideas
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-gold-600" />
                  DJ playlists & interactive games
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gold-300 text-gold-700 hover:bg-gold-50"
                onClick={() => handleSelectSample('sample-birthday-02')}
              >
                Inspect Birthday Workspace →
              </Button>
            </div>
          </div>

          {/* Community Events */}
          <div className="bg-white p-8 rounded-3xl border border-stone-border shadow-card flex flex-col justify-between hover:border-forest-400 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-forest-900">
                Community Gatherings
              </h3>
              <p className="text-stone-muted text-sm leading-relaxed">
                Govern civic block parties, cultural showcases, and parks festivals with municipal permit checkpoints, staging rentals, and food truck collectives.
              </p>
              <ul className="text-xs space-y-2 text-stone-dark pt-2">
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-forest-600" />
                  City permit & sound regulation tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-forest-600" />
                  Marquee canopy, staging & ADA logistics
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 text-forest-600" />
                  Volunteer shift management & safety
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-stone-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-forest-300 text-forest-800 hover:bg-forest-50"
                onClick={() => handleSelectSample('sample-community-03')}
              >
                Inspect Community Workspace →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="bg-cream-200/50 border-y border-stone-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="gold">System Capabilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-forest-900">
              The Four Pillars of Gatherly
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-lg">
                Budget Governance
              </h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Real-time tracking with category allocations, variance calculations, and instant warnings if expenses exceed the budget ceiling.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-lg">
                Date-Aware Timelines
              </h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Milestones dynamically adapt when you alter celebration dates, guaranteeing no impossible historical deadlines occur.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-lg">
                Vendor Directory
              </h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Organize venue, catering, sound, and lighting partners with agreement notes, estimated costs, and 4-tier inquiry states.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-border shadow-subtle space-y-3">
              <div className="w-10 h-10 rounded-xl bg-forest-800 text-gold-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-forest-900 text-lg">
                Actionable GenAI
              </h4>
              <p className="text-xs text-stone-muted leading-relaxed">
                Gemini 1.5 Flash generates tailored ideas that import directly into your budget, timeline, or vendor roster with 1-click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 text-cream-50 rounded-3xl p-8 sm:p-14 shadow-elevated border border-forest-700 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-50 tracking-tight">
            Ready to Plan an Unforgettable Gathering?
          </h2>
          <p className="text-sm sm:text-base text-cream-200/80 max-w-xl mx-auto leading-relaxed">
            Begin with our curated templates or construct a custom celebration workspace from scratch in seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="gold" onClick={onEnterWorkspace}>
              Launch Workspace Now
            </Button>
            <Button size="lg" variant="secondary" onClick={onOpenCreateModal}>
              Create New Celebration
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
