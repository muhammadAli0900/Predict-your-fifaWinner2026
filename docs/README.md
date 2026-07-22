# Handoff: PREDICT 26 — World Cup 2026 Bracket Predictor

## Overview
PREDICT 26 is an interactive fan web app that lets a user predict the entire 2026 FIFA World Cup
(Canada / Mexico / USA). The user enters a name, predicts the group stage one of two ways, selects
the 8 best third‑place "wildcard" teams, fills out the full knockout bracket
(Round of 32 → Round of 16 → Quarterfinals → Semifinals → Third‑Place Playoff → Final), and lands on
a results page with a gold/silver/bronze podium, the champion's road, and a shareable link that
re‑opens their exact predictions.

It uses the **real, official 2026 group draw** (locked Dec 5, 2025). The product name "PREDICT 26"
is original — it deliberately does **not** use FIFA's trademarked logos, wordmarks, or branding.

## About the Design Files
The files in this bundle are **design references created as HTML** — a working prototype that shows
the intended look, layout, data model, and behavior. They are **not** meant to be shipped as‑is.
The task is to **recreate this design in the target codebase's existing environment** (React, Vue,
Svelte, SwiftUI, native, etc.) using that project's established patterns, component library, routing,
and state conventions. If no environment exists yet, choose the most appropriate framework for the
project and implement the design there.

`Predict 26.dc.html` is authored as a "Design Component" — a single streaming HTML file driven by a
small runtime (`support.js`). All the product logic (data, standings math, bracket resolution, share
encoding) lives in a `class Component` block inside that file and is **directly portable** to a real
component — read it as the source of truth for behavior. The styling is all inline; the tokens are
extracted below.

To preview the prototype locally: serve the folder over any static server (e.g. `npx serve`) and open
`Predict 26.dc.html` — `support.js` must sit next to it. (Opening via `file://` may block the font
CDN and flag images.)

## Fidelity
**High‑fidelity (hifi).** Final colors, typography, spacing, copy, and interactions are all defined.
Recreate the UI to match, using the target codebase's libraries where equivalents exist (buttons,
cards, inputs). Exact hex values, fonts, and measurements are listed under **Design Tokens**.

---

## Brand & Visual System
- **Theme:** light, warm, premium. Cream background, white cards, champagne‑gold primary accent,
  near‑black ink. (Earlier dark concepts were rejected — keep it light.)
- **Fonts:** `Ubuntu` (700/500/400) for headings, numbers, team names, wordmark; `Roboto Condensed`
  (700/500/400) for body, labels, fixtures. Loaded from Google Fonts.
- **Accent usage:** gold `#C0892B` is the primary action/selection color. Secondary accents:
  green `#1F9E6E` (success/advance), blue `#2F6DF0` (info/3rd), bronze `#A9733C`, silver `#8A8170`.
  Dark ink panels `#1B1D24` are used for the champion hero and trophy box.
- **Eyebrow labels:** Roboto Condensed, uppercase, gold `#B08A3A`, letter‑spacing `.14em–.32em`.
- **Wordmark:** the text "PREDICT 26" with "26" rendered in gold. No logo image.

---

## Screens / Views

### 1. Welcome (`screen: 'welcome'`)
- **Purpose:** capture the user's name and choose a prediction approach.
- **Layout:** centered single column, max‑width ~980px, generous vertical padding (60px top).
  Text‑centered. Entrance animation `fadeUp` (opacity 0→1, translateY 10px→0, .5s ease).
- **Components:**
  - Eyebrow: `WORLD CUP 2026 · CANADA · MEXICO · USA` — Roboto Condensed 12px, .32em tracking, gold `#B08A3A`.
  - Hero wordmark: `PREDICT 26` — Ubuntu 700, 84px, line‑height .92, letter‑spacing −.02em; "26" in `#C0892B`.
  - Subtitle: "Call every match. Build your bracket. Crown your champion." — 20px, `#6A6256`.
  - Name input: pill, white, 1px `#E2D8C2` border, radius 14px, shadow `0 8px 24px rgba(0,0,0,.06)`;
    `👤` prefix; placeholder "Enter your name"; Ubuntu 500 16px. Bound to `nameInput`.
  - Two approach cards (flex row, gap 20px, each min 280 / max 360px, white, radius 18px, padding 28px,
    border `#E6DCC6`, shadow `0 10px 30px rgba(0,0,0,.05)`; hover: `translateY(-3px)` + border `#C0892B`):
    - **Match Predictor** — icon tile `#1F9E6E22`, ⚽; title Ubuntu 700 23px; body 15px `#6A6C74`;
      footer link "Pick this path →" in green `#0F7F63`. Copy: "Go game‑by‑game. Tap winners across all
      72 group matches and watch the tables build themselves."
    - **Group Standings** — icon tile `#2F6DF022`, 📊; footer link blue `#2F6DF0`. Copy: "Skip the
      details. Just rank each group 1st · 2nd · 3rd and jump straight to the knockouts."
  - Stat row: `48 teams · 12 groups · 32‑team knockout · 1 champion` (numbers Ubuntu, ink).
- **Behavior:** clicking either card calls `choose(approach)` → sets `name` (trimmed `nameInput`, or
  "Friend" if empty), sets `approach` to `'match'` or `'standings'`, navigates to `groups`.

### 2. Group Stage (`screen: 'groups'`)
Renders one of two modes based on `approach`. 12 group cards in a responsive grid
(`repeat(auto-fill, minmax(330px, 1fr))`, gap 16px). Header shows step eyebrow, a title, a subtitle,
a "⚡ Fill all by ranking" button, and a gated "Continue →" button.

- **Mode A — Match Predictor (`approach: 'match'`):**
  - Each group card lists its **6 round‑robin matches** (pairs `[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]`).
    Each match is a row: `[team A button] v [team B button]`. Tapping a team marks it the winner
    (gold fill `#C0892B`, white text); the other team dims to opacity .5.
  - Below the matches, a dashed "THROUGH" strip shows the live top‑3 (first two = qualifiers in ink,
    3rd = lighter) as flag + 3‑letter code.
  - Standings are computed from picks: win = 3 pts; order by points desc, ties broken by FIFA rank
    (lower rank number wins). Complete when all 6 picked.
- **Mode B — Group Standings (`approach: 'standings'`):**
  - Each group card shows 4 team rows. Tapping teams **in order** assigns positions 1→4 (badge colors:
    1 gold, 2 grey, 3 blue, 4 light). Tapping a ranked team removes it. Once 3 are ranked the 4th is
    auto‑assigned. Tags: 1 = WINNER, 2 = ADV (green), 3 = 3rd (blue), 4 = OUT.
- **Per‑card:** title "Group A" (Ubuntu 700 17px, nowrap), status pill ("In progress" / "✓ Done"),
  and a ⚡ icon to auto‑fill just that group by ranking.
- **Continue** is enabled only when all 12 groups are complete (`allComplete()`), then → `thirds`.

### 3. Wildcards / Third place (`screen: 'thirds'`)
- **Purpose:** choose the **8 best third‑place teams** (of 12) that advance, per the 48‑team format.
- **Layout:** intro copy, a count "`N / 8 selected`" (turns green at 8), an "⚡ Auto‑pick top 8"
  button, a gated "Build the bracket →" button, then a grid (`minmax(220px,1fr)`) of 12 toggle cards.
- **Card:** flag + team name + "3rd · Group X · FIFA #N"; a circular check on the right. Selected =
  white bg + 2px gold border + filled gold check; unselected = tinted bg + hollow check.
- **Behavior:** pre‑selected by best FIFA rank among the 12 thirds (`suggested()`); user can toggle up
  to 8. Continue enabled only at exactly 8 → `bracket`.

### 4. Knockout Bracket (`screen: 'bracket'`)
- **Purpose:** pick winners through every knockout round to a champion.
- **Layout:** a horizontally scrollable classic bracket inside a `#F6F1E6` rounded panel. Columns in
  order: **Round of 32 (16 matches) · Round of 16 (8) · Quarterfinals (4) · Semifinals (2) · Final (1)
  · Champion box.** A round‑label header row sits above, aligned to the columns. Min‑width ~1240px.
  - **Alignment technique (important):** every column is a fixed‑height flex column
    (`height: 1160px; justify-content: space-around`). With equal heights, `space-around` centers each
    round's cards exactly at the midpoint between its two feeder cards, so connectors line up perfectly.
  - **Connectors:** between rounds, a thin "gutter" column (28px wide) holds `feederMatches/2` cells,
    each `height = 1160 / feederMatches`, styled as a right‑facing bracket (`border-top/right/bottom`
    + right corner radii, color `#D8C79E`).
  - **Match card:** white, 1px `#E4DAC3`, radius 9px; two stacked team rows split by a 1px divider.
    A pickable team row is Ubuntu 500 13px; **picked = gold `#C0892B` fill + white**; the losing side
    dims to .5; empty/未decided slots show "·" / "—" in `#BCB29D`.
  - **Champion box:** dark `#1B1D24`, radius 14px, shows "CHAMPION", 🏆 (pop‑in animation), flag, name.
- **Third‑Place Playoff:** below the bracket, a centered card (max‑width 440px) titled
  "🥉 THIRD‑PLACE PLAYOFF". Its two rows are the **losing semifinalists** (SF‑0 loser, SF‑1 loser);
  tap to pick the bronze medalist. Caption: "The two beaten semifinalists meet for the bronze medal."
- **Tools:** "⚡ Simulate rest" (auto‑pick all remaining matches incl. 3rd place by FIFA rank),
  "Reset" (clears bracket), gated "See results →" (enabled once the Final has a winner).
- **Behavior:** picking a winner cascades — downstream picks that reference a team that is no longer a
  participant are cleared (`clean()`), so the bracket stays consistent when you change an earlier round.

### 5. Results (`screen: 'results'`)
- **Champion hero:** dark `#1B1D24` card, radial gold glow `radial-gradient(circle at 50% 0%,
  rgba(192,137,43,.35), transparent 60%)`. 🏆, eyebrow "YOUR PREDICTED CHAMPION", big flag, champion
  name (Ubuntu 700 44px), and the congrats line:
  **"Congrats {name}, you predicted {Champion} will beat {Finalist} in the final!"**
  Plus a "{Champion} DEF. {Finalist}" chip.
- **Share card:** "🔗 Copy share link" button → copies a URL with the full prediction encoded in the
  hash; button shows "✓ Link copied!" (green) for ~2.2s.
- **Final standings podium:** three pedestals — 2nd (silver, height 72px), 1st (gold, height 106px,
  with 👑 crown), 3rd (bronze, height 54px) — each with flag + name + number. If 3rd place isn't
  picked yet, a hint points back to the bracket.
- **Champion's road:** list of each round the champion won and the opponent they beat.
- **Your 12 group winners:** grid of group letter badge + flag + winner name.
- **Footer actions:** "← Edit bracket" and "Start a new prediction".
- **Shared view:** if opened from a share link, shows a banner "You're viewing {name}'s bracket
  prediction." with a "Make your own →" button; editing is effectively read‑only entry.

---

## Interactions & Behavior
- **Navigation:** a sticky top nav with a 5‑step stepper (Home, Group Stage, Wildcards, Bracket,
  Results). Steps are clickable only when accessible (Group Stage needs an approach; Wildcards/Bracket
  need all groups complete; Results needs a champion). Active step = dark pill + gold number.
- **Persistence:** all progress is saved to `localStorage['predict26']` on every change and restored on
  load. The stepper lets users jump back to completed steps.
- **Share / deep‑link:** `share()` base64‑encodes `{approach, name, matchPicks, ranks, thirds, bracket}`
  into `location.hash` as `#s=<base64>`. On load, if `#s=` is present, the app decodes it, enters
  `shared` mode, and shows that person's results read‑only.
- **Flags:** rendered as `<img>` from `https://flagcdn.com/w80/{iso2}.png` (srcset w160 @2x). On image
  error, each flag falls back to a dark chip with the 3‑letter code, so flags never appear broken.
  (Original spec wanted emoji flags, but those fail on some platforms — image + chip fallback replaced
  them. In the target codebase, prefer a local flag asset set or an equivalent flag component.)
- **Animations:** `fadeUp` (screen entrance, .4–.5s), `pop` (trophy/medals scale‑in, .5–.6s),
  hover lifts on cards, .15s color transitions on selectable rows.
- **Responsive:** grids use `auto-fill minmax(...)`. The bracket is intentionally horizontal‑scroll on
  narrow screens; the rest reflows to one column. (A dedicated mobile bracket is a known future task.)

## State Management
All state is local to one component (`class Component`). Keys:
- `screen`: `'welcome' | 'groups' | 'thirds' | 'bracket' | 'results'`
- `approach`: `'match' | 'standings' | null`
- `name` (string), `nameInput` (string, the live input)
- `matchPicks`: `{ "<group>-<matchIndex>": winnerName }` (Match Predictor mode)
- `ranks`: `{ <group>: [name, name, ...] }` ordered selections (Group Standings mode)
- `thirds`: `string[]` — the up‑to‑8 chosen third‑place team names; `thirdsTouched` (bool)
- `bracket`: `{ "<matchId>": winnerName }` where ids are `R32-0..15`, `R16-0..7`, `QF-0..3`,
  `SF-0..1`, `F-0`, `TP-0` (third‑place playoff)
- `shared` (bool), `copied` (bool, transient for the share button)

Key derived logic (all in the component, portable as‑is):
- `groupStandings(g)` → ordered teams + completeness, per approach.
- `results()` → `{ group: [1st,2nd,3rd,4th] }`.
- `suggested()` → best‑8 thirds by FIFA rank; `assignThirds()` → places the 8 thirds into R32 slots
  via backtracking that avoids same‑group collisions.
- `r32Teams()` → resolves the 16 R32 matchups from the fixed skeleton + standings + thirds.
- `teamsOf(id, bracket)` → the two participants of any match id (recursively from feeders; `TP-0` =
  the two semifinal losers). `pick(id, team)` then `clean()` to invalidate stale downstream picks.
- `champion()` = `bracket['F-0']`, `finalist()` = the Final's loser, `bronze()` = `bracket['TP-0']`.

### Bracket structure (must preserve)
- 48 teams → 12 groups → **top 2 of each group (24) + best 8 third‑place (8) = 32** into the Round of 32.
- Round of 32 skeleton (top→bottom), where `1X`=group X winner, `2X`=group X runner‑up, `T`=a wildcard:
  `[1H,T] [2C,2F] [1A,T] [1B,2E] [1I,T] [2G,2K] [1C,T] [1D,2A] [1L,T] [2B,2D] [1E,T] [1F,2J] [1J,T] [2H,2L] [1K,T] [1G,2I]`.
  This is hand‑verified so **no two same‑group teams meet before the quarterfinals**, and it honors
  FIFA's two‑pathway split: Spain (Group H) and Argentina (Group J) are in opposite halves, as are
  France (I) and England (L) — so those pairs can only meet in the Final, and all four only from the
  semifinals onward.
- Folding: `R16-k = winners of R32-2k & R32-2k+1`; `QF-k = winners of R16-2k & R16-2k+1`;
  `SF-k = winners of QF-2k & QF-2k+1`; `F-0 = winners of SF-0 & SF-1`; `TP-0 = losers of SF-0 & SF-1`.

---

## Design Tokens

### Colors
| Role | Hex |
|---|---|
| Page background (cream) | `#EFE8D9` |
| Surface white | `#FFFFFF` |
| Surface tint / panel | `#F6F1E6`, `#F9F5EC`, `#F4EEE1` |
| Ink / text primary | `#1B1D24` (also `#26282F`, `#2A2C33`) |
| Text muted | `#6A6256`, `#6A6C74`, `#8A8170`, `#9A9082`, `#A39A86`, `#B3A98F` |
| Gold (primary action / selected) | `#C0892B` |
| Gold dark / eyebrow | `#A9741D`, `#B08A3A` |
| Gold soft fills | `#FBF1D8`, `#F6E3B8` |
| Gold borders | `#E2C987`, `#DCC89A` |
| Hairlines / borders | `#E4DAC3`, `#E6DCC6`, `#E2D6BD`, `#ECE2CF`, `#EFE6D2` |
| Green (advance / success) | `#1F9E6E`, `#1F8A60`, `#0F7F63` |
| Blue (info / 3rd badge) | `#2F6DF0` |
| Coral / destructive | `#E0533D`, `#A85B4A` |
| Bronze (3rd) | `#A9733C`, fills `#EDDCC6` / borders `#DDC7A6` |
| Silver (2nd) | `#8A8170`, fills `#ECEBE6` / borders `#DDD8CC` |
| Dark panel (hero / trophy) | `#1B1D24` + glow `rgba(192,137,43,.35)` |

### Typography
- Families: `Ubuntu` (headings/numbers/teams), `Roboto Condensed` (body/labels).
- Hero wordmark: Ubuntu 700, 84px / lh .92 / −.02em.
- Section title: Ubuntu 700, 32px.
- Card title: Ubuntu 700, 17–23px.
- Body: Roboto Condensed 15–16px.
- Eyebrow/label: Roboto Condensed 11–12px, uppercase, tracking .14em–.32em.
- Bracket team row / pills: Ubuntu 500, 13px.

### Radius
- Pills / status: 20px. Cards: 12–22px. Buttons: 9–11px. Small chips/rows: 4–9px.

### Shadow
- Cards: `0 8px 24px rgba(0,0,0,.06)` → `0 14px 40px rgba(0,0,0,.08)`.
- Dark panels: `0 10px 30px rgba(0,0,0,.18)`. Match cards: `0 2px 6px rgba(0,0,0,.04)`.

### Spacing
- Page padding ~22px (mobile) to 40–60px (welcome). Grid gaps 10–20px. Card padding 16–28px.

---

## Data
All 48 teams come from the official 2026 draw and live in the component:
- `GROUPS`: `{ A:[...4 teams], ... L:[...] }` (Group A: Mexico, South Africa, South Korea, Czechia …
  through Group L: England, Croatia, Ghana, Panama).
- `TEAM`: `{ name: [emojiFlag, 'ABC' 3‑letter code, fifaRankNumber] }` — rank drives tiebreaks and the
  "by ranking" auto‑fill / suggested wildcards.
- `CODE2`: `{ name: 'iso2' }` — 2‑letter ISO code for the flag image URL (England `gb-eng`, Scotland
  `gb-sct`).

## Assets
- **Fonts:** Google Fonts — Ubuntu, Roboto Condensed.
- **Flags:** `flagcdn.com` PNGs by ISO‑2 code. In production, prefer a bundled flag set (e.g. an SVG
  flag package or your own assets) instead of a third‑party CDN; the `CODE2` map gives every code.
- **Icons:** plain emoji (⚽ 📊 🏆 👑 🥉 👤 ↺ ⚡ 🔗). Swap for the codebase's icon system if desired.
- No proprietary/branded imagery is used.

## Files
- `Predict 26.dc.html` — the full prototype: markup + the `class Component` logic (data, standings,
  bracket engine, share encoding). **Primary reference.**
- `support.js` — the small runtime that renders the Design Component (needed only to run the prototype
  locally; not part of the product logic to port).
- `Explore.dc.html` *(optional, not included by default)* — the earlier palette/homepage/bracket
  exploration page.
