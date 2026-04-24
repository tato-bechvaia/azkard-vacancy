# Azkard UI/UX Redesign — Systematic Rework

You are redesigning Azkard, a Georgian job platform, as a senior product designer + frontend engineer. Stack: React + Vite + Tailwind CSS + React Router. Language: Georgian (primary) + English fallbacks. Target market: Tbilisi/Georgia job seekers and employers competing against hh.ge and jobs.ge.

## ⚠️ NON-NEGOTIABLE RULES

1. **Do NOT start writing code until Phase 0 is complete and I approve.**
2. **Work in phases. After each phase, stop and show me what changed. Wait for my approval before proceeding.**
3. **Do NOT create new design tokens without checking if equivalents exist.** Read `tailwind.config.js` and any existing theme files FIRST.
4. **Do NOT break existing functionality.** This is a redesign, not a rewrite. Preserve all routes, API calls, state management, and business logic.
5. **Every component change must be justified in writing** — what was wrong, what you're changing, and why.
6. **If you are uncertain about intent, ASK. Do not assume.**
7. **Use the existing component library.** If there's a `<Button>`, don't create `<PrimaryButton>`. Extend variants.
8. **Georgian text must remain in Georgian.** Do not translate to English. Do not "improve" copy unless I explicitly ask.

## CONTEXT: What's Broken (Audit Already Done)

The following issues have been identified and are confirmed. Do not re-debate them — fix them:

### Critical UX Failures
1. **Homepage has 7 horizontal carousels before a normal list** — users can't scan or filter. Must be restructured to "filters + list first, curated rows secondary."
2. **Category tabs use abbreviations** (დისტ., ჰიბრ., ადგ.) that are unreadable. Must be expanded to full labels.
3. **Dark-to-white context switching** on homepage (dark hero → white tab strip → dark cards) looks broken. Unify theming.
4. **Job detail page has no prominent "Apply" CTA.** The right sidebar shows employer-facing stats (views, applications, salary) which is wrong for candidates. Must add clear primary CTA for candidates.
5. **Premium vs. regular cards are too visually similar.** Premium needs stronger differentiation.
6. **Empty/test content** ("Just DevOps Engineer" as a full job description) — enforce minimum content structure in the UI (Requirements, Responsibilities, Benefits, Tech Stack sections).
7. **Employer dashboard analytics are placeholder numbers** — add simple 7-day trend visualization per job.

### Visual Polish Issues
- Inconsistent spacing across sections
- Premium badge treatment is weak (thin colored line on top)
- Yellow test banner must become toggleable (env flag)
- Missing loading states, empty states, and error states

## PHASED EXECUTION PLAN

### Phase 0: Audit (DO THIS FIRST — NO CODE)

Produce a written audit document at `docs/redesign-audit.md` covering:

1. **Current design system inventory:**
   - All color tokens in `tailwind.config.js`
   - All font sizes, weights, spacing scales
   - All existing reusable components (list paths)
   - Dark/light theme setup (how is it implemented?)
   
2. **Component dependency map:**
   - List every page component
   - For each page, list child components it uses
   - Flag components used in 3+ places (these are high-leverage to fix)

3. **Inconsistency report:**
   - Hardcoded colors not using tokens
   - Inline styles
   - Duplicate components doing similar things
   - Tailwind class patterns that should be extracted into components

4. **Proposed design token additions** (if any) — minimal. Justify each.

5. **Redesign execution order** — which components to touch in which order to minimize breakage.

**STOP. Show me this document. Wait for approval.**

### Phase 1: Design System Foundation

Only after Phase 0 approval:

1. Update/extend `tailwind.config.js` with any approved new tokens
2. Create/update base primitives: `<Button>`, `<Card>`, `<Badge>`, `<Tab>`, `<Input>`, `<Select>` — ensure variants exist for: primary, secondary, ghost, danger; sizes: sm, md, lg; states: default, hover, active, disabled, loading
3. Establish a single `<PageShell>` or layout component that controls theme consistency
4. Add `.env` flag for the test banner (e.g., `VITE_SHOW_TEST_BANNER=true`)

Output a Storybook-style markdown file at `docs/component-library.md` showing all primitive variants.

**STOP. Show me the component primitives rendered. Wait for approval.**

### Phase 2: Homepage Restructure

Restructure `/` to this information hierarchy:

```
[Header + Auth]
[Hero: "იპოვე შენი შემდეგი სამუშაო" + Search bar]
[Quick filters: სრული ვადით | ნახევარი | დისტანციური | ჰიბრიდული | ადგილზე]
[Category chips: IT | ფინანსები | მარკეტინგი | დიზაინი | მენეჯმენტი | ...] (FULL WORDS, NO ABBREVIATIONS)
[Premium row — max 4 cards, clearly differentiated]
[MAIN JOB LIST — vertical, scannable, with sidebar filters on desktop]
[Secondary sections (collapsed by default or moved below fold): სტუდენტებისთვის, სტაჟირება, Direct Connect]
[Footer]
```

Requirements:
- Dark theme, consistent throughout. No white section breaks.
- List view is the default. Carousels are secondary.
- Filters must be visible without scrolling on 1440px viewport.
- Mobile (<768px): filters collapse to a drawer/modal, list is full-width.

**STOP. Show me the new homepage. Wait for approval.**

### Phase 3: Job Detail Page Redesign

Restructure `/jobs/:id` to be candidate-focused:

```
[Breadcrumb: ← ყველა ვაკანსია]
[Header: Company logo + name | Job title | Location · Format · Experience]
[Primary CTA section — sticky on scroll]:
  - Big purple "განაცხადის გაგზავნა" button
  - Secondary: "შენახვა" (bookmark)
  - Tertiary: share links
[Salary + Key details chips]
[Full job description — structured sections]:
  - მოვალეობები (Responsibilities)
  - მოთხოვნები (Requirements)  
  - შეთავაზება / ბენეფიტები (Benefits)
  - ტექნოლოგიები (Tech stack — if applicable)
[About the company — collapsible]
[Related jobs — 3 cards max]
```

Remove employer-facing stats (views, applications count) from candidate view. Move these to a separate employer dashboard view.

Enforce content structure: if a job has no description, show a clean "აღწერა არ არის" empty state, not a ghost page.

**STOP. Show me. Wait for approval.**

### Phase 4: Employer Dashboard (Profile Page)

Improvements to `/profile`:
- Add a simple line chart showing last 7 days of views per active job (use Recharts, already a common dep)
- Show "Top performing job" card
- Make "+ ახალი ვაკანსია" button more prominent
- Add CTA to upgrade to Premium if user has 3+ standard posts
- Clean up the vacancy row layout — currently cramped

**STOP. Show me. Wait for approval.**

### Phase 5: Auth Pages Polish

Login and Register pages are already strong. Light touch only:
- Ensure consistent spacing with rest of app
- Add proper form validation states (error, success)
- Loading state on submit buttons
- Better error messaging for common cases (wrong password, email in use)

### Phase 6: Global Polish Pass

- Audit every page for loading/empty/error states — add what's missing
- Check all hover/focus states
- Verify WCAG AA contrast across all text (especially the white-on-dark areas)
- Add subtle micro-interactions (button press, card hover lift) — TASTEFUL, not animation-heavy
- Verify keyboard navigation works on all interactive elements
- Check mobile breakpoints at 380px, 768px, 1024px, 1440px

## DELIVERABLE AT EACH PHASE

For each phase, when you stop, provide:
1. **Summary** of what changed (bullet list of files touched)
2. **Before/after reasoning** for each significant change
3. **Screenshots or file paths** to review (I'll check manually)
4. **Open questions or decisions** that need my input
5. **Next phase preview** — what you plan to do next, so I can redirect if needed

## WHAT NOT TO DO

- Do not redesign the logo or brand colors. Purple (#6B46F0-ish) and dark navy stay.
- Do not add new features (chat, notifications system, etc.) unless fixing a broken one.
- Do not install new dependencies without asking. If you think you need one, propose it and explain why existing deps can't solve it.
- Do not write long comments explaining obvious code.
- Do not refactor backend/API code. Frontend only.
- Do not change Georgian copy. If you think copy is bad, flag it in a separate `docs/copy-suggestions.md` file, don't change it.
- Do not touch authentication logic, route guards, or state management structure.

## DESIGN PRINCIPLES TO FOLLOW

1. **Scannable > beautiful.** This is a job board. Users need to triage 20 listings in 30 seconds.
2. **Georgian-first.** Text sizes, line heights, and font weights must accommodate Georgian script (which has different optical weight than Latin).
3. **Dark theme primary.** Match the sophistication of fintech apps like Revolut, not the cluttered feel of jobs.ge.
4. **Employer trust matters.** Every pixel communicates "this is a professional platform worth 35₾ per post."
5. **Mobile parity.** Georgians browse jobs on phones. Mobile is not a secondary concern.
6. **Speed over animation.** No heavy animations, no loading spinners where skeletons work better.

## START NOW

Begin with Phase 0. Read the codebase. Produce the audit document. Do not write any component code yet.

When you're done with Phase 0, respond with:
1. The path to the audit document
2. A summary of the 3 most important findings
3. Your proposed execution order for Phases 2–6
4. Any questions you need answered before proceeding