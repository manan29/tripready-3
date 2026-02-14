# TripReady v2 🧳✨

AI-Powered Family Travel Planning App

## What's New in v2

- 🤖 **AI Trip Creation** - Type naturally, AI creates your trip
- 🏠 **Redesigned Home** - AI search bar + feature highlights
- ✏️ **Checklist Edit/Delete** - Full control over all items
- 🎨 **Beautiful Trip Cards** - Gradient visuals based on destination

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth with Google OAuth
- **AI:** Anthropic Claude API
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/tripready.git
cd tripready
npm install
```

### 2. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-api-key  # Optional for AI features
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Vercel

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g., https://tripready.vercel.app) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (optional) |

## Project Structure

```
tripready/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Google OAuth login
│   ├── auth/
│   │   ├── callback/route.ts # Auth callback
│   │   └── signout/route.ts  # Sign out
│   ├── api/ai/route.ts       # AI trip parsing
│   └── trips/
│       ├── page.tsx          # Home (AI search + trips)
│       ├── new/page.tsx      # Manual trip creation
│       └── [tripId]/page.tsx # Trip detail
├── components/trips/
│   ├── AISearchBar.tsx       # AI search input
│   ├── TripPreview.tsx       # Preview modal
│   ├── TripCard.tsx          # Trip card with gradient
│   ├── TripTabs.tsx          # Navigation tabs
│   ├── ChecklistTab.tsx      # Checklist with edit/delete
│   ├── BudgetTab.tsx         # Expense tracking
│   ├── ActivitiesTab.tsx     # Activity planning
│   └── FlightsTab.tsx        # Flight information
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   └── utils.ts              # Helpers + trip visuals
└── middleware.ts             # Auth middleware
```

## AI Trip Creation

Users can type natural sentences like:
- "Thailand with 2 kids in March"
- "7 day Singapore trip, budget 1.5 lakhs"
- "Dubai family vacation for Christmas"

The AI extracts destination, dates, travelers, and budget automatically.

**Note:** AI features require an Anthropic API key. Without it, a fallback regex parser is used.

## License

MIT
