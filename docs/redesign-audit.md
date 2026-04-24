# Azkard Frontend Redesign — Phase 0 Audit

> Generated 2026-04-24. Based on complete read of every source file in `frontend/src/`.

---

## 1. Design System Inventory

### 1.1 Color Tokens (`tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#EEEDFE` | Badges, hover backgrounds, light fills |
| `brand-100` | `#CECBF6` | Borders on brand elements |
| `brand-400` | `#9F8FEC` | Accent text, decorative |
| `brand-500` | `#8B7AE0` | Secondary brand |
| `brand-600` | `#6B46E0` | **Primary brand** — buttons, logos, CTAs |
| `brand-700` | `#5a38c4` | Hover state for brand-600 |
| `surface-50` | `#F8F7F4` | Page backgrounds |
| `surface-100` | `#F0EEE9` | Hover backgrounds, empty state fills |
| `surface-200` | `#E2DED6` | Borders on inputs/cards |
| `surface-300` | `#C8C4BC` | Heavier borders (unused in practice) |
| `ink-950` | `#0A0A0A` | (Defined but **never used** in components) |
| `ink-900` | `#111111` | (Defined but **never used** — body color is set via CSS) |
| `ink-700` | `#2C2C2C` | (Defined but **never used**) |
| `ink-500` | `#6B6B6B` | (Defined but **never used**) |
| `ink-300` | `#ADADAD` | (Defined but **never used**) |
| `ink-100` | `#E8E8E8` | (Defined but **never used**) |

**Key finding:** The entire `ink` color scale is defined but **never referenced** in any component. All text colors use Tailwind defaults (`text-gray-900`, `text-gray-500`, etc.) instead of the custom `ink` tokens. This is a major inconsistency — the design system has two competing neutral palettes.

### 1.2 Font Families

| Token | Fonts | Usage |
|-------|-------|-------|
| `font-sans` | `DM Sans, sans-serif` | Body text (also hardcoded in `index.css` via `* { font-family }`) |
| `font-display` | `Syne, sans-serif` | Headings, prices, logo |

Loaded via Google Fonts in `index.css`:
- `Syne`: weights 400, 500, 600, 700
- `DM Sans`: weights 300, 400, 500 (with italic for 300)

**Note:** The `* { font-family: 'DM Sans' }` in `index.css` is redundant with the Tailwind `font-sans` config and overrides Tailwind's font stack globally.

### 1.3 Font Sizes

No custom font size scale is defined. All sizes use arbitrary values:

| Common sizes used | Where |
|-------------------|-------|
| `text-[9.5px]` | Tag pills, meta dates |
| `text-[10px]` | Uppercase labels, tiny badges |
| `text-[10.5px]` | Tracking labels, sub-hints |
| `text-[11px]` | Company names in cards |
| `text-[11.5px]` | Filter buttons, tag pills in lists |
| `text-[12px]` | Secondary text, links |
| `text-[12.5px]` | Action buttons, tertiary text |
| `text-[13px]` | Body text, descriptions, input text |
| `text-[13.5px]` | Card titles, profile names |
| `text-[14px]` | Section headers |
| `text-[14.5px]` | Job titles in list view |
| `text-[15px]` | Carousel headings, premium prices |
| `text-[18px]` | Stat numbers |
| `text-[22px]` | Section headings (CompanyBoxes) |
| `text-[26px]` | Dashboard stats |
| `text-[1.6rem]` | Job detail title |
| `text-[1.75rem]` | Job detail salary |
| `text-[2.6rem]` | Hero heading |

**Finding:** There is no type scale. 18+ arbitrary sizes are used. This makes consistency impossible and every new component a guessing game.

### 1.4 Spacing

No custom spacing scale. Standard Tailwind spacing is used (`px-6`, `py-12`, `gap-3`, etc.). Key layout spacings:
- Max width container: `max-w-6xl` (1152px) for homepage/listings, `max-w-5xl` (1024px) for job detail/profile, `max-w-4xl` (896px) for company page, `max-w-3xl` (768px) for saved jobs
- Top padding for nav clearance: `pt-[5.25rem]` (84px = 28px banner + 56px nav)
- Consistent `px-6` horizontal padding on containers

### 1.5 Border Radius

No custom radius tokens. Uses Tailwind defaults:
- `rounded-lg` (8px) — buttons, inputs, small elements
- `rounded-xl` (12px) — cards, panels
- `rounded-2xl` (16px) — major containers, modals
- `rounded-full` — pills, badges, avatar fallbacks

### 1.6 Box Shadows

Custom shadows defined:
- `shadow-card`: `0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)`
- `shadow-card-md`: `0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)`
- `shadow-card-lg`: `0 8px 24px 0 rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)`

`shadow-card-lg` is defined but **never used**.

### 1.7 Dark/Light Theme Implementation

**There is no theme system.** The app is light-mode-only at the global level (`body { background-color: #F8F7F4 }`). Dark sections are achieved by:

1. Wrapping content in `bg-gray-950` containers (hero, premium section, company boxes)
2. Passing a `dark` boolean prop to `CarouselSection` which toggles class strings
3. Manually setting dark text colors in each dark-section component

This creates the **dark-to-white context switching** problem identified in the audit brief — the hero is dark, then the filter bar is white, then premium/carousels are dark again, then the job list is white.

There is no Tailwind `dark:` mode, no CSS custom properties for theme switching, and no theme context provider.

---

## 2. Component Inventory

### 2.1 Components (`src/components/`)

| Component | Type | What it does | Used in |
|-----------|------|-------------|---------|
| `Navbar.jsx` | Composite | Fixed top nav with logo, auth buttons, notifications, saved bookmark | Every page (6 pages) |
| `CarouselSection.jsx` | Composite | Horizontal card carousel with auto-scroll, arrows, dots | `JobsPage` (5 instances) |
| `PremiumCarousel.jsx` | Composite | Premium-specific carousel with amber accent, gradient cards | `JobsPage` (1 instance) |
| `CompanyAvatar.jsx` | Primitive | Avatar with image fallback to initials | `JobsPage`, `JobDetailPage`, `SavedJobsPage`, `ProfilePage`, `CarouselSection`, `PremiumCarousel` |
| `CompanyBoxes.jsx` | Composite | 3D flip-card grid for direct CV submission + modal | `JobsPage` (1 instance) |
| `Toast.jsx` | Primitive | Notification toast (bottom-right) | `App.jsx` (global) |
| `NotificationPanel.jsx` | Composite | Bell icon + dropdown notification list | `Navbar` |
| `AdminChatbot.jsx` | Composite | Floating AI chat widget (admin only) | `App.jsx` (conditional) |

### 2.2 Duplicated / Near-Duplicate Functionality

| Issue | Files |
|-------|-------|
| **Two carousel implementations** with nearly identical logic | `CarouselSection.jsx` and `PremiumCarousel.jsx` share the same `useVisibleCount` hook, auto-interval logic, dot indicators, arrow buttons. `PremiumCarousel` is a specialized version that could be a variant of `CarouselSection`. |
| **Two separate carousel card components** inside `JobDetailPage.jsx` | `CarouselCard` and `JobCarousel` are defined inline — they duplicate card rendering logic already in `CarouselSection`. |
| **`REGIME_LABELS` defined in 5 files** | `CarouselSection.jsx` (abbreviated), `PremiumCarousel.jsx` (full), `JobsPage.jsx` (full), `JobDetailPage.jsx` (full), `CompanyPage.jsx` (full). Different abbreviation conventions in each. |
| **`CATEGORY_LABELS` defined in 4 files** | `CarouselSection.jsx`, `JobsPage.jsx`, `JobDetailPage.jsx`, `CompanyPage.jsx`. Inconsistent — some use `სტუმართმ.` (abbreviated), others use `სტუმართმოყვარეობა` (full). |
| **`REGIME_TAG` color mapping defined in 3 files** | `CarouselSection.jsx`, `JobsPage.jsx`, `JobDetailPage.jsx`. Identical but copy-pasted. |
| **`fmtDate` / `fmtDayMonth` defined in 4 files** | Identical date formatter copy-pasted across `CarouselSection`, `PremiumCarousel`, `JobsPage`, `JobDetailPage`. |
| **No shared `<Button>` component** | Every button is hand-styled with Tailwind inline. At least 5 distinct button patterns (brand primary, ghost, danger, outline, icon-only) are used but none are extracted. |
| **No shared `<Input>` or `<Select>` component** | `ProfilePage` defines `INPUT`, `TEXTAREA`, `SELECT_CLS` as string constants — a sign these should be components. `LoginPage` and `RegisterPage` each inline their own input styles (slightly different from ProfilePage). |
| **No shared `<Card>` component** | Job cards in the list view, carousel cards, and premium cards all have different styling. |
| **No shared `<Badge>` / `<Tag>` component** | Tag pills (regime, category, experience) are inline-styled in every file with copy-pasted class strings. |

### 2.3 Missing Primitive Components

The following primitives should exist but don't:
- `Button` (with variants: primary, secondary, ghost, danger, icon)
- `Input` / `Textarea` / `Select`
- `Badge` / `Tag`
- `Card`
- `Modal` / `Dialog`
- `EmptyState`
- `LoadingSpinner` / `Skeleton`
- `PageShell` (layout wrapper with Navbar + max-width container)

---

## 3. Page Inventory

### 3.1 Routes

| Route | Page Component | Key Child Components |
|-------|---------------|---------------------|
| `/` | `JobsPage` | `Navbar`, `PremiumCarousel`, `CarouselSection` (x5), `CompanyBoxes`, `CompanyAvatar` |
| `/jobs` | `JobsPage` | (same as `/`) |
| `/jobs/:id` | `JobDetailPage` | `Navbar`, `CompanyAvatar`, inline `CarouselCard`, inline `JobCarousel` |
| `/login` | `LoginPage` | None (standalone split layout) |
| `/register` | `RegisterPage` | None (standalone split layout) |
| `/companies/:slug` | `CompanyPage` | `Navbar` |
| `/profile` | `ProfilePage` | `Navbar`, `CompanyAvatar` |
| `/saved` | `SavedJobsPage` | `Navbar`, `CompanyAvatar` |

### 3.2 Pages Needing Most Work (by redesign impact)

1. **`JobsPage`** — Homepage. 7 carousel sections + CompanyBoxes before the main list. Dark-to-white context switching. Abbreviated filter labels. This is the highest-impact page.

2. **`JobDetailPage`** — No prominent Apply CTA. Employer stats (views, applications) visible to candidates. No structured description sections. Inline carousel components that duplicate shared ones.

3. **`ProfilePage`** — Largest file (998 lines). Employer dashboard analytics are placeholder ("გრაფიკები მალე დაემატება"). No data visualization. Monolithic component that handles both EMPLOYER and CANDIDATE views with panel switching.

4. **`CompanyPage`** — Functional but minimal. Needs polish to match the rest of the redesign.

---

## 4. Inconsistency Report

### 4.1 Hardcoded Colors (not using design tokens)

While no `bg-[#hex]` arbitrary Tailwind values are used, there are **extensive hardcoded colors via inline `style={}` attributes**:

| File | Count of `style={}` | Examples |
|------|---------------------|----------|
| `CompanyBoxes.jsx` | 17 | `background: '#0e0e0e'`, `border: '1px solid rgba(255,255,255,0.08)'`, `color: '#e5e7eb'`, `color: '#888'`, `background: '#f4f3ef'`, `background: '#111'` |
| `AdminChatbot.jsx` | 6 | `height: '480px'`, animation delays |
| `PremiumCarousel.jsx` | 5 | Highlight color gradient, animation delays |
| `CarouselSection.jsx` | 3 | Transform, transition delays |
| `JobDetailPage.jsx` | 2 | Carousel scrollbar hiding |

**`CompanyBoxes.jsx` is the worst offender** — the entire 3D flip card is built with inline styles using hardcoded hex colors and `rgba()` values, bypassing the design system entirely.

### 4.2 Hardcoded Spacing

- `index.css`: `body { background-color: #F8F7F4 }` — should use `surface-50` token but can't since this is plain CSS (not Tailwind)
- `App.css`: `#root { max-width: 1280px; padding: 2rem }` — **this file is a Vite template leftover** and appears unused since the root element has no `text-align: center` behavior visible. Should be deleted.
- `CompanyBoxes.jsx`: `height: '168px'`, `padding: '18px 18px 16px'`, `width: '36px'`, etc. — all hardcoded pixel values in inline styles

### 4.3 Inline Styles

**33 total `style={}` usages** across 5 files. Most problematic:
- `CompanyBoxes.jsx`: 17 usages — entire flip card built in inline styles
- `AdminChatbot.jsx`: Fixed height `480px`, animation delays

### 4.4 Duplicate Styling Patterns

| Pattern | Files Affected | Count |
|---------|----------------|-------|
| Regime tag pill styling (`bg-teal-50 text-teal-700`, etc.) | 4 files | 4 |
| Loading spinner SVG | `JobsPage`, `JobDetailPage`, `CompanyPage`, `SavedJobsPage`, `ProfilePage` | 5 |
| Back button (`← ვაკანსიებზე დაბრუნება`) | `JobDetailPage`, `CompanyPage` | 2 |
| Empty state pattern | `JobsPage`, `SavedJobsPage`, `ProfilePage` (x4) | 6 |
| Date formatting function | `CarouselSection`, `PremiumCarousel`, `JobsPage`, `JobDetailPage`, `CompanyPage` | 5 |
| Input/textarea styling | `ProfilePage` (string constants), `LoginPage`, `RegisterPage`, `CompanyBoxes` | 4 |

### 4.5 Excessively Long Tailwind Strings

Many elements have 8+ classes that should be extracted. Worst examples:
- Filter bar buttons: 8 classes per button, repeated ~20 times in `JobsPage`
- Job list cards: 10+ classes per card container
- Navbar buttons: 8+ classes each

### 4.6 `App.css` Is a Dead File

`App.css` contains Vite boilerplate (`.logo`, `.read-the-docs`, `logo-spin` animation) that is **not imported by any component** (only `index.css` is imported in `main.jsx`). This file should be deleted.

---

## 5. Known UX Issues — Confirmation

### 5.1 Homepage has 7+ horizontal carousels crowding the main list

**Confirmed.** `JobsPage.jsx` lines 292–376. When no filters are active, the page renders:
1. `PremiumCarousel` (premium jobs)
2. `CarouselSection` — "დღევანდელი ვაკანსიები" (today's)
3. `CarouselSection` — "ტოპ ვაკანსიები" (top)
4. `CarouselSection` — "მაღალი ხელფასები" (top salaries)
5. `CarouselSection` — "სტუდენტებისთვის" (for students)
6. `CarouselSection` — "სტაჟირება" (internships)
7. `CompanyBoxes` (CV drop grid)

All before the vertical job list. The main list starts at line 379.

### 5.2 Category tabs use abbreviations

**Confirmed.** `JobsPage.jsx` line 216: `{ value: 'REMOTE', label: 'დისტ.' }`, `'ჰიბრ.'`, `'ადგ.'`. Also in `CarouselSection.jsx` line 10: `REGIME_LABELS = { REMOTE: 'დისტ.', HYBRID: 'ჰიბრ.', FULL_TIME: 'ადგ.' }`.

Notably, `PremiumCarousel.jsx` uses full labels (`'დისტანციური'`, `'ჰიბრიდული'`, `'ადგილზე'`) — proving the abbreviations are inconsistent even within the codebase.

### 5.3 Dark-to-white section transition looks broken

**Confirmed.** The page flow is:
1. `bg-gray-950` hero (dark)
2. `bg-white` sticky filter bar (white) — `JobsPage.jsx` line 208
3. `bg-gray-950` premium/carousel section (dark) — line 294
4. `bg-surface-50` job list (light warm) — line 379

This creates jarring jumps between dark and light.

### 5.4 Job detail page lacks prominent Apply CTA

**Confirmed.** `JobDetailPage.jsx` lines 295–432. The apply section is in a **268px-wide right sidebar** (`w-[268px]`), below:
1. Stats card (views / applications / salary) — lines 299–316
2. Save button — lines 319–331
3. Then finally the apply card — lines 334–382

The apply button is a standard `bg-brand-600` button inside a card, not visually prominent. It's not sticky.

### 5.5 Job detail page shows employer-facing stats on candidate view

**Confirmed.** `JobDetailPage.jsx` lines 299–316. The stats card showing `views`, `applications count`, and `salary` is rendered unconditionally — not gated by `user?.role === 'EMPLOYER'`. Candidates (and guests) see how many people viewed and applied.

### 5.6 Premium cards are too visually similar to regular cards

**Confirmed.** `PremiumCarousel.jsx` vs `CarouselSection.jsx`. The only visual differences are:
- A 2px amber stripe at the top (line 159)
- A subtle amber glow on hover (line 156)
- Slightly different background gradient (`from-gray-950 via-gray-900 to-gray-950` vs `bg-white/[0.04]`)
- A tiny `✦ Featured` badge (9.5px font, line 167)

At typical viewing distance, these cards look nearly identical to the dark-themed regular carousel cards.

### 5.7 Yellow test banner is hardcoded

**Confirmed.** `Navbar.jsx` line 11. The banner is unconditionally rendered with no env flag check. The text reads: "⚠️ საიტი ტესტირების რეჟიმშია — ყველა ვაკანსია ტესტურია და არ წარმოადგენს რეალურ განცხადებებს"

### 5.8 Employer dashboard has placeholder analytics with no visualization

**Confirmed.** `ProfilePage.jsx` lines 786–806. The analytics panel shows four stat cards with aggregate numbers, then a placeholder div: `<p>გრაფიკები მალე დაემატება</p>`. No charts, no trends, no Recharts or any visualization library.

---

## 6. Proposed Execution Order

### Phase 1: Design System Foundation

**Must happen first.** Without shared primitives and consistent tokens, every subsequent phase will introduce new inconsistencies.

1. Clean up `tailwind.config.js`:
   - Decide: use `ink-*` tokens OR Tailwind gray. Not both. (Recommend: drop `ink-*`, standardize on gray + brand + surface)
   - Define a type scale (limited set of font sizes)
2. Create shared primitives: `Button`, `Input`, `Badge`, `Card`, `EmptyState`, `LoadingSpinner`
3. Create `PageShell` layout component (handles Navbar + max-width + padding + nav clearance)
4. Extract constants: `REGIME_LABELS`, `CATEGORY_LABELS`, `EXP_LABELS`, `fmtDate` into a single `src/utils/constants.js`
5. Add `VITE_SHOW_TEST_BANNER` env flag
6. Delete `App.css` (dead code)

**Risk: Low.** This phase adds new files and modifies `tailwind.config.js` but doesn't change page structure.

### Phase 2: Homepage Restructure

Highest-impact visual change. Restructure the homepage information hierarchy:
- Move filters above carousels
- Reduce carousels to 1 premium row (max 4 cards) above the main list
- Move students/internships/CompanyBoxes below fold or into collapsible sections
- Unify dark theme — no white filter bar interruption
- Expand abbreviated labels to full Georgian words

**Risk: Medium.** This changes the homepage layout significantly. Must preserve all API calls and filter logic.

### Phase 3: Job Detail Page Redesign

- Add prominent sticky Apply CTA
- Remove employer stats from candidate view (gate by role)
- Add structured description sections (responsibilities, requirements, benefits)
- Replace inline carousel components with shared `CarouselSection`

**Risk: Low-Medium.** Mostly layout/template changes. The API data stays the same.

### Phase 4: Employer Dashboard

- Add simple trend visualization (line chart for views over 7 days)
- Requires `recharts` dependency (or lightweight alternative)
- Make "+ ახალი ვაკანსია" button more prominent
- Consider splitting the 998-line `ProfilePage` into sub-components

**Risk: Medium.** Needs a new dependency for charts. The monolithic `ProfilePage` is fragile — any split must be careful.

### Phase 5: Auth Pages Polish

- Light touch — pages are already well-designed
- Align input styles with new primitives
- Add loading/validation states
- Ensure consistent spacing with new `PageShell`

**Risk: Low.**

### Phase 6: Global Polish Pass

- Audit every page for loading/empty/error states
- Check contrast (WCAG AA)
- Verify mobile breakpoints
- Add hover/focus states
- Keyboard navigation

**Risk: Low.** Non-breaking improvements.

### Dependency Graph

```
Phase 1 (Foundation)
  ├── Phase 2 (Homepage) ← uses new primitives
  ├── Phase 3 (Job Detail) ← uses new primitives  
  ├── Phase 5 (Auth Polish) ← uses new Input/Button
  └── Phase 4 (Dashboard) ← needs Phase 1 + chart dep
         └── Phase 6 (Polish) ← after all pages are done
```

---

## 7. Questions for Me

1. **`ink-*` tokens:** The `ink` color scale is defined but never used anywhere. Should I delete it from `tailwind.config.js` and standardize on Tailwind's `gray-*`, or should I migrate existing `gray-*` usage to `ink-*`? (I recommend deleting `ink-*` — it adds confusion with no benefit since gray is already used everywhere.)

2. **Test banner:** Should the test banner be removed entirely, or kept behind a `VITE_SHOW_TEST_BANNER` env flag? (I recommend env flag so it can be re-enabled for staging.)

3. **`App.css`:** This is a Vite boilerplate file that appears completely unused. Can I delete it?

4. **Recharts dependency:** Phase 4 needs a charting library. Should I use `recharts` (popular, React-native), or would you prefer a lighter alternative like `chart.js` or even pure SVG?

5. **`CompanyBoxes` 3D flip card:** This component is entirely built with inline styles (17 instances). Should I keep the 3D flip effect and refactor it to use Tailwind/CSS, or simplify it to a standard hover card?

6. **Dark theme scope:** The redesign prompt says "Dark theme primary" and "No white section breaks." Should I make the entire app dark-themed (including job list, profile, etc.), or keep the current split where dark is only for hero/premium sections and the rest stays light?

7. **Feature branches:** Are there any in-progress feature branches I should be aware of? The git status only shows `main`.

8. **`CandidateDashboard.jsx` and `EmployerDashboard.jsx`:** These files exist in `src/pages/` but are **never imported or routed** in `App.jsx`. Are these deprecated/planned pages? Can they be ignored for this redesign?
