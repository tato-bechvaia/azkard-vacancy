import { useNavigate } from 'react-router-dom';
import { Card, Tag } from '../ui';
import CompanyAvatar from '../CompanyAvatar';
import { REGIME_LABELS, fmtDate } from '../../utils/constants';

const REGIME_TAG_VARIANT = {
  REMOTE:    'teal',
  HYBRID:    'blue',
  FULL_TIME: 'violet',
};

// ── Individual premium card ─────────────────────────────────────────────────

function PremiumCard({ job }) {
  const navigate  = useNavigate();
  const badgeLabel = job.premiumBadgeLabel || '✦ Featured';
  const posted     = fmtDate(job.createdAt);
  const expiry     = job.expiresAt ? fmtDate(job.expiresAt) : null;

  return (
    <Card
      variant='premium'
      padding='none'
      className='group cursor-pointer relative overflow-hidden'
      onClick={() => navigate('/jobs/' + job.id)}
    >
      {/* Amber top accent stripe */}
      <div
        className='absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-90 transition-opacity duration-300'
        style={{ background: job.highlightColor || 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
      />

      <div className='p-4'>
        {/* Row 1: badge + avatar */}
        <div className='flex items-start justify-between mb-3'>
          <span className='inline-flex items-center gap-1 text-[9.5px] px-1.5 py-0.5 rounded-full bg-premium-50 text-premium border border-premium/20 font-semibold tracking-wide'>
            {badgeLabel}
          </span>
          <CompanyAvatar company={job.employer} size='sm' />
        </div>

        {/* Title */}
        <h3 className='font-display font-semibold text-sm text-text-primary group-hover:text-premium transition-colors duration-200 leading-snug line-clamp-2 mb-1.5'>
          {job.title}
        </h3>

        {/* Company + location */}
        <p className='text-xs text-text-muted mb-3 truncate'>
          {job.employer.companyName}
          {job.location && <span className='opacity-60'> · {job.location}</span>}
        </p>

        {/* Tags */}
        <div className='flex items-center gap-1.5 flex-wrap mb-3'>
          <Tag variant={REGIME_TAG_VARIANT[job.jobRegime] || 'default'}>
            {REGIME_LABELS[job.jobRegime]}
          </Tag>
        </div>

        {/* Footer: salary + date */}
        <div className='flex items-end justify-between'>
          <div>
            <span className='font-display font-bold text-md text-text-primary'>
              {job.salary.toLocaleString()}
              <span className='text-premium ml-0.5 text-sm'>₾</span>
            </span>
            {posted && expiry && (
              <p className='text-[9.5px] text-text-muted mt-0.5'>{posted} – {expiry}</p>
            )}
          </div>
          <span className='flex items-center gap-1 text-[10px] text-text-muted group-hover:text-premium/60 transition-colors duration-200'>
            <span>იხილე</span>
            <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
              <path d='M5 12h14M12 5l7 7-7 7'/>
            </svg>
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Strip wrapper ───────────────────────────────────────────────────────────

export default function PremiumStrip({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  const displayJobs = jobs.slice(0, 4);

  return (
    <div className='border-b border-border-subtle'>
      <div className='max-w-6xl mx-auto px-6 py-5'>

        {/* Section label */}
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-premium text-xs leading-none select-none'>✦</span>
          <p className='text-xs text-text-muted uppercase tracking-widest font-medium'>
            რეკომენდირებული
          </p>
          <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-premium-50 text-premium border border-premium/20 font-semibold'>
            {displayJobs.length}
          </span>
        </div>

        {/*
          Mobile  (<sm):  horizontal scroll with fixed-width cards
          Tablet  (sm):   2-column grid
          Desktop (lg+):  4-column grid
        */}
        <div className='overflow-x-auto scrollbar-hide -mx-6 sm:overflow-visible sm:mx-0'>
          <div className='flex gap-3 px-6 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4'>
            {displayJobs.map(job => (
              <div key={job.id} className='flex-shrink-0 w-56 sm:flex-shrink sm:w-auto'>
                <PremiumCard job={job} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
