# Azkard Component Library — Phase 1

All primitives live in `src/components/ui/`. Import via barrel:
```jsx
import { Button, Card, Badge, Input, Textarea, Select, Tabs, Tag, EmptyState, Spinner, Container, PageShell } from '../components/ui';
```

---

## Design Tokens (`tailwind.config.js`)

### Colors

| Token | Hex / Value | Purpose |
|-------|-------------|---------|
| `brand-50..900` | `#EEEDFE` → `#3A2282` | Full 10-step purple scale |
| `surface` (DEFAULT) | `#0A0A0F` | Page background (dark) |
| `surface-50` | `#14141B` | Card backgrounds |
| `surface-100` | `#1A1A24` | Input backgrounds, hover states |
| `surface-200` | `#22222E` | Elevated sections, secondary backgrounds |
| `surface-300` | `#2C2C3A` | Active states |
| `surface-400` | `#3A3A4A` | Pressed states |
| `surface-elevated` | `#1A1A24` | Cards that float above surface |
| `text-primary` | `#F0F0F2` | Main body text |
| `text-secondary` | `#A0A0B0` | Labels, secondary content |
| `text-muted` | `#606070` | Placeholders, disabled text |
| `border-subtle` | `rgba(255,255,255,0.06)` | Subtle dividers |
| `border` (DEFAULT) | `rgba(255,255,255,0.10)` | Standard borders |
| `border-strong` | `rgba(255,255,255,0.18)` | Hover borders, emphasis |
| `success-50..900` | `#0D2818` → `#D1FAE5` | Green status scale (DEFAULT: `#10B981`) |
| `warning-50..900` | `#2A1F0A` → `#FEF3C7` | Amber status scale (DEFAULT: `#F59E0B`) |
| `danger-50..900` | `#2A0F0F` → `#FEE2E2` | Red status scale (DEFAULT: `#EF4444`) |
| `info-50..900` | `#0A1A2A` → `#DBEAFE` | Blue status scale (DEFAULT: `#3B82F6`) |
| `premium` | `#F59E0B` | Premium/gold accents |

### Typography Scale

| Class | Size | Line Height | Use For |
|-------|------|-------------|---------|
| `text-xs` | 11px | 1.55 | Badges, metadata, timestamps |
| `text-sm` | 13px | 1.55 | Body text, inputs, descriptions |
| `text-base` | 14px | 1.6 | Default body, list items |
| `text-md` | 15px | 1.55 | Card titles, section labels |
| `text-lg` | 18px | 1.45 | Stat numbers, subheadings |
| `text-xl` | 22px | 1.35 | Section headings |
| `text-2xl` | 28px | 1.2 | Page headings |
| `text-3xl` | 36px | 1.15 | Hero subheadings |
| `text-4xl` | 44px | 1.1 | Hero headings |

All line heights are Georgian-script friendly (≥1.1 even for display sizes).

### Font Families

- `font-sans` → DM Sans (body)
- `font-display` → Syne (headings, prices, logo)

### Shadows

| Class | Use |
|-------|-----|
| `shadow-card` | Subtle card elevation |
| `shadow-card-md` | Hover cards, elevated panels |
| `shadow-card-lg` | Modals, popovers |
| `shadow-glow-brand` | Brand-colored glow effect |
| `shadow-glow-premium` | Premium/gold glow effect |

---

## Button

```jsx
import { Button } from '../components/ui';
```

### Variants

```jsx
<Button variant='primary'>Primary</Button>      // Purple filled
<Button variant='secondary'>Secondary</Button>   // Surface filled + border
<Button variant='ghost'>Ghost</Button>            // Transparent, hover fill
<Button variant='danger'>Danger</Button>          // Red outlined
<Button variant='link'>Link</Button>              // Text-only, underline hover
```

### Sizes

```jsx
<Button size='sm'>Small (h-8)</Button>
<Button size='md'>Medium (h-10)</Button>    // default
<Button size='lg'>Large (h-12)</Button>
```

### States

```jsx
<Button loading>Loading</Button>            // Shows spinner, disables
<Button disabled>Disabled</Button>          // 40% opacity, no interactions
```

### With Icons

```jsx
<Button leadingIcon={<SearchIcon />}>ძიება</Button>
<Button trailingIcon={<ArrowIcon />}>შემდეგი</Button>
<Button iconOnly size='sm'><BellIcon /></Button>
```

---

## Card

```jsx
import { Card } from '../components/ui';
```

### Variants

```jsx
<Card variant='default'>Default (surface-50 + subtle border)</Card>
<Card variant='elevated'>Elevated (shadow + stronger bg)</Card>
<Card variant='interactive'>Interactive (hover effect, cursor pointer)</Card>
<Card variant='premium'>Premium (gold glow border)</Card>
```

### Padding

```jsx
<Card padding='none'>No padding</Card>
<Card padding='sm'>16px padding</Card>
<Card padding='md'>20px padding</Card>     // default
<Card padding='lg'>24px padding</Card>
<Card padding='xl'>32px padding</Card>
```

---

## Badge

```jsx
import { Badge } from '../components/ui';
```

### Variants

```jsx
<Badge variant='default'>Default</Badge>
<Badge variant='success'>Success</Badge>
<Badge variant='warning'>Warning</Badge>
<Badge variant='danger'>Danger</Badge>
<Badge variant='info'>Info</Badge>
<Badge variant='brand'>Brand</Badge>
<Badge variant='premium'>Premium</Badge>
```

### With Dot

```jsx
<Badge variant='success' dot>აქტიური</Badge>
<Badge variant='warning' dot>მოლოდინში</Badge>
```

### Sizes

```jsx
<Badge size='sm'>Small (10px)</Badge>     // default
<Badge size='md'>Medium (11px)</Badge>
```

---

## Input / Textarea

```jsx
import { Input, Textarea } from '../components/ui';
```

### Input

```jsx
<Input label='ელ-ფოსტა' placeholder='you@example.com' />
<Input label='ძიება' leadingIcon={<SearchIcon />} placeholder='ვაკანსია...' />
<Input label='ფასი' trailingIcon={<span>₾</span>} />
<Input label='სახელი' error='სავალდებულო ველი' />
<Input label='სახელი' helperText='მინიმუმ 2 სიმბოლო' />
<Input disabled label='გათიშული' value='read-only' />
```

### Textarea

```jsx
<Textarea label='აღწერა' rows={4} placeholder='სამუშაოს აღწერა...' />
<Textarea label='აღწერა' error='ძალიან მოკლეა' />
```

---

## Select

```jsx
import { Select } from '../components/ui';
```

```jsx
<Select label='კატეგორია'>
  <option value='IT'>IT</option>
  <option value='DESIGN'>დიზაინი</option>
  <option value='MARKETING'>მარკეტინგი</option>
</Select>
<Select label='ფორმატი' error='აირჩიეთ ფორმატი' />
<Select disabled label='გათიშული' />
```

---

## Tabs

```jsx
import { Tabs } from '../components/ui';
```

### Pill Style (default)

```jsx
<Tabs
  variant='pill'
  activeKey='jobs'
  onChange={setActive}
  tabs={[
    { key: 'jobs',   label: 'ჩემი ვაკანსიები', count: 5 },
    { key: 'apps',   label: 'განმცხადებლები' },
    { key: 'stats',  label: 'ანალიტიკა' },
  ]}
/>
```

### Underline Style

```jsx
<Tabs
  variant='underline'
  activeKey='all'
  onChange={setActive}
  tabs={[
    { key: 'all',     label: 'ყველა' },
    { key: 'remote',  label: 'დისტანციური' },
    { key: 'hybrid',  label: 'ჰიბრიდული' },
    { key: 'onsite',  label: 'ადგილზე' },
  ]}
/>
```

**Note:** All labels use full Georgian words — no abbreviations.

---

## Tag / Chip

```jsx
import { Tag } from '../components/ui';
```

### Variants

```jsx
<Tag variant='default'>სხვა</Tag>
<Tag variant='brand'>IT</Tag>
<Tag variant='teal' dot>დისტანციური</Tag>
<Tag variant='blue' dot>ჰიბრიდული</Tag>
<Tag variant='violet' dot>ადგილზე</Tag>
<Tag variant='amber'>პრემიუმ</Tag>
<Tag variant='green'>სტაჟირება</Tag>
```

### Removable

```jsx
<Tag variant='brand' removable onRemove={() => {}}>IT</Tag>
```

---

## EmptyState

```jsx
import { EmptyState } from '../components/ui';
```

```jsx
<EmptyState
  icon={<BriefcaseIcon />}
  title='ვაკანსია ვერ მოიძებნა'
  description='სცადეთ ფილტრების შეცვლა'
  action={<Button variant='primary' size='sm'>ფილტრების გასუფთავება</Button>}
/>
```

---

## Spinner / LoadingScreen

```jsx
import { Spinner, LoadingScreen } from '../components/ui';
```

```jsx
<Spinner size='sm' />    // 14px
<Spinner size='md' />    // 16px (default)
<Spinner size='lg' />    // 24px

<LoadingScreen />                           // Full-page centered
<LoadingScreen text='ვაკანსია იტვირთება...' />  // Custom text
```

---

## Container

```jsx
import { Container } from '../components/ui';
```

```jsx
<Container size='sm'>768px max</Container>
<Container size='md'>896px max</Container>
<Container size='lg'>1024px max</Container>
<Container size='xl'>1152px max</Container>    // default
```

---

## PageShell

```jsx
import { PageShell } from '../components/ui';
```

```jsx
// Standard page with navbar
<PageShell>
  <Container>
    <h1>Page content</h1>
  </Container>
</PageShell>

// Without navbar (login/register pages)
<PageShell withNav={false}>
  <div>Full-page layout</div>
</PageShell>
```

`PageShell` applies:
- `min-h-screen bg-surface text-text-primary` (dark theme baseline)
- `pt-[5.25rem]` top padding when navbar is present (clears fixed nav)
- Renders `<Navbar />` which now respects `VITE_SHOW_TEST_BANNER`

---

## Shared Constants (`src/utils/constants.js`)

Previously duplicated across 5+ files, now centralized:

```jsx
import {
  REGIME_LABELS,      // { REMOTE: 'დისტანციური', ... }
  REGIME_COLORS,      // { REMOTE: { bg, text, dot, border }, ... }
  EXP_LABELS,         // { NONE: 'გამოცდილება არ სჭირდება', ... }
  EXP_SHORT,          // { NONE: 'Junior', ... }
  CATEGORY_LABELS,    // { IT: 'IT', SALES: 'გაყიდვები', ... }
  STATUS_LABELS,      // { PENDING: 'განხილვის მოლოდინში', ... }
  STATUS_COLORS,      // { PENDING: { bg, text, dot, border }, ... }
  fmtDate,            // (date) => '24 Apr' | null
  dateRangeLabel,     // (start, end) => '24 Apr – 24 May' | null
  isNew,              // (createdAt) => boolean (within 3 days)
} from '../utils/constants';
```

All labels use **full Georgian words** — no abbreviations like `დისტ.` or `ჰიბრ.`
