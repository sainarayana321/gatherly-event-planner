import {
  EventType,
  Currency,
  BudgetItem,
  TimelineMilestone,
  VendorChecklistItem,
  PersonalizedIdea,
  EventPlan,
} from '../types/event';

/**
 * Calculates days difference between target ISO date string and today.
 */
export function getDaysUntil(dateString: string): number {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString + 'T00:00:00');
  if (isNaN(target.getTime())) return 0;
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates milestone date relative to event date and days remaining.
 * Ensures milestone is not placed in the past or after the event.
 */
export function calculateMilestoneDate(
  eventDateStr: string,
  targetDaysBeforeEvent: number
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(eventDateStr + 'T00:00:00');
  if (isNaN(eventDate.getTime())) {
    return toDateStr(today);
  }

  const daysUntil = Math.max(0, getDaysUntil(eventDateStr));

  // If preparation window is smaller than target offset, distribute proportionally
  let effectiveDaysBefore = targetDaysBeforeEvent;
  if (daysUntil < targetDaysBeforeEvent) {
    if (daysUntil <= 1) {
      effectiveDaysBefore = 0;
    } else if (daysUntil <= 7) {
      effectiveDaysBefore = Math.floor((targetDaysBeforeEvent / 180) * daysUntil);
    } else {
      effectiveDaysBefore = Math.floor((targetDaysBeforeEvent / 90) * daysUntil);
    }
  }

  const milestoneDate = new Date(eventDate);
  milestoneDate.setDate(milestoneDate.getDate() - effectiveDaysBefore);

  // If computed date is before today, pin to today to avoid impossible historical deadlines
  if (milestoneDate < today) {
    return toDateStr(today);
  }

  return toDateStr(milestoneDate);
}

/**
 * Generates initial budget items tailored to event type and budget.
 */
export function generateBudgetItems(
  type: EventType,
  totalBudget: number
): BudgetItem[] {
  const safeBudget = Math.max(0, totalBudget);

  if (type === 'wedding') {
    return [
      {
        id: 'w-bud-1',
        category: 'venue',
        name: 'Ceremony & Reception Venue Hire',
        plannedAmount: Math.round(safeBudget * 0.35),
        actualAmount: Math.round(safeBudget * 0.34),
        notes: 'Includes ballroom, bridal suite, and terrace',
      },
      {
        id: 'w-bud-2',
        category: 'catering',
        name: 'Multi-course Dining & Bar Service',
        plannedAmount: Math.round(safeBudget * 0.28),
        actualAmount: 0,
        notes: 'Plated dinner, cocktail hour appetizers, and open bar',
      },
      {
        id: 'w-bud-3',
        category: 'photography',
        name: 'Photography & Cinematic Video',
        plannedAmount: Math.round(safeBudget * 0.12),
        actualAmount: Math.round(safeBudget * 0.05),
        notes: 'Full day coverage with second shooter and drone aerials',
      },
      {
        id: 'w-bud-4',
        category: 'decor',
        name: 'Floral Installations & Ambient Lighting',
        plannedAmount: Math.round(safeBudget * 0.10),
        actualAmount: 0,
        notes: 'Centerpieces, ceremony arch, fairy string lights, candles',
      },
      {
        id: 'w-bud-5',
        category: 'entertainment',
        name: 'Live Band / DJ & Sound Engineering',
        plannedAmount: Math.round(safeBudget * 0.08),
        actualAmount: 0,
        notes: 'Cocktail acoustic set and evening reception dance DJ',
      },
      {
        id: 'w-bud-6',
        category: 'attire',
        name: 'Bridal Gown, Groom Tux & Alterations',
        plannedAmount: Math.round(safeBudget * 0.04),
        actualAmount: Math.round(safeBudget * 0.04),
        notes: 'Attire, veil, shoes, and steam pressing',
      },
      {
        id: 'w-bud-7',
        category: 'misc',
        name: 'Contingency & License Fees',
        plannedAmount: Math.round(safeBudget * 0.03),
        actualAmount: 0,
        notes: 'Marriage license, gratuities, unexpected rentals',
      },
    ];
  }

  if (type === 'birthday') {
    return [
      {
        id: 'b-bud-1',
        category: 'venue',
        name: 'Lounge / Event Space Rental',
        plannedAmount: Math.round(safeBudget * 0.30),
        actualAmount: Math.round(safeBudget * 0.28),
        notes: '4-hour evening hire with indoor and patio lounge',
      },
      {
        id: 'b-bud-2',
        category: 'catering',
        name: 'Buffet Feast, Signature Drinks & Cake',
        plannedAmount: Math.round(safeBudget * 0.35),
        actualAmount: 0,
        notes: 'Artisan sliders, grazing board, custom 3-tier birthday cake',
      },
      {
        id: 'b-bud-3',
        category: 'decor',
        name: 'Themed Balloon Garland & Photo Backdrop',
        plannedAmount: Math.round(safeBudget * 0.12),
        actualAmount: Math.round(safeBudget * 0.10),
        notes: 'Custom neon sign, velvet backdrop, and organic balloon arch',
      },
      {
        id: 'b-bud-4',
        category: 'entertainment',
        name: 'DJ, Sound Setup & Interactive Games',
        plannedAmount: Math.round(safeBudget * 0.13),
        actualAmount: 0,
        notes: 'Curated birthday playlist, wireless microphones, trivia',
      },
      {
        id: 'b-bud-5',
        category: 'photography',
        name: 'Party Photographer & Instant Photo Booth',
        plannedAmount: Math.round(safeBudget * 0.07),
        actualAmount: 0,
        notes: '2 hours photo booth with instant customized prints',
      },
      {
        id: 'b-bud-6',
        category: 'misc',
        name: 'Party Favors & Guest Goodies',
        plannedAmount: Math.round(safeBudget * 0.03),
        actualAmount: 0,
        notes: 'Personalized gift bags and thank-you notes',
      },
    ];
  }

  // Community Event
  return [
    {
      id: 'c-bud-1',
      category: 'venue',
      name: 'Community Center / Park Pavilion Permit',
      plannedAmount: Math.round(safeBudget * 0.25),
      actualAmount: Math.round(safeBudget * 0.25),
      notes: 'Parks & recreation permit, shelter rental, cleanup deposit',
    },
    {
      id: 'c-bud-2',
      category: 'logistics',
      name: 'Staging, Tent Canopies, Tables & Chairs',
      plannedAmount: Math.round(safeBudget * 0.25),
      actualAmount: 0,
      notes: '3 marquee tents, 20 folding tables, 150 chairs, waste bins',
    },
    {
      id: 'c-bud-3',
      category: 'catering',
      name: 'Community BBQ, Food Trucks & Refreshments',
      plannedAmount: Math.round(safeBudget * 0.22),
      actualAmount: 0,
      notes: 'Subsidized food truck vouchers, water stations, ice cream',
    },
    {
      id: 'c-bud-4',
      category: 'entertainment',
      name: 'Local Musicians, PA System & Kids Activities',
      plannedAmount: Math.round(safeBudget * 0.15),
      actualAmount: 0,
      notes: 'Acoustic stage, face painter, lawn games, bouncy castle',
    },
    {
      id: 'c-bud-5',
      category: 'decor',
      name: 'Banners, Signage & Wayfinding',
      plannedAmount: Math.round(safeBudget * 0.08),
      actualAmount: 0,
      notes: 'Welcome arch banner, event schedule boards, directional signs',
    },
    {
      id: 'c-bud-6',
      category: 'misc',
      name: 'First Aid Kit, Sanitizer & Public Insurance',
      plannedAmount: Math.round(safeBudget * 0.05),
      actualAmount: 0,
      notes: 'Event liability coverage and community safety supplies',
    },
  ];
}

/**
 * Generates chronologically ordered milestones based on event type and date.
 */
export function generateTimelineMilestones(
  type: EventType,
  eventDateStr: string
): TimelineMilestone[] {
  const daysUntil = getDaysUntil(eventDateStr);

  const rawMilestones =
    type === 'wedding'
      ? [
          {
            id: 'w-tl-1',
            title: 'Finalize Venue & Date Contract',
            description: 'Sign agreements and submit the security deposit for ceremony and reception spaces.',
            daysBefore: 180,
            category: 'booking' as const,
            priority: 'high' as const,
          },
          {
            id: 'w-tl-2',
            title: 'Book Photographer & Videographer',
            description: 'Secure dates with preferred visual artists and align on mood boards and shot lists.',
            daysBefore: 120,
            category: 'booking' as const,
            priority: 'high' as const,
          },
          {
            id: 'w-tl-3',
            title: 'Menu Tasting & Catering Confirmation',
            description: 'Conduct food tasting with caterer, finalize dietary menus, and confirm bar packages.',
            daysBefore: 60,
            category: 'planning' as const,
            priority: 'medium' as const,
          },
          {
            id: 'w-tl-4',
            title: 'Send Formal Invitations & Track RSVPs',
            description: 'Mail or deliver digital invitations with meal preference and allergy selections.',
            daysBefore: 45,
            category: 'coordination' as const,
            priority: 'high' as const,
          },
          {
            id: 'w-tl-5',
            title: 'Final Attire Fitting & Accessories',
            description: 'Pick up altered garments, accessories, comfortable reception footwear, and wedding bands.',
            daysBefore: 21,
            category: 'coordination' as const,
            priority: 'medium' as const,
          },
          {
            id: 'w-tl-6',
            title: 'Lock Seating Chart & Final Headcount',
            description: 'Provide caterer and venue with finalized table layouts and individual dietary counts.',
            daysBefore: 10,
            category: 'planning' as const,
            priority: 'high' as const,
          },
          {
            id: 'w-tl-7',
            title: 'Rehearsal Run-through & Vendor Handover',
            description: 'Walk through order of service with bridal party, officiant, and audio coordinator.',
            daysBefore: 2,
            category: 'execution' as const,
            priority: 'high' as const,
          },
          {
            id: 'w-tl-8',
            title: 'Wedding Day Celebration & Cheers',
            description: 'Enjoy unforgettable moments, celebrate with loved ones, and savor every memory!',
            daysBefore: 0,
            category: 'execution' as const,
            priority: 'high' as const,
          },
        ]
      : type === 'birthday'
      ? [
          {
            id: 'b-tl-1',
            title: 'Define Theme & Reserve Party Venue',
            description: 'Select celebration theme, color palette, and book the lounge or outdoor venue.',
            daysBefore: 45,
            category: 'booking' as const,
            priority: 'high' as const,
          },
          {
            id: 'b-tl-2',
            title: 'Order Specialty Cake & Catering Menu',
            description: 'Consult baker on custom design, tier flavors, and book favorite food vendor.',
            daysBefore: 25,
            category: 'planning' as const,
            priority: 'medium' as const,
          },
          {
            id: 'b-tl-3',
            title: 'Dispatch Digital Party Invitations',
            description: 'Send fun invites via chat/email with dress code and RSVP deadline.',
            daysBefore: 20,
            category: 'coordination' as const,
            priority: 'high' as const,
          },
          {
            id: 'b-tl-4',
            title: 'Curate Party Playlist & Activity Props',
            description: 'Assemble high-energy music sets, photo booth props, and celebratory games.',
            daysBefore: 7,
            category: 'planning' as const,
            priority: 'medium' as const,
          },
          {
            id: 'b-tl-5',
            title: 'Confirm Final Headcount & Party Supplies',
            description: 'Purchase balloon garlands, tableware, party favors, and ice buckets.',
            daysBefore: 3,
            category: 'coordination' as const,
            priority: 'high' as const,
          },
          {
            id: 'b-tl-6',
            title: 'Day-of Venue Setup & Party Time!',
            description: 'Inflate balloons, position photo backdrop, welcome guests, and celebrate!',
            daysBefore: 0,
            category: 'execution' as const,
            priority: 'high' as const,
          },
        ]
      : [
          // Community Event
          {
            id: 'c-tl-1',
            title: 'Submit Municipal Permits & Park Approvals',
            description: 'File noise, park pavilion, staging, and health inspection permits with the city.',
            daysBefore: 60,
            category: 'planning' as const,
            priority: 'high' as const,
          },
          {
            id: 'c-tl-2',
            title: 'Recruit Volunteers & Form Committees',
            description: 'Organize volunteer teams for greeting, safety, trash collection, and stage setup.',
            daysBefore: 30,
            category: 'coordination' as const,
            priority: 'high' as const,
          },
          {
            id: 'c-tl-3',
            title: 'Publish Community Posters & Social Announcements',
            description: 'Distribute neighborhood flyers, library notices, and local community group posts.',
            daysBefore: 21,
            category: 'coordination' as const,
            priority: 'medium' as const,
          },
          {
            id: 'c-tl-4',
            title: 'Lock Equipment Rentals & Food Vendors',
            description: 'Finalize contracts for PA sound system, marquee tents, portable restrooms, and trucks.',
            daysBefore: 14,
            category: 'booking' as const,
            priority: 'high' as const,
          },
          {
            id: 'c-tl-5',
            title: 'Volunteer Briefing & Safety Drill',
            description: 'Review emergency protocols, first aid station location, and shift assignments.',
            daysBefore: 3,
            category: 'coordination' as const,
            priority: 'high' as const,
          },
          {
            id: 'c-tl-6',
            title: 'Community Festival Kickoff & Festivities',
            description: 'Open pavilions, conduct welcome address, host activities, and foster neighborhood connection!',
            daysBefore: 0,
            category: 'execution' as const,
            priority: 'high' as const,
          },
        ];

  // Assign calculated dates ensuring chronological ordering
  const milestonesWithDates: TimelineMilestone[] = rawMilestones.map((item, index) => {
    const calculatedDate = calculateMilestoneDate(eventDateStr, item.daysBefore);
    // Mark early items completed if event is very close
    const isCompleted = daysUntil < item.daysBefore && daysUntil <= 7 && index < 2;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      dueDate: calculatedDate,
      category: item.category,
      completed: isCompleted,
      priority: item.priority,
    };
  });

  // Sort chronologically by due date
  milestonesWithDates.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return milestonesWithDates;
}

/**
 * Generates vendor and service checklist items.
 */
export function generateVendorChecklist(
  type: EventType,
  totalBudget: number
): VendorChecklistItem[] {
  const safeBudget = Math.max(0, totalBudget);

  if (type === 'wedding') {
    return [
      {
        id: 'w-vc-1',
        category: 'venue',
        title: 'Ceremony & Reception Space',
        vendorName: 'Heritage Botanical Pavilion',
        estimatedCost: Math.round(safeBudget * 0.35),
        status: 'booked',
        notes: 'Deposit paid. Tables and chiavari chairs included in contract.',
      },
      {
        id: 'w-vc-2',
        category: 'catering',
        title: 'Banquet & Beverage Service',
        vendorName: 'Artisan Kitchen & Cocktails',
        estimatedCost: Math.round(safeBudget * 0.28),
        status: 'in_inquiry',
        notes: 'Requested sample menus for gluten-free and vegan options.',
      },
      {
        id: 'w-vc-3',
        category: 'photography',
        title: 'Documentary Wedding Photographer',
        vendorName: 'Lumière Photo Studios',
        estimatedCost: Math.round(safeBudget * 0.12),
        status: 'booked',
        notes: 'Includes engagement shoot and digital high-res gallery delivery.',
      },
      {
        id: 'w-vc-4',
        category: 'decor',
        title: 'Floral Designer & Event Stylist',
        vendorName: 'Bloom & Petal Atelier',
        estimatedCost: Math.round(safeBudget * 0.10),
        status: 'in_inquiry',
        notes: 'Reviewing proposal for eucalyptus garlands and brass candelabras.',
      },
      {
        id: 'w-vc-5',
        category: 'entertainment',
        title: 'DJ & Master of Ceremonies',
        vendorName: 'Soul Groove Entertainment',
        estimatedCost: Math.round(safeBudget * 0.08),
        status: 'not_started',
        notes: 'Need to supply "Do Not Play" playlist by T-minus 3 weeks.',
      },
      {
        id: 'w-vc-6',
        category: 'logistics',
        title: 'Guest Transportation / Shuttle Service',
        vendorName: 'Metro Luxury Charters',
        estimatedCost: Math.round(safeBudget * 0.04),
        status: 'not_started',
        notes: 'Two 24-passenger shuttles between primary hotel and venue.',
      },
    ];
  }

  if (type === 'birthday') {
    return [
      {
        id: 'b-vc-1',
        category: 'venue',
        title: 'Rooftop Lounge or Loft Rental',
        vendorName: 'Skyline Terrace Loft',
        estimatedCost: Math.round(safeBudget * 0.30),
        status: 'booked',
        notes: 'Confirmed rental from 6 PM to midnight with city views.',
      },
      {
        id: 'b-vc-2',
        category: 'catering',
        title: 'Custom Birthday Cake & Dessert Bar',
        vendorName: 'Sweet Elegance Confections',
        estimatedCost: Math.round(safeBudget * 0.12),
        status: 'in_inquiry',
        notes: 'Salted caramel and dark chocolate raspberry layers.',
      },
      {
        id: 'b-vc-3',
        category: 'entertainment',
        title: 'Party DJ & Uplighting Tech',
        vendorName: 'Vibe Central Sound',
        estimatedCost: Math.round(safeBudget * 0.15),
        status: 'booked',
        notes: 'Includes wireless microphones and LED party spots.',
      },
      {
        id: 'b-vc-4',
        category: 'decor',
        title: 'Custom Balloon Installation & Neon Sign',
        vendorName: 'Pop & Glow Balloon Bar',
        estimatedCost: Math.round(safeBudget * 0.14),
        status: 'in_inquiry',
        notes: 'Golden chrome and blush matte balloons with custom neon message.',
      },
      {
        id: 'b-vc-5',
        category: 'photography',
        title: '360 Video Booth / Instant Print Station',
        vendorName: 'Flash Moments Photo Booth',
        estimatedCost: Math.round(safeBudget * 0.10),
        status: 'not_started',
        notes: 'Instant AirDrop and SMS sharing station for guests.',
      },
    ];
  }

  // Community Event
  return [
    {
      id: 'c-vc-1',
      category: 'permits',
      title: 'City Parks & Public Safety Permit',
      vendorName: 'City Parks and Recreation Bureau',
      estimatedCost: Math.round(safeBudget * 0.20),
      status: 'booked',
      notes: 'Permit #CP-2026-981 approved. Noise permit valid until 9:00 PM.',
    },
    {
      id: 'c-vc-2',
      category: 'logistics',
      title: 'Marquee Tents, Tables & Waste Stations',
      vendorName: 'Summit Canopy & Event Rentals',
      estimatedCost: Math.round(safeBudget * 0.25),
      status: 'in_inquiry',
      notes: 'Delivery scheduled morning of event at 7:30 AM.',
    },
    {
      id: 'c-vc-3',
      category: 'catering',
      title: 'Local Food Trucks & Beverage Carts',
      vendorName: 'Neighborhood Street Food Collective',
      estimatedCost: Math.round(safeBudget * 0.22),
      status: 'booked',
      notes: '3 food trucks confirmed (Tacos, Wood-Fired Pizza, Artisan Gelato).',
    },
    {
      id: 'c-vc-4',
      category: 'entertainment',
      title: 'Community Stage PA & Audio Engineer',
      vendorName: 'Civic Sound Productions',
      estimatedCost: Math.round(safeBudget * 0.15),
      status: 'in_inquiry',
      notes: 'Providing 4 mics, speakers, mixer, and sound technician.',
    },
    {
      id: 'c-vc-5',
      category: 'logistics',
      title: 'Sanitation & Portable Restroom Trailers',
      vendorName: 'EcoClean Mobile Restrooms',
      estimatedCost: Math.round(safeBudget * 0.10),
      status: 'not_started',
      notes: 'Requires 2 standard units and 1 ADA accessible trailer.',
    },
  ];
}

/**
 * Generates personalized, structured ideas tailored to event details.
 */
export function generatePersonalizedIdeas(
  type: EventType,
  guestCount: number,
  totalBudget: number,
  theme?: string
): PersonalizedIdea[] {
  const isBudgetSensitive = totalBudget < 5000;
  const isLargeGathering = guestCount > 100;
  const activeTheme = theme || (type === 'wedding' ? 'Timeless Elegance' : type === 'birthday' ? 'Golden Glow' : 'Civic Unity');

  if (type === 'wedding') {
    return [
      {
        id: 'w-idea-1',
        category: 'theme_decor',
        title: `Botanical Glow & Candlelit Ambiance (${activeTheme})`,
        description: isLargeGathering
          ? `For your gathering of ${guestCount} guests, elevate the ballroom with staggered pillar candles and lush seeded eucalyptus runners to create grand, warm visual continuity without overwhelming floral costs.`
          : `Infuse the intimate celebration with warm ivory pillar candles, lush seeded eucalyptus garlands, and gentle brass accents that elevate the room without requiring excessive floral budgets.`,
        estimatedImpact: 'High Impact',
        actionableImport: {
          type: 'budget',
          item: {
            name: 'Pillar Candle Collections & Glass Hurricanes',
            plannedAmount: Math.round(totalBudget * 0.03) || 180,
            category: 'decor',
            actualAmount: 0,
            notes: 'Wholesale ivory candles in staggered glass cylinders for warm glow',
          },
        },
      },
      {
        id: 'w-idea-2',
        category: 'budget_saving',
        title: isBudgetSensitive
          ? 'Curated Signature Cocktail Duo Instead of Full Open Bar'
          : 'Late Night Artisan Snack Station Over Lavish Favors',
        description: isBudgetSensitive
          ? 'Serving two custom bride & groom signature drinks alongside wine and beer slashes beverage costs by 35% while feeling exceptionally personal.'
          : 'Guests rarely keep traditional favors. Replace them with gourmet midnight sliders or warm cinnamon churro bites as the dance floor winds down.',
        estimatedImpact: 'Cost Saver',
        actionableImport: {
          type: 'vendor',
          item: {
            title: 'Late Night Gourmet Snack Service',
            vendorName: 'Midnight Cravings Cart',
            category: 'catering',
            estimatedCost: Math.round(totalBudget * 0.04) || 250,
            status: 'not_started',
            notes: 'Delicious warm comfort food passed out at 10:30 PM',
          },
        },
      },
      {
        id: 'w-idea-3',
        category: 'guest_experience',
        title: 'Audio Guestbook Vintage Telephone Station',
        description: `Set up a vintage rotary telephone where guests pick up the receiver, hear your greeting, and record heartfelt spontaneous voice messages all night.`,
        estimatedImpact: 'Crowd Pleaser',
        actionableImport: {
          type: 'timeline',
          item: {
            title: 'Setup Audio Guestbook & Signage',
            description: 'Place rotary phone recording station next to the welcome table with instructions.',
            category: 'execution',
            priority: 'medium',
          },
        },
      },
      {
        id: 'w-idea-4',
        category: 'entertainment',
        title: 'Acoustic Strings Ceremony into High-Energy Evening DJ',
        description: `A solo cellist or acoustic violin performing contemporary romantic covers during guest arrival creates breathtaking intimacy before transitioning to a vibrant reception party.`,
        estimatedImpact: 'High Impact',
        actionableImport: {
          type: 'budget',
          item: {
            name: 'Acoustic Ceremony Soloist',
            plannedAmount: Math.round(totalBudget * 0.05) || 350,
            category: 'entertainment',
            actualAmount: 0,
            notes: '30-minute prelude plus ceremony processional & recessional',
          },
        },
      },
      {
        id: 'w-idea-5',
        category: 'priorities',
        title: 'The 15-Minute Couple Golden Hour Respite',
        description: `Schedule a mandatory 15-minute sanctuary window with drinks and canapés right after the ceremony for the two of you to soak in the moment together before greeting guests.`,
        estimatedImpact: 'Essential',
        actionableImport: {
          type: 'timeline',
          item: {
            title: 'Post-Ceremony Private Couple Sanctuary',
            description: '15 uninterrupted minutes for the newlyweds with appetizers and champagne.',
            category: 'execution',
            priority: 'high',
          },
        },
      },
    ];
  }

  if (type === 'birthday') {
    return [
      {
        id: 'b-idea-1',
        category: 'theme_decor',
        title: `Neon Glow Statement & Organic Balloon Cloud (${activeTheme})`,
        description: `Anchor your photo area with a custom LED script neon sign nestled inside an asymmetric organic matte balloon cluster. It becomes the undisputed social media highlight.`,
        estimatedImpact: 'High Impact',
        actionableImport: {
          type: 'budget',
          item: {
            name: 'Rental Neon Script Sign & Stand',
            plannedAmount: Math.round(totalBudget * 0.08) || 120,
            category: 'decor',
            actualAmount: 0,
            notes: 'Warm white or golden script message with dimmer control',
          },
        },
      },
      {
        id: 'b-idea-2',
        category: 'entertainment',
        title: 'Live Interactive Roaming Magician or Mentalist',
        description: `Bring in a skilled close-up sleight-of-hand performer during the first hour to break the ice among different friend groups effortlessly.`,
        estimatedImpact: 'Crowd Pleaser',
        actionableImport: {
          type: 'vendor',
          item: {
            title: 'Close-up Magician / Icebreaker Entertainer',
            category: 'entertainment',
            estimatedCost: Math.round(totalBudget * 0.10) || 200,
            status: 'not_started',
            notes: '1-hour roving magic during welcome cocktails',
          },
        },
      },
      {
        id: 'b-idea-3',
        category: 'catering',
        title: 'Interactive DIY Dessert or Mocktail Bar',
        description: `A custom waffle sundae station, boba tea bar, or craft mocktail mixology station where guests create their own signature treats.`,
        estimatedImpact: 'Crowd Pleaser',
        actionableImport: {
          type: 'budget',
          item: {
            name: 'Interactive Gourmet Dessert Bar Supplies',
            plannedAmount: Math.round(totalBudget * 0.07) || 150,
            category: 'catering',
            actualAmount: 0,
            notes: 'Artisan toppings, cones, and decorative dispensers',
          },
        },
      },
      {
        id: 'b-idea-4',
        category: 'guest_experience',
        title: 'Polaroid Memory Guestbook with Sharpies',
        description: `Place two vintage instant cameras and metallic markers next to an adhesive black-page album so guests take self-portraits, stick them in, and write birthday wishes.`,
        estimatedImpact: 'Essential',
        actionableImport: {
          type: 'budget',
          item: {
            name: 'Instant Film Cartridges & Scrapbook Album',
            plannedAmount: Math.round(totalBudget * 0.05) || 85,
            category: 'misc',
            actualAmount: 0,
            notes: '100 sheets of instant film and metallic calligraphy pens',
          },
        },
      },
      {
        id: 'b-idea-5',
        category: 'budget_saving',
        title: 'Digital Collaborative Photo Album via QR Code',
        description: `Skip expensive photo booth printing rentals by displaying stylish table cards with a QR code connecting to a shared live cloud drive where everyone uploads phone clips.`,
        estimatedImpact: 'Cost Saver',
        actionableImport: {
          type: 'timeline',
          item: {
            title: 'Print Shared Photo QR Tent Cards',
            description: 'Generate link, design Canva table cards, and place on cocktail tables.',
            category: 'coordination',
            priority: 'medium',
          },
        },
      },
    ];
  }

  // Community Event Ideas
  return [
    {
      id: 'c-idea-1',
      category: 'guest_experience',
      title: 'All-Ages Interactive Passport & Stamp Adventure',
      description: `Give families a stamped passport card when they enter. Visiting different civic booths, children's games, and local art demos earns stamps toward a community raffle prize.`,
      estimatedImpact: 'Crowd Pleaser',
      actionableImport: {
        type: 'budget',
        item: {
          name: 'Passport Cards & Rubber Stamp Kit',
          plannedAmount: Math.round(totalBudget * 0.04) || 110,
          category: 'misc',
          actualAmount: 0,
          notes: 'Printed cards and 8 unique community station rubber stamps',
        },
      },
    },
    {
      id: 'c-idea-2',
      category: 'catering',
      title: 'Hydration Station & Reusable Cup Initiative',
      description: `Set up free fruit-infused chilled water dispensers (lemon-mint, cucumber) and encourage attendees to bring reusable vessels, reducing litter and keeping neighbors refreshed.`,
      estimatedImpact: 'Cost Saver',
      actionableImport: {
        type: 'vendor',
        item: {
          title: 'Civic Water Dispensers & Compostable Cups',
          category: 'catering',
          estimatedCost: Math.round(totalBudget * 0.06) || 140,
          status: 'not_started',
          notes: '5-gallon beverage coolers and eco-friendly compostable cups',
        },
      },
    },
    {
      id: 'c-idea-3',
      category: 'entertainment',
      title: 'Local Cultural Showcase & Open Mic Stage',
      description: `Invite neighborhood high school jazz bands, dance troupes, and local spoken-word artists to perform in 20-minute rotating segments, celebrating local heritage.`,
      estimatedImpact: 'High Impact',
      actionableImport: {
        type: 'timeline',
        item: {
          title: 'Schedule Cultural Showcase Performers',
          description: 'Confirm 6 local performance acts and audio tech requirements.',
          category: 'coordination',
          priority: 'high',
        },
      },
    },
    {
      id: 'c-idea-4',
      category: 'priorities',
      title: 'Clear Accessible Wayfinding & Shaded Seating Zones',
      description: `Ensure shaded tent pavilions and accessible paved paths for seniors, strollers, and wheelchair users, complete with high-contrast signage for restrooms and first aid.`,
      estimatedImpact: 'Essential',
      actionableImport: {
        type: 'budget',
        item: {
          name: 'High-Visibility Wayfinding Signage & Shade Canopies',
          plannedAmount: Math.round(totalBudget * 0.08) || 220,
          category: 'decor',
          actualAmount: 0,
          notes: 'Durable weather-resistant directional signs and pop-up shade tents',
        },
      },
    },
    {
      id: 'c-idea-5',
      category: 'theme_decor',
      title: `Collaborative Community Mural / Wish Tree (${activeTheme})`,
      description: `Erect a large freestanding canvas or ribbon tree where residents write their hopes for the neighborhood or paint a square, creating a keepsake for the community center.`,
      estimatedImpact: 'Crowd Pleaser',
      actionableImport: {
        type: 'budget',
        item: {
          name: 'Community Mural Canvas, Paints & Brushes',
          plannedAmount: Math.round(totalBudget * 0.05) || 130,
          category: 'decor',
          actualAmount: 0,
          notes: 'Non-toxic washable acrylic paints, brushes, and heavy-duty canvas',
        },
      },
    },
  ];
}

/**
 * Creates a complete initial event plan using deterministic planning rules.
 */
export function createInitialPlan(
  params: {
    name: string;
    type: EventType;
    date: string;
    guestCount: number;
    totalBudget: number;
    currency: Currency;
    location?: string;
    theme?: string;
    notes?: string;
  }
): EventPlan {
  const id = 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const budgetItems = generateBudgetItems(params.type, params.totalBudget);
  const timeline = generateTimelineMilestones(params.type, params.date);
  const vendorChecklist = generateVendorChecklist(params.type, params.totalBudget);
  const ideas = generatePersonalizedIdeas(
    params.type,
    params.guestCount,
    params.totalBudget,
    params.theme
  );

  return {
    id,
    name: params.name.trim(),
    type: params.type,
    date: params.date,
    guestCount: Math.max(1, Math.round(params.guestCount)),
    totalBudget: Math.max(0, Math.round(params.totalBudget)),
    currency: params.currency || 'USD',
    location: params.location?.trim() || undefined,
    theme: params.theme?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    budgetItems,
    timeline,
    vendorChecklist,
    ideas,
    aiProviderUsed: 'rule_based',
  };
}
