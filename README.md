# PREDICT 26 — FIFA World Cup 2026 Bracket Predictor

A fan web app for predicting the full 2026 FIFA World Cup bracket — from group stage all the way to the champion. Built with Next.js and Supabase, with real-time official results that lock in as matches are played.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Database-Supabase-green) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

**Live App: [predict-fifa26.vercel.app](https://predict-fifa26.vercel.app/)**

---

## What it does

Users enter their name, pick winners across all 72 group matches (or set group standings directly), select the 8 best third-place qualifiers, then fill out the full knockout bracket from Round of 32 to the Final. When done, they get a champion reveal screen with a shareable link that encodes their full prediction into the URL.

Two prediction modes:
- **Match Predictor** — pick winners match by match across all 12 groups
- **Group Standings** — tap teams into 1st to 4th place order directly

As real results come in, official match outcomes lock the relevant rows automatically and cascade through the bracket.

---

## User Flow

1. Enter name, choose prediction approach
2. Complete all 12 group stage cards
3. Select 8 best third-place teams (ranked by FIFA tiebreak criteria)
4. Fill the knockout bracket: R32 → R16 → QF → SF → Final
5. Champion reveal with shareable link, podium, and champion's road

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | Supabase (Postgres + Realtime) |
| **Edge Functions** | Supabase Edge Functions (Deno) |
| **Styling** | Tailwind CSS + custom CSS animations |
| **Flags** | country-flag-icons (SVG, all 48 teams) |
| **Fonts** | Ubuntu + Roboto Condensed |
| **Deployment** | Vercel |

---

## Bracket Engine

The core logic lives in `lib/bracketEngine.ts` — a set of pure functions that derive all bracket state from user picks and official results.

**groupStandings** — Computes ordered group standings from match picks. In match mode: 3pts/win, 1pt/draw, tiebroken by FIFA rank. In standings mode: uses the user's rank array directly. Official results override user picks per match.

**suggested** — Returns the best 8 third-place teams ranked by FIFA tiebreak criteria: Points → Goal Difference → Goals Scored → Fair Play (yellow + red cards) → FIFA rank. Uses live Supabase group stats when available, falls back to predicted points.

**assignThirds** — Places the 8 selected third-place teams into specific R32 slots using backtracking. Each slot has an allowlist of eligible groups. Falls back to sequential assignment if backtracking fails.

**cleanUserPicks** — Multi-pass cascade invalidation. Runs 6 passes over all bracket picks and removes any pick where that team is no longer a valid participant in that match. Keeps the bracket consistent when earlier picks change.

---

## Real-Time Data Pipeline

Three Supabase tables with Row Level Security:

- **official_results** — match results keyed by match ID (R32-8, QF-2, etc.). Realtime enabled — new results push to all connected clients instantly.
- **group_stats** — live points, goal difference, goals scored, and cards per team.
- **predictions** — full user prediction snapshot inserted once when the user reaches the Results screen.

A Supabase Edge Function (Deno) runs every 5 minutes via cron, fetches finished matches from football-data.org, normalizes team names, and upserts results and group stats. The app works fully offline using hardcoded baseline data — Supabase results override it as they arrive.

---

## Shareable Predictions

The full bracket prediction is encoded into a URL hash on the Results screen. Anyone opening the link sees the prediction read-only with a banner showing whose bracket it is. No login required.

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Main app (single client component)
│   ├── api/
│   │   ├── official-results/     # GET public, POST admin-protected
│   │   └── predictions/          # GET admin-only
│   └── admin-x7k/                # Admin panel (obfuscated path)
├── components/
│   ├── TopNav.tsx
│   ├── WelcomeScreen.tsx
│   ├── GroupStageScreen.tsx
│   ├── ThirdsScreen.tsx
│   ├── BracketScreen.tsx
│   ├── ResultsScreen.tsx
│   └── Flag.tsx
├── lib/
│   ├── bracketEngine.ts
│   ├── data.ts
│   ├── supabase.ts
│   └── types.ts
└── supabase/
    ├── schema.sql
    └── functions/sync-results/
```

---

## Run Locally

```bash
git clone https://github.com/muhammadAli0900/Predict-your-fifaWinner2026.git
cd Predict-your-fifaWinner2026
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FOOTBALL_DATA_API_KEY=your_api_key
```

```bash
npm run dev
```

---

## Future Plans

- Live scoring system for submitted predictions
- Leaderboard comparing predictions across users
- Push notifications when a predicted team gets eliminated

---

**Muhammad Ali** — BS Software Engineering, Sukkur IBA University  
[GitHub](https://github.com/muhammadAli0900)
