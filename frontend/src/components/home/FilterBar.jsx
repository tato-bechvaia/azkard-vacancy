import { useState, useRef, useEffect, useCallback } from 'react';
import { REGIME_LABELS, CATEGORY_LABELS, EXP_LABELS, EXP_SHORT } from '../../utils/constants';

// ── Static option lists ─────────────────────────────────────────────────────

const REGIME_OPTIONS = [
  { value: 'REMOTE',    label: REGIME_LABELS.REMOTE },
  { value: 'HYBRID',    label: REGIME_LABELS.HYBRID },
  { value: 'FULL_TIME', label: REGIME_LABELS.FULL_TIME },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

const EXP_OPTIONS = [
  { value: 'NONE',          label: EXP_LABELS.NONE,          short: EXP_SHORT.NONE },
  { value: 'ONE_TO_THREE',  label: EXP_LABELS.ONE_TO_THREE,  short: EXP_SHORT.ONE_TO_THREE },
  { value: 'THREE_TO_FIVE', label: EXP_LABELS.THREE_TO_FIVE, short: EXP_SHORT.THREE_TO_FIVE },
  { value: 'FIVE_PLUS',     label: EXP_LABELS.FIVE_PLUS,     short: EXP_SHORT.FIVE_PLUS },
];

const SORT_OPTIONS = [
  { value: 'newest',      label: 'ახლები',             short: 'ახლები' },
  { value: 'salary_desc', label: 'ხელფასი (მაღლიდან)', short: 'ხელფ. ↓' },
  { value: 'salary_asc',  label: 'ხელფასი (დაბლიდან)', short: 'ხელფ. ↑' },
];

const STICKY_TOP = import.meta.env.VITE_SHOW_TEST_BANNER === 'true' ? 'top-[5.25rem]' : 'top-14';

// ── Shared hook: click-outside close ────────────────────────────────────────
// Menu is rendered INSIDE the wrapper (absolute, not portal) so the
// close handler only needs to check the single wrapper ref.

function useDropdown() {
  const [open, setOpen] = useState(false);
  const wrapRef         = useRef(null);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const toggle = useCallback(() => setOpen(o => !o), []);
  const close  = useCallback(() => setOpen(false), []);

  return { open, wrapRef, toggle, close };
}

// ── Shared dropdown menu wrapper ─────────────────────────────────────────────
// Absolutely positioned below the button, aligned left by default.
// overflow-visible on the FilterBar outer container lets this escape.

function DropMenu({ children }) {
  return (
    <div className='absolute top-full left-0 mt-1.5 z-[200] min-w-[190px] bg-surface-200 border border-border rounded-xl shadow-card-lg overflow-hidden animate-slide-up'>
      {children}
    </div>
  );
}

// ── Chip button ─────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={[
        'h-7 px-3 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors duration-150',
        active
          ? 'bg-brand-600 text-white'
          : 'bg-surface-200 text-text-secondary hover:bg-surface-300 hover:text-text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ── Generic single-select dropdown ──────────────────────────────────────────

function FilterDropdown({ label, value, options, onSelect }) {
  const { open, wrapRef, toggle, close } = useDropdown();

  const active   = !!value;
  const chosen   = options.find(o => o.value === value);
  const btnLabel = active ? (chosen?.short || chosen?.label) : label;

  return (
    <div ref={wrapRef} className='relative flex-shrink-0'>
      <button
        type='button'
        onClick={toggle}
        className={[
          'h-7 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150',
          active
            ? 'bg-brand-600 text-white'
            : 'bg-surface-200 text-text-secondary hover:bg-surface-300 hover:text-text-primary',
        ].join(' ')}
      >
        {btnLabel}
        <svg
          width='9' height='9' viewBox='0 0 24 24' fill='none'
          stroke='currentColor' strokeWidth='2.5' className='flex-shrink-0'
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points='6 9 12 15 18 9'/>
        </svg>
      </button>

      {open && (
        <DropMenu>
          {active && (
            <button
              type='button'
              onClick={() => { onSelect(''); close(); }}
              className='w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-surface-300 transition-colors border-b border-border-subtle'
            >
              — ყველა —
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              type='button'
              onClick={() => { onSelect(opt.value); close(); }}
              className={[
                'w-full text-left px-3 py-2 text-xs transition-colors',
                opt.value === value
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-text-secondary hover:bg-surface-300 hover:text-text-primary',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </DropMenu>
      )}
    </div>
  );
}

// ── Salary range dropdown ────────────────────────────────────────────────────

function SalaryDropdown({ salaryMin, salaryMax, setSalaryRange }) {
  const { open, wrapRef, toggle, close } = useDropdown();

  const [localMin, setLocalMin] = useState(salaryMin || '');
  const [localMax, setLocalMax] = useState(salaryMax || '');

  useEffect(() => { setLocalMin(salaryMin || ''); }, [salaryMin]);
  useEffect(() => { setLocalMax(salaryMax || ''); }, [salaryMax]);

  const apply = () => {
    setSalaryRange(localMin, localMax);
    close();
  };

  const clear = () => {
    setLocalMin(''); setLocalMax('');
    setSalaryRange('', '');
    close();
  };

  const active = !!(salaryMin || salaryMax);

  const btnLabel = active
    ? salaryMin && salaryMax
      ? `${Number(salaryMin).toLocaleString()}–${Number(salaryMax).toLocaleString()} ₾`
      : salaryMin
      ? `${Number(salaryMin).toLocaleString()}+ ₾`
      : `–${Number(salaryMax).toLocaleString()} ₾`
    : 'ხელფასი';

  return (
    <div ref={wrapRef} className='relative flex-shrink-0'>
      <button
        type='button'
        onClick={toggle}
        className={[
          'h-7 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150',
          active
            ? 'bg-brand-600 text-white'
            : 'bg-surface-200 text-text-secondary hover:bg-surface-300 hover:text-text-primary',
        ].join(' ')}
      >
        {btnLabel}
        <svg
          width='9' height='9' viewBox='0 0 24 24' fill='none'
          stroke='currentColor' strokeWidth='2.5' className='flex-shrink-0'
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points='6 9 12 15 18 9'/>
        </svg>
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1.5 z-[200] w-52 bg-surface-200 border border-border rounded-xl shadow-card-lg p-3 animate-slide-up'>
          <p className='text-[10px] text-text-muted uppercase tracking-wider mb-2.5'>ხელფასი (GEL)</p>
          <div className='flex gap-2 mb-3'>
            <input
              type='number'
              min='0'
              placeholder='მინ.'
              value={localMin}
              onChange={e => setLocalMin(e.target.value)}
              className='w-full h-8 px-2.5 rounded-lg bg-surface-300 text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-brand-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <input
              type='number'
              min='0'
              placeholder='მაქს.'
              value={localMax}
              onChange={e => setLocalMax(e.target.value)}
              className='w-full h-8 px-2.5 rounded-lg bg-surface-300 text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-brand-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>
          <div className='flex gap-2'>
            {active && (
              <button
                type='button'
                onClick={clear}
                className='flex-1 h-7 rounded-lg bg-surface-300 text-xs text-text-secondary hover:bg-surface-400 transition-colors'
              >
                გასუფთავება
              </button>
            )}
            <button
              type='button'
              onClick={apply}
              className='flex-1 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors'
            >
              გამოყენება
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile bottom sheet ──────────────────────────────────────────────────────

function FilterSheet({
  open, onClose,
  regimes, toggleRegime,
  category, setCategory,
  experience, setExperience,
  sort, setSort,
  salaryMin, salaryMax, setSalaryRange,
  resetFilters, activeCount,
}) {
  const [localMin, setLocalMin] = useState(salaryMin || '');
  const [localMax, setLocalMax] = useState(salaryMax || '');

  useEffect(() => { setLocalMin(salaryMin || ''); }, [salaryMin]);
  useEffect(() => { setLocalMax(salaryMax || ''); }, [salaryMax]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm' onClick={onClose} />
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-surface-100 border-t border-border rounded-t-2xl max-h-[82vh] flex flex-col animate-slide-up'>

        <div className='flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-subtle flex-shrink-0'>
          <h3 className='font-medium text-sm text-text-primary'>ფილტრი</h3>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-200 transition-colors'
          >
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
              <path d='M18 6 6 18M6 6l12 12'/>
            </svg>
          </button>
        </div>

        <div className='overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-6'>
          <div>
            <p className='text-xs text-text-muted uppercase tracking-wider mb-2.5'>ფორმატი</p>
            <div className='flex flex-wrap gap-2'>
              {REGIME_OPTIONS.map(opt => (
                <Chip key={opt.value} label={opt.label} active={regimes.includes(opt.value)} onClick={() => toggleRegime(opt.value)} />
              ))}
            </div>
          </div>

          <div>
            <p className='text-xs text-text-muted uppercase tracking-wider mb-2.5'>კატეგორია</p>
            <div className='flex flex-wrap gap-2'>
              {CATEGORY_OPTIONS.map(opt => (
                <Chip key={opt.value} label={opt.label} active={category === opt.value} onClick={() => setCategory(category === opt.value ? '' : opt.value)} />
              ))}
            </div>
          </div>

          <div>
            <p className='text-xs text-text-muted uppercase tracking-wider mb-2.5'>გამოცდილება</p>
            <div className='flex flex-wrap gap-2'>
              {EXP_OPTIONS.map(opt => (
                <Chip key={opt.value} label={opt.label} active={experience === opt.value} onClick={() => setExperience(experience === opt.value ? '' : opt.value)} />
              ))}
            </div>
          </div>

          <div>
            <p className='text-xs text-text-muted uppercase tracking-wider mb-2.5'>ხელფასი (GEL)</p>
            <div className='flex gap-2 mb-2'>
              <input
                type='number' min='0' placeholder='მინ.'
                value={localMin} onChange={e => setLocalMin(e.target.value)}
                className='w-full h-9 px-3 rounded-xl bg-surface-200 text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-brand-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
              <input
                type='number' min='0' placeholder='მაქს.'
                value={localMax} onChange={e => setLocalMax(e.target.value)}
                className='w-full h-9 px-3 rounded-xl bg-surface-200 text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-brand-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
              />
            </div>
            <button
              type='button'
              onClick={() => setSalaryRange(localMin, localMax)}
              className='h-8 px-4 rounded-xl bg-surface-200 text-xs text-text-secondary hover:bg-surface-300 transition-colors'
            >
              გამოყენება
            </button>
          </div>

          <div>
            <p className='text-xs text-text-muted uppercase tracking-wider mb-2.5'>სორტირება</p>
            <div className='flex flex-wrap gap-2'>
              {SORT_OPTIONS.map(opt => (
                <Chip key={opt.value} label={opt.label} active={sort === opt.value} onClick={() => setSort(opt.value)} />
              ))}
            </div>
          </div>
        </div>

        <div className='px-5 py-4 border-t border-border-subtle flex-shrink-0'>
          {activeCount > 0 ? (
            <button
              type='button'
              onClick={() => { resetFilters(); onClose(); }}
              className='w-full h-10 rounded-xl bg-surface-200 text-text-secondary text-sm font-medium hover:bg-surface-300 transition-colors'
            >
              ფილტრის გასუფთავება ({activeCount})
            </button>
          ) : (
            <button
              type='button'
              onClick={onClose}
              className='w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors'
            >
              შედეგების ნახვა
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main FilterBar ──────────────────────────────────────────────────────────

export default function FilterBar({
  regimes, toggleRegime,
  category, setCategory,
  experience, setExperience,
  sort, setSort,
  salaryMin, salaryMax, setSalaryRange,
  activeCount, resetFilters,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeChips = [
    ...regimes.map(r => ({ key: `regime-${r}`, label: REGIME_LABELS[r], onDismiss: () => toggleRegime(r) })),
    ...(category    ? [{ key: 'cat',  label: CATEGORY_LABELS[category],                          onDismiss: () => setCategory('') }]  : []),
    ...(experience  ? [{ key: 'exp',  label: EXP_SHORT[experience] || EXP_LABELS[experience],    onDismiss: () => setExperience('') }] : []),
    ...(sort !== 'newest' ? [{ key: 'sort', label: SORT_OPTIONS.find(o => o.value === sort)?.short || sort, onDismiss: () => setSort('newest') }] : []),
    ...(salaryMin || salaryMax
      ? [{
          key: 'sal',
          label: salaryMin && salaryMax
            ? `${Number(salaryMin).toLocaleString()}–${Number(salaryMax).toLocaleString()} ₾`
            : salaryMin ? `${Number(salaryMin).toLocaleString()}+ ₾` : `–${Number(salaryMax).toLocaleString()} ₾`,
          onDismiss: () => setSalaryRange('', ''),
        }]
      : []),
  ];

  return (
    <>
      {/* The sticky container must NOT have overflow: hidden so absolute dropdowns can escape */}
      <div className={`sticky ${STICKY_TOP} z-40 bg-surface/95 backdrop-blur-md border-b border-border-subtle`}>
        <div className='max-w-6xl mx-auto px-6'>

          {/* ── Desktop (md+) — no overflow-x-auto so absolute dropdowns are visible ── */}
          <div className='hidden md:flex items-center gap-2 py-2.5'>

            <div className='flex items-center gap-1.5 flex-shrink-0 pr-3 border-r border-border-subtle mr-1'>
              {REGIME_OPTIONS.map(opt => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={regimes.includes(opt.value)}
                  onClick={() => toggleRegime(opt.value)}
                />
              ))}
            </div>

            <FilterDropdown label='კატეგორია'   value={category}               options={CATEGORY_OPTIONS} onSelect={setCategory} />
            <FilterDropdown label='გამოცდილება' value={experience}              options={EXP_OPTIONS}      onSelect={setExperience} />
            <FilterDropdown label='სორტ.'       value={sort !== 'newest' ? sort : ''} options={SORT_OPTIONS} onSelect={v => setSort(v || 'newest')} />
            <SalaryDropdown
              salaryMin={salaryMin} salaryMax={salaryMax}
              setSalaryRange={setSalaryRange}
            />

            {activeCount > 0 && (
              <button
                type='button'
                onClick={resetFilters}
                className='ml-auto flex-shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium text-text-muted hover:text-danger hover:bg-danger-50 transition-all duration-150'
              >
                <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                  <path d='M18 6 6 18M6 6l12 12'/>
                </svg>
                გასუფთავება
                <span className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface-300 text-text-muted text-[9px] font-bold leading-none'>
                  {activeCount}
                </span>
              </button>
            )}
          </div>

          {/* ── Mobile (<md) ──────────────────────────────────────────── */}
          <div className='flex md:hidden items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide'>
            <button
              type='button'
              onClick={() => setSheetOpen(true)}
              className={[
                'h-7 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors',
                activeCount > 0 ? 'bg-brand-600 text-white' : 'bg-surface-200 text-text-secondary',
              ].join(' ')}
            >
              <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <line x1='3' y1='6'  x2='21' y2='6'/>
                <line x1='7' y1='12' x2='17' y2='12'/>
                <line x1='11' y1='18' x2='13' y2='18'/>
              </svg>
              ფილტრი
              {activeCount > 0 && (
                <span className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-[9px] font-bold leading-none'>
                  {activeCount}
                </span>
              )}
            </button>

            {activeChips.map(chip => (
              <button
                key={chip.key}
                type='button'
                onClick={chip.onDismiss}
                className='h-7 px-2.5 flex items-center gap-1.5 rounded-full text-xs font-medium flex-shrink-0 bg-brand-600/15 text-brand-400 border border-brand-400/20 transition-colors hover:bg-brand-600/25'
              >
                {chip.label}
                <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                  <path d='M18 6 6 18M6 6l12 12'/>
                </svg>
              </button>
            ))}
          </div>

        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        regimes={regimes} toggleRegime={toggleRegime}
        category={category} setCategory={setCategory}
        experience={experience} setExperience={setExperience}
        sort={sort} setSort={setSort}
        salaryMin={salaryMin} salaryMax={salaryMax}
        setSalaryRange={setSalaryRange}
        resetFilters={resetFilters}
        activeCount={activeCount}
      />
    </>
  );
}
