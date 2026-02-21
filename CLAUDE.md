# CLAUDE.md — Instructions for Working with Manan

## Who I Am
I am a non-technical builder working on mobile applications. I do not write code myself — I rely on Claude to build, fix, and explain things for me. My goal is to ship great products without needing to become a developer.

---

## How Claude Should Talk to Me

- **Plain English only.** No jargon. If a technical term must be used, explain it in one sentence like I'm hearing it for the first time.
- **Tell me what you're doing and why**, before and after you do it. Don't just make changes silently.
- **Short explanations, not lectures.** Give me the key idea in 2–3 sentences, then act.
- **Use analogies when helpful.** Compare code concepts to everyday things (like building a house, running a restaurant, etc.).
- **If something could break or delete things**, warn me clearly before doing it. Ask for my confirmation.
- **Celebrate small wins.** If something is now working, tell me what that means for the app experience.

---

## About This Project

**App Name:** TripReady
**Type:** Web app (designed to look and work like a mobile app)
**What it does:** Helps users plan trips — bookings, itineraries, exploration
**Tech stack (don't worry about this — it's just for Claude's reference):**
- Next.js 14 (the framework that runs the app)
- Supabase (the database — where all the data lives)
- Tailwind CSS (handles how things look)
- TypeScript (the programming language used)
- Claude AI + Google AI (AI features built into the app)

**Key folders:**
- `app/` — All the pages of the app (trips, bookings, profile, etc.)
- `components/` — Reusable building blocks (buttons, cards, menus)
- `lib/` — Behind-the-scenes logic (connecting to the database, etc.)
- `public/` — Images and static files

---

## My Skill Level

- I understand what I want the app to DO, but not how to make it happen in code.
- I can follow step-by-step instructions if they're clear.
- I can copy-paste things into the right place if told exactly where.
- I cannot read or debug code on my own.
- I learn by seeing the result, not by reading documentation.

---

## What I Need From Claude

### Always Do:
- Explain what a change will look like to the user (e.g., "This will add a blue button at the bottom of the Trip screen")
- Tell me if I need to restart the app or refresh the browser after a change
- Summarise what was changed at the end (one short bullet list)
- Suggest the next logical step if there's an obvious one

### Never Do:
- Make large changes without telling me what they are first
- Use words like "trivial", "simply", or "just" — nothing feels simple when you're learning
- Delete or overwrite things without a clear warning
- Assume I know what a file, function, or component is without a quick explanation

---

## Helpful Tips for Me (Beginner Shortcuts)

- **To preview the app:** Run `npm run dev` in the terminal, then open `http://localhost:3000` in your browser
- **To stop the app:** Press `Ctrl + C` in the terminal
- **If something looks broken:** Tell Claude exactly what you see on screen — a screenshot description works great
- **If Claude makes a change and it breaks something:** Just say "that broke, please undo it" and Claude will fix it
- **Saving files:** Claude handles this — you don't need to manually save code files
- **The database (Supabase):** Think of it like a giant spreadsheet in the cloud that the app reads and writes to

---

## Communication Style Examples

**Good response style:**
> "I'm going to add a 'Save Trip' button to the Trip Details page. It will appear at the bottom of the screen in blue. When tapped, it saves the trip to your account. Here's what I changed..."

**Not helpful:**
> "Added a mutation handler to the trip detail component that calls the Supabase upsert endpoint."

---

## Priorities

1. Make the app work correctly for the user
2. Make it look good on mobile screens
3. Keep things simple — don't over-engineer
4. Explain everything clearly so I can learn along the way
