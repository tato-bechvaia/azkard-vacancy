import { Button } from '../ui';

function BookmarkIcon({ filled }) {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24'
      fill={filled ? 'currentColor' : 'none'} stroke='currentColor'
      strokeWidth='1.75' strokeLinecap='round'>
      <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor'
      strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
      <circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/>
      <line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/>
      <line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor'
      strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='20 6 9 17 4 12'/>
    </svg>
  );
}

export default function StickyApplyBar({ job, user, applied, isSaved, onApply, onSave, onShare }) {
  if (user?.role === 'EMPLOYER') return null;

  const barClasses = 'bg-surface-50/90 backdrop-blur-sm border border-border';

  const saveButtonClasses = isSaved
    ? 'bg-brand-600/15 text-brand-400 hover:bg-brand-600/25 border border-brand-400/20'
    : 'bg-surface-200 text-text-secondary hover:text-brand-400 hover:bg-brand-600/10 border border-border';

  return (
    <>
      {/* ── Desktop: sticky below hero ── */}
      <div className={`hidden md:flex items-center justify-between gap-4 rounded-2xl px-6 py-3.5 mb-3 sticky top-[5.5rem] z-10 ${barClasses}`}>
        <p className='text-sm font-medium text-text-secondary truncate max-w-[55%] select-none'>
          {job.title}
        </p>
        <div className='flex items-center gap-2 flex-shrink-0'>
          {/* Save button — stronger styling */}
          <button
            onClick={onSave}
            className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${saveButtonClasses}`}
            title={isSaved ? 'შენახულია' : 'შენახვა'}
          >
            <BookmarkIcon filled={isSaved} />
            <span className='text-[13px]'>{isSaved ? 'შენახულია' : 'შენახვა'}</span>
          </button>
          <Button
            variant='ghost'
            size='md'
            iconOnly
            onClick={onShare}
            className='text-text-muted hover:text-text-secondary'
            title='გაზიარება'
          >
            <ShareIcon />
          </Button>
          <Button
            variant={applied ? 'secondary' : 'primary'}
            size='md'
            disabled={applied}
            leadingIcon={applied ? <CheckIcon /> : null}
            onClick={onApply}
          >
            {applied ? 'განაცხადი გაგზავნილია' : 'განაცხადის გაგზავნა'}
          </Button>
        </div>
      </div>

      {/* ── Mobile: fixed bottom bar ── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-2.5 ${barClasses} border-x-0 border-b-0 rounded-none`}
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={onSave}
          className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-150 ${saveButtonClasses}`}
        >
          <BookmarkIcon filled={isSaved} />
        </button>
        <Button
          variant='ghost'
          size='md'
          iconOnly
          onClick={onShare}
          className='text-text-muted'
        >
          <ShareIcon />
        </Button>
        <Button
          variant={applied ? 'secondary' : 'primary'}
          size='md'
          disabled={applied}
          leadingIcon={applied ? <CheckIcon /> : null}
          onClick={onApply}
          className='flex-1'
        >
          {applied ? 'განაცხადი გაგზავნილია' : 'განაცხადის გაგზავნა'}
        </Button>
      </div>
    </>
  );
}
