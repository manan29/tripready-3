# JourneyAI - Product Requirements Document v5.0

**Last Updated:** February 2026
**Product:** JourneyAI (formerly TripReady)
**Version:** 5.0 - Bento Design + Archive System
**Status:** Active Development

---

## 1. Product Vision

### Mission
Transform international family travel planning from stressful to seamless with AI-powered guidance at every stage.

### Value Proposition
**"Your AI Travel Concierge - From Planning to Memories"**

JourneyAI is an intelligent travel companion that adapts to your trip's lifecycle, providing the right tools and information exactly when you need them. Unlike generic travel apps, JourneyAI understands you're traveling with kids and provides family-specific guidance throughout your journey.

### Core Differentiation
1. **Stage-Aware Intelligence**: App automatically adapts based on trip timeline (Pre-trip → During-trip → Post-trip)
2. **Family-First Design**: Built specifically for Indian families with kids traveling internationally
3. **Timeline Workflow**: Visual progress tracking with smart step unlocking
4. **No Data Loss**: Archive system instead of permanent deletion
5. **Shareable Achievements**: Beautiful stats cards showcasing travel milestones

---

## 2. Target Audience

### Primary Persona: "Planning Parent"
- **Demographics**: Indian parents, 28-45 years old, urban metro cities
- **Family**: 1-2 kids (ages 0-12)
- **Income**: ₹15L+ household income
- **Travel**: 1-2 international trips per year
- **Tech**: Comfortable with mobile apps, uses WhatsApp daily

### User Pain Points
1. **Overwhelmed by Complexity**: Too many things to track (visas, packing, bookings)
2. **Family-Specific Needs**: Generic apps don't understand traveling with kids
3. **Timing Confusion**: Don't know when to book flights, get visas, pack
4. **Lost Information**: Accidentally delete trips, lose booking details
5. **No Record**: Can't easily share/remember travel achievements

### User Goals
1. Stay organized without stress
2. Don't forget critical items (kid medications, documents)
3. Know optimal timing for bookings
4. Share trip details with family easily
5. Preserve travel memories and stats

---

## 3. Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **State**: React Hooks (useState, useEffect)
- **PWA**: manifest.json, service workers

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (future for photos)
- **APIs**: Weather API, Currency API

### Infrastructure
- **Hosting**: Vercel
- **Domain**: journeyai.app
- **Analytics**: (Future: Posthog/Mixpanel)

---

## 4. Database Schema

### `trips` Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  num_adults INTEGER DEFAULT 2,
  num_kids INTEGER DEFAULT 0,
  kid_ages INTEGER[],
  cities TEXT[],

  -- Stage-based workflow data
  stage_data JSONB DEFAULT '{
    "pre_trip": {
      "completed_steps": []
    },
    "during_trip": {
      "expenses": [],
      "memories": []
    },
    "post_trip": {
      "rating": null
    }
  }'::jsonb,

  -- Archive instead of delete
  archived BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_archived ON trips(archived);
CREATE INDEX idx_trips_start_date ON trips(start_date);
```

### `stage_data` JSONB Structure
```typescript
interface StageData {
  pre_trip: {
    completed_steps: string[]
    flights_booked?: boolean
    hotels_booked?: boolean
    visa_status?: string
    packing_complete?: boolean
  }
  during_trip: {
    expenses: Array<{
      id: string
      amount: number
      category: string
      description: string
      date: string
    }>
    memories: Array<{
      id: string
      photo_url?: string
      caption?: string
      date: string
    }>
    places_visited?: string[]
  }
  post_trip: {
    rating: number | null
    total_spent?: number
  }
}
```

---

## 5. App Structure

### Navigation (Bottom Tab Bar)
1. **Home** - Create new trip, quick stats
2. **My Trips** - All trips (active + archived from settings)
3. **Explore** - Destination inspiration
4. **Profile** - Stats cards, settings, archived trips

### Trip Lifecycle (Auto-Detected)

#### Stage 1: Pre-Trip (Before start_date)
**Timeline Workflow** with 5 progressive steps:

```
Timeline View:
┌─────────────────────────────────────┐
│ Trip Preparation          3/5 Done  │
│ ════════════░░░░░                   │
│ 45 days until Dubai ✈️              │
├─────────────────────────────────────┤
│                                     │
│  ✓  1. Book Flights                │
│     └─ Completed                   │
│     │                               │
│  ✓  2. Reserve Hotels              │
│     └─ Completed                   │
│     │                               │
│  ●  3. Visa & Documents            │
│     └─ Current Step                │
│     │                               │
│  ⊗  4. Packing Lists               │
│     └─ Locked until step 3         │
│     │                               │
│  ⊗  5. Last Minute Prep            │
│     └─ Unlocks 7 days before       │
│                                     │
└─────────────────────────────────────┘
```

**Smart Features:**
- Peak season warnings
- Flight booking timing advice (60-90 days out)
- Progressive unlocking (complete previous steps first)
- Last-minute checklist unlocks 7 days before trip

#### Stage 2: During-Trip (Between start_date and end_date)
**Bento Grid** quick access tools:

```
┌──────────┬──────────┐
│ Weather  │ Currency │
│  26°C ☀️ │ ₹82.50   │
├──────────┴──────────┤
│ Upcoming Flight      │
│ Tomorrow 10:30 AM    │
├──────────────────────┤
│ Quick Expense        │
│ + Add Expense        │
└──────────────────────┘
```

**Features:**
- Live weather
- Currency converter
- Flight reminders
- Expense tracking
- Memory capture (photos + notes)

#### Stage 3: Post-Trip (After end_date)
**Memory & Reflection:**
- Star rating (1-5)
- Expense summary with breakdown
- Photo gallery
- **Shareable Stats Card** 📸
- Suggested next destinations

---

## 6. Feature Specifications

### F1: Smart Trip Creation
**Priority:** P0 (Critical)

**User Flow:**
1. Home → "Plan New Trip" button
2. Select destination from curated list (with emojis)
3. Enter dates (calendar picker)
4. Specify travelers (adults + kids with ages)
5. Auto-creates trip with appropriate stage

**Smart Defaults:**
- Suggests popular family destinations
- Pre-fills 2 adults if first trip
- Calculates air miles automatically

---

### F2: 3-Stage Trip System (Current Implementation)
**Priority:** P0 (Critical)

**Stage Detection:**
```typescript
function getTripStage(startDate: string, endDate: string): TripStage {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return 'pre-trip'
  if (now >= start && now <= end) return 'during-trip'
  return 'post-trip'
}
```

**Pre-Trip Workflow Steps:**

**Step 1: Book Flights**
- Search flights
- Compare prices
- Book direct
- Save confirmation

**Step 2: Reserve Hotels**
- Search hotels
- Read reviews
- Book rooms
- Save confirmation

**Step 3: Visa & Documents**
- Visa requirements checklist
- Document upload (future)
- Status tracking
- Reminder system

**Step 4: Packing Lists**
- Separate kids/adults lists
- Weather-based suggestions
- Custom items
- Checkbox tracking

**Step 5: Last-Minute Checklist**
- Forex/travel card ⚠️ Urgent
- Local SIM/roaming ⚠️ Urgent
- Offline maps
- Print confirmations
- Inform bank ⚠️ Urgent
- Web check-in
- Weigh luggage
- Charge devices

**Progressive Unlocking Logic:**
```typescript
function getStepStatus(stepId: string, completed: string[], daysUntil: number) {
  const stepIndex = STEPS.findIndex(s => s.id === stepId)
  const previousSteps = STEPS.slice(0, stepIndex)

  // Special case: Last-minute unlocks 7 days before
  if (stepId === 'last-minute' && daysUntil > 7) {
    return 'locked'
  }

  // Check if previous steps completed
  const allPreviousCompleted = previousSteps.every(s =>
    completed.includes(s.id)
  )

  if (completed.includes(stepId)) return 'completed'
  if (allPreviousCompleted) return 'in-progress'
  return 'locked'
}
```

---

### F3: Shareable Stats Cards
**Priority:** P1 (High)

**Trip Stats Card:**
- Destination with emoji
- Duration (days)
- Air miles (round-trip from India)
- Travelers count
- Places visited
- Rating (stars)
- Family badge (if kids)

**Profile Stats Cards:**

**"2026 Wrapped"** (Yearly):
- Total trips this year
- Total days traveled
- Air miles accumulated
- Unique cities & countries
- Country flags
- Most visited destination
- Longest trip
- Family adventures count
- Monthly timeline

**"All Time Stats"** (Overall):
- Lifetime trips
- Lifetime days
- Lifetime air miles
- Countries explored
- Cities visited
- Total places
- Top 3 destinations

**Technology:**
- Uses `html2canvas` to convert React → Image
- Web Share API for native sharing
- Fallback to download if sharing unavailable
- Purple-pink gradient design
- Branded footer: "journeyai.app"

**Air Miles Calculator:**
```typescript
// Round-trip distances from major Indian cities
const AIR_MILES_FROM_INDIA = {
  'dubai': 1700,
  'singapore': 2500,
  'thailand': 1800,
  'bali': 3500,
  'maldives': 1200,
  'japan': 4500,
  // ... 30+ destinations
}

// Auto-calculates round trip
calculateAirMiles(destination) // Returns miles * 2
```

---

### F4: Archive System (No Delete)
**Priority:** P1 (High)

**Philosophy:** Never permanently delete user data. Archive instead.

**Implementation:**
```typescript
// Trips page filters out archived
const { data } = await supabase
  .from('trips')
  .select('*')
  .eq('user_id', user.id)
  .is('archived', false) // Only show active trips

// Archive function (was delete)
async function archiveTrip(tripId: string) {
  await supabase
    .from('trips')
    .update({ archived: true })
    .eq('id', tripId)
}
```

**User Experience:**
- Trips page → 3-dot menu → "Archive Trip" (orange icon)
- Confirmation: "Archive this trip? You can restore it from Settings."
- Archived trips hidden from main view
- Settings → "Archived Trips" section
- Each archived trip shows "Restore" button
- One-click restore returns to active trips

**Benefits:**
- No accidental data loss
- Users can change their mind
- Historical data preserved for stats
- Cleaner main trips view

---

### F5: PWA (Progressive Web App)
**Priority:** P1 (High)

**Features:**
- Installable on home screen
- Splash screen with branding
- Offline-capable (future)
- Native feel

**manifest.json:**
```json
{
  "name": "JourneyAI",
  "short_name": "JourneyAI",
  "description": "Travel Stress-Free with Kids",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FBFBFE",
  "theme_color": "#9333EA",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

**Install Prompt:**
- Smart detection of installability
- Shows after 5 seconds on home page
- "Add to Home Screen" button
- Dismissible (remembers choice)
- Beautiful gradient card design

---

### F6: Multi-Language Support (Roadmap)
**Priority:** P2 (Future)

**Languages:**
- English (default)
- Hindi
- Kannada

**Integration:**
- Sarvam AI for translation
- Language selector in Profile
- Persists to localStorage
- Real-time translation (future)

---

## 7. Design System: Bento-Timeline

### Design Philosophy
**"Clean, Calm, and Family-Friendly"**

Move from glass-morphism to solid, accessible Bento-style cards with a focus on clarity and usability.

### Color Palette

**Backgrounds:**
```css
--bg-primary: #FBFBFE;      /* Soft off-white */
--bg-card: #FFFFFF;         /* Pure white cards */
```

**Brand (Purple Family):**
```css
--color-primary: #9333EA;       /* Main purple */
--color-primary-light: #A855F7; /* Light purple */
--color-primary-bg: #F3E8FF;    /* Purple background */
```

**Status Colors:**
```css
--color-success: #10B981;   /* Green - completed */
--color-warning: #F59E0B;   /* Amber - attention */
--color-error: #EF4444;     /* Red - urgent */
```

**Text Hierarchy:**
```css
--text-primary: #1E293B;    /* Headings, important text */
--text-secondary: #64748B;  /* Body text, labels */
--text-tertiary: #94A3B8;   /* Subtle text, disabled */
```

**Borders:**
```css
--border-light: #E2E8F0;    /* Card borders, dividers */
--timeline-line: #E2E8F0;   /* Timeline connectors */
```

### Shadows

**Cards:**
```css
--shadow-card: 0 4px 20px rgba(0, 0, 0, 0.05);
--shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.08);
```

**Elevation Levels:**
- Level 1: Bento cards (base shadow)
- Level 2: Hover state (enhanced shadow)
- Level 3: Modals/overlays (stronger shadow)

### Border Radius

```css
--radius-sm: 8px;   /* Small elements, badges */
--radius-md: 12px;  /* Buttons, inputs */
--radius-lg: 16px;  /* Small cards, sections */
--radius-xl: 20px;  /* Medium cards */
--radius-2xl: 24px; /* Large cards, modals */
```

**Usage:**
- Trip cards: 20px (xl)
- Section cards: 16px (lg)
- Buttons: 12px (md)
- Badges: 8px (sm)

### Typography

**Font Family:** Inter (system fallback)

**Scale:**
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
```

**Responsive:**
```tsx
// Mobile → Desktop progression
<h1 className="text-3xl md:text-4xl lg:text-5xl">
<p className="text-sm md:text-base">
```

### Components

#### BentoCard
```tsx
interface BentoCardProps {
  size?: 'small' | 'medium' | 'large'
  children: ReactNode
  onClick?: () => void
}

// Sizes map to padding
small: p-4 (16px)
medium: p-5 (20px)
large: p-6 (24px)
```

**Style:**
- Solid white background
- Soft shadow (4px/20px)
- 20px border radius
- Hover: enhanced shadow (8px/30px)
- Smooth transitions (300ms)

#### Timeline Component
```tsx
interface TimelineItem {
  id: string
  title: string
  description?: string
  status: 'completed' | 'current' | 'locked'
  icon?: ReactNode
  onClick?: () => void
}
```

**Visual Structure:**
```
┌─ Status Badge (left aligned)
│  ┌─ Connector Line (vertical)
│  │
●──┤  ┌─────────────────────┐
│  └──│ Content Card        │
│     │ • Title             │
│     │ • Description       │
│     │ • Icon (right)      │
│     └─────────────────────┘
│
✓──┤  ┌─────────────────────┐
│  └──│ Next Card           │
│     └─────────────────────┘
```

**Status Indicators:**
- **Completed** (✓): Green circle + green line
- **Current** (●): Purple ring + grey line
- **Locked** (🔒): Grey badge + grey line

#### StatusBadge
```tsx
interface StatusBadgeProps {
  status: 'completed' | 'current' | 'locked'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  label?: string
}
```

**Sizes:**
- sm: 24px (6x6)
- md: 32px (8x8)
- lg: 40px (10x10)

**Styles:**
- Completed: Green bg (#10B981) + white icon
- Current: White bg + purple border + purple icon
- Locked: Light grey bg (#E2E8F0) + grey icon

### Responsive Grid

**Breakpoints:**
```tsx
sm: 640px   // Tablets
md: 768px   // Small laptops
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
```

**Common Patterns:**
```tsx
// Trip cards grid
grid-cols-2 md:grid-cols-3 lg:grid-cols-4

// Stats cards
grid-cols-2 md:grid-cols-4

// Form layout
grid-cols-1 md:grid-cols-2
```

### Accessibility

**Color Contrast:**
- Text on white: Minimum 4.5:1 (WCAG AA)
- Primary text (#1E293B): 15.8:1 ✓
- Secondary text (#64748B): 7.2:1 ✓

**Touch Targets:**
- Minimum: 44x44px (iOS/Android standard)
- Buttons: 48px height minimum
- Icon buttons: 40x40px minimum

**Focus States:**
- Visible focus rings (purple)
- Keyboard navigation support
- Screen reader labels (future)

---

## 8. Success Metrics

### User Engagement
- **DAU/MAU Ratio:** Target 30%+ (trips are seasonal)
- **Trip Completion Rate:** 80%+ of created trips reach post-trip stage
- **Feature Usage:**
  - Pre-trip workflow: 70%+ complete all 5 steps
  - Stats card generation: 40%+ of completed trips
  - Archive/restore: <5% restore rate (should be rare)

### Product Quality
- **App Crash Rate:** <0.1%
- **Error Rate:** <1% of sessions
- **Load Time:** <2s initial load, <1s navigation
- **PWA Install Rate:** 15%+ of repeat users

### Business Metrics
- **User Retention:**
  - Day 1: 60%+
  - Day 7: 40%+
  - Day 30: 25%+
- **Trip Creation:** 2+ trips per user (lifetime)
- **Referral Rate:** 20%+ users share stats cards

### User Satisfaction
- **NPS Score:** 40+ (good)
- **App Store Rating:** 4.5+ stars
- **Support Tickets:** <2% of users
- **Feature Requests:** Track top 10 monthly

---

## 9. Roadmap

### Phase 1: Foundation (Completed ✓)
- [x] Basic trip creation
- [x] 3-stage trip system
- [x] Timeline workflow (5 steps)
- [x] Archive system
- [x] Bento design system
- [x] PWA support
- [x] Shareable stats cards

### Phase 2: Enhanced Experience (Q1 2026)
- [ ] Photo upload for memories
- [ ] Expense analytics (charts, insights)
- [ ] Destination guides (AI-generated)
- [ ] Flight price tracking
- [ ] Hotel booking integration
- [ ] Weather alerts (push notifications)

### Phase 3: Social & Sharing (Q2 2026)
- [ ] Trip sharing with family/friends
- [ ] Collaborative packing lists
- [ ] Trip comments and notes
- [ ] Travel community feed
- [ ] Public trip templates

### Phase 4: Intelligence (Q3 2026)
- [ ] AI itinerary generation
- [ ] Smart budget recommendations
- [ ] Personalized packing suggestions
- [ ] Optimal booking time predictions
- [ ] Destination matching (based on preferences)

### Phase 5: Monetization (Q4 2026)
- [ ] Premium features (unlimited trips)
- [ ] Travel insurance integration
- [ ] Affiliate partnerships (flights, hotels)
- [ ] Ad-free subscription
- [ ] Family plan (multiple users)

---

## 10. Technical Notes

### Performance Optimizations
- **Code Splitting:** Route-based with Next.js App Router
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Stats cards, modals
- **Caching:** Weather/currency API responses (15min TTL)
- **Database:** Indexes on user_id, archived, start_date

### Security
- **Row-Level Security (RLS):** Supabase policies
  ```sql
  CREATE POLICY "Users can only see own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);
  ```
- **Input Validation:** Zod schemas (future)
- **XSS Protection:** React auto-escaping
- **CSRF Protection:** Supabase built-in

### Error Handling
- **Defensive Coding:**
  - Null checks on all trip properties
  - Fallback values for undefined mappings
  - Try-catch on stage detection
  - Component existence checks
- **User-Friendly Messages:**
  - "Trip not found" instead of crashes
  - Loading states with spinners
  - Graceful API failure handling

### Browser Support
- **Modern Browsers:**
  - Chrome/Edge: Last 2 versions
  - Safari: Last 2 versions
  - Firefox: Last 2 versions
- **Mobile:**
  - iOS Safari: 14+
  - Chrome Android: Last 2 versions
- **PWA:**
  - Service Worker: Chrome, Edge, Safari 16.4+
  - Web Share API: Chrome, Safari, Edge

### Testing Strategy (Future)
- **Unit Tests:** Component logic (Jest + RTL)
- **Integration Tests:** User flows (Playwright)
- **E2E Tests:** Critical paths (Playwright)
- **Visual Regression:** Screenshots (Percy)
- **Performance:** Lighthouse CI (90+ score)

---

## 11. Changelog

### v5.0 (February 2026) - Bento Design + Archive
**Major Updates:**
- ✨ New Bento-Timeline design system (cleaner, accessible)
- ✨ Archive system replaces permanent delete
- 🎨 Updated color palette (#FBFBFE background, new text colors)
- 🎨 Timeline component with status badges
- 🐛 Fixed trip detail page crash with null checks
- 🐛 Fixed undefined .bg access errors
- 🐛 Fixed manifest.json syntax
- 📱 PWA colors updated to match new design

**Design Changes:**
- Cards: Solid white (removed glass/blur effect)
- Shadows: Softer (4px/20px → 8px/30px on hover)
- Radius: Standardized (20px cards, 16px sections)
- Text: New semantic scale (primary/secondary/tertiary)

**Technical:**
- Defensive coding: Comprehensive null checks
- Safe mapping access: Fallback values everywhere
- Better error messages: User-friendly states
- Database: Added `archived` boolean column + index

### v4.0 (February 2026) - Stats & Sharing
**Features:**
- ✨ Shareable stats cards (trip + profile)
- ✨ Air miles calculator (30+ destinations)
- ✨ "2026 Wrapped" yearly summary
- ✨ "All Time Stats" lifetime summary
- 📸 Image generation with html2canvas
- 📤 Social sharing with Web Share API

**Components:**
- `TripStatsCard.tsx` - Individual trip stats
- `ProfileStatsCard.tsx` - Yearly/overall stats
- `lib/air-miles.ts` - Distance calculations

### v3.0 (February 2026) - 3-Stage System
**Features:**
- ✨ 3-stage trip lifecycle (Pre/During/Post)
- ✨ Timeline workflow with 5 progressive steps
- ✨ Smart step unlocking based on completion
- ✨ Peak season warnings
- ✨ Flight booking timing advice
- ⏰ Last-minute checklist (unlocks 7 days before)

**Stage Views:**
- `PreTripView.tsx` - Timeline workflow
- `DuringTripView.tsx` - Quick access tools
- `PostTripView.tsx` - Memories & reflection

**Step Components:**
- `FlightsStep.tsx` - Flight booking
- `HotelsStep.tsx` - Hotel reservations
- `VisaDocsStep.tsx` - Visa requirements
- `PackingStep.tsx` - Separate kids/adults lists
- `LastMinuteStep.tsx` - Final checklist

### v2.0 (January 2026) - Responsiveness
**Updates:**
- 📱 Complete responsive design (mobile → 4K)
- 📱 Tailwind breakpoints (sm/md/lg/xl)
- 📱 Adaptive typography
- 📱 Mobile-first approach
- 🎨 Max-width containers (7xl)

### v1.0 (January 2026) - MVP Launch
**Core Features:**
- ✨ Trip creation
- ✨ Basic trip view
- ✨ Weather & currency display
- ✨ WhatsApp sharing
- ✨ Supabase backend
- 🔐 User authentication

---

## 12. Appendix

### Glossary
- **Bento:** Design pattern with card-based layouts (inspired by Japanese bento boxes)
- **Timeline:** Vertical visual progress indicator with connector lines
- **Stage-Aware:** App automatically adapts based on trip dates
- **Progressive Unlocking:** Features/steps unlock based on prerequisites
- **RLS:** Row-Level Security (Supabase database policies)
- **PWA:** Progressive Web App (installable, offline-capable)

### Key Files Structure
```
tripready-v2/
├── app/
│   ├── page.tsx                    # Home (trip creation)
│   ├── trips/
│   │   ├── page.tsx               # My Trips list
│   │   └── [tripId]/page.tsx      # Trip detail (3-stage view)
│   ├── profile/page.tsx            # Profile + stats cards
│   └── settings/page.tsx           # Settings + archived trips
├── components/
│   ├── ui/
│   │   ├── BentoCard.tsx          # White cards
│   │   ├── Timeline.tsx           # Workflow timeline
│   │   └── StatusBadge.tsx        # Status indicators
│   ├── trips/stages/
│   │   ├── PreTripView.tsx        # Timeline workflow
│   │   ├── DuringTripView.tsx     # Quick tools
│   │   └── PostTripView.tsx       # Memories + stats
│   └── stats/
│       ├── TripStatsCard.tsx      # Trip stats
│       └── ProfileStatsCard.tsx   # Profile stats
├── lib/
│   ├── trip-stages.ts             # Stage detection logic
│   └── air-miles.ts               # Distance calculations
├── public/
│   ├── manifest.json              # PWA config
│   └── icons/                     # App icons
└── docs/
    └── JourneyAI-PRD-v5.0.md     # This document
```

### Contact & Resources
- **Product Lead:** [Your Name]
- **Design System:** Figma (future)
- **Repository:** github.com/manan29/tripready-3
- **Staging:** journeyai.app
- **Slack:** #journeyai-product

---

**Document Version:** 5.0
**Next Review:** March 2026
**Status:** Active Development

*This PRD is a living document and will be updated as the product evolves.*
