// ── Regime (work format) ────────────────────────────────────────────────────
export const REGIME_LABELS = {
  REMOTE:    'დისტანციური',
  HYBRID:    'ჰიბრიდული',
  FULL_TIME: 'ადგილზე',
};

export const REGIME_COLORS = {
  REMOTE:    { bg: 'bg-teal-500/10', text: 'text-teal-400',   dot: 'bg-teal-400',   border: 'border-teal-500/20' },
  HYBRID:    { bg: 'bg-blue-500/10', text: 'text-blue-400',   dot: 'bg-blue-400',   border: 'border-blue-500/20' },
  FULL_TIME: { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400', border: 'border-violet-500/20' },
};

// ── Experience ──────────────────────────────────────────────────────────────
export const EXP_LABELS = {
  NONE:           'გამოცდილება არ სჭირდება',
  ONE_TO_THREE:   '1–3 წელი',
  THREE_TO_FIVE:  '3–5 წელი',
  FIVE_PLUS:      '5+ წელი',
};

export const EXP_SHORT = {
  NONE:           'Junior',
  ONE_TO_THREE:   '1–3 წ.',
  THREE_TO_FIVE:  '3–5 წ.',
  FIVE_PLUS:      '5+ წ.',
};

// ── Categories ──────────────────────────────────────────────────────────────
export const CATEGORY_LABELS = {
  IT:          'IT',
  SALES:       'გაყიდვები',
  MARKETING:   'მარკეტინგი',
  FINANCE:     'ფინანსები',
  DESIGN:      'დიზაინი',
  MANAGEMENT:  'მენეჯმენტი',
  LOGISTICS:   'ლოჯისტიკა',
  HEALTHCARE:  'მედიცინა',
  EDUCATION:   'განათლება',
  HOSPITALITY: 'სტუმართმოყვარეობა',
  OTHER:       'სხვა',
};

// ── Application status ──────────────────────────────────────────────────────
export const STATUS_LABELS = {
  PENDING:     'განხილვის მოლოდინში',
  REVIEWING:   'განიხილება',
  SHORTLISTED: 'შორტლისტი',
  REJECTED:    'უარყოფილია',
  HIRED:       'აყვანილია',
};

export const STATUS_COLORS = {
  PENDING:     { bg: 'bg-warning-50',  text: 'text-warning-100', dot: 'bg-warning-100', border: 'border-warning-100/20' },
  REVIEWING:   { bg: 'bg-info-50',     text: 'text-info-100',    dot: 'bg-info-100',    border: 'border-info-100/20' },
  SHORTLISTED: { bg: 'bg-brand-600/10', text: 'text-brand-400',  dot: 'bg-brand-400',   border: 'border-brand-400/20' },
  REJECTED:    { bg: 'bg-danger-50',   text: 'text-danger-100',  dot: 'bg-danger-100',  border: 'border-danger-100/20' },
  HIRED:       { bg: 'bg-success-50',  text: 'text-success-100', dot: 'bg-success-100', border: 'border-success-100/20' },
};

// ── Date formatting ─────────────────────────────────────────────────────────
export function fmtDate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}

export function dateRangeLabel(startOrCreated, endOrExpiry) {
  const start = fmtDate(startOrCreated);
  const end   = fmtDate(endOrExpiry);
  if (!start || !end) return null;
  return `${start} – ${end}`;
}

export function isNew(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000;
}
