import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useSavedJobs } from '../../store/SavedJobsContext';
import { Card, Badge, Tag } from '../ui';
import CompanyAvatar from '../CompanyAvatar';
import { REGIME_LABELS, EXP_LABELS, CATEGORY_LABELS, fmtDate, isNew } from '../../utils/constants';

const REGIME_TAG_VARIANT = {
  REMOTE:    'teal',
  HYBRID:    'blue',
  FULL_TIME: 'violet',
};

function isExpired(job) {
  const expiry = job.expiresAt
    ? new Date(job.expiresAt)
    : (() => { const d = new Date(job.createdAt); d.setDate(d.getDate() + 30); return d; })();
  return expiry < new Date();
}

function BookmarkButton({ jobId }) {
  const { user } = useAuth();
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(jobId);

  if (!user || user.role !== 'CANDIDATE') return null;

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(jobId); }}
      title={saved ? 'წაშლა შენახულებიდან' : 'შენახვა'}
      className={[
        'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150',
        saved
          ? 'text-brand-400 bg-brand-600/10 hover:bg-brand-600/20'
          : 'text-text-muted hover:text-brand-400 hover:bg-surface-200',
      ].join(' ')}
    >
      <svg width='15' height='15' viewBox='0 0 24 24'
        fill={saved ? 'currentColor' : 'none'} stroke='currentColor'
        strokeWidth='1.75' strokeLinecap='round'>
        <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
      </svg>
    </button>
  );
}

export default function JobListCard({ job }) {
  const navigate = useNavigate();
  const expired = isExpired(job);
  const fresh   = isNew(job.createdAt);
  const posted  = fmtDate(job.createdAt);

  const isPremiumPlus = job.pricingTier === 'PREMIUM_PLUS';
  const isPremium     = job.pricingTier === 'PREMIUM';

  const cardContent = (
    <Card
      variant={expired ? 'default' : 'interactive'}
      padding='md'
      className={[
        expired ? 'opacity-50 cursor-not-allowed' : 'group',
        isPremiumPlus ? 'border-brand-500/15 hover:border-brand-400/30' : '',
        isPremium ? 'border-amber-400/15 hover:border-amber-400/30' : '',
      ].join(' ')}
    >
      <div className='flex items-start gap-4'>
        <CompanyAvatar company={job.employer} size='md' />

        <div className='flex-1 min-w-0'>

          {/* Row 1: title + tier badge + salary + save */}
          <div className='flex items-start justify-between gap-3 mb-1.5'>
            <div className='flex items-center gap-2 flex-wrap min-w-0'>
              <h3 className='font-medium text-md text-text-primary group-hover:text-brand-400 transition-colors duration-150 leading-snug'>
                {job.title}
              </h3>
              {isPremiumPlus && (
                <span className='inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600/20 to-amber-500/20 text-brand-400 border border-brand-400/20 font-bold tracking-wide uppercase'>
                  <svg width='8' height='8' viewBox='0 0 24 24' fill='currentColor' className='text-amber-400'>
                    <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
                  </svg>
                  Premium+
                </span>
              )}
              {isPremium && (
                <span className='text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/20 font-bold tracking-wide uppercase'>
                  Premium
                </span>
              )}
              {expired ? (
                <Badge variant='danger' size='sm'>ვადა გასულია</Badge>
              ) : fresh ? (
                <Badge variant='brand' size='sm'>ახალი</Badge>
              ) : null}
            </div>
            <div className='flex items-center gap-2 flex-shrink-0'>
              <span className='text-md font-semibold text-text-primary'>
                {job.salary.toLocaleString()} ₾
              </span>
              <BookmarkButton jobId={job.id} />
            </div>
          </div>

          {/* Row 2: company · location · posted date */}
          <div className='flex items-center gap-1.5 text-sm text-text-muted mb-3 flex-wrap'>
            <span
              onClick={e => {
                e.stopPropagation();
                navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'));
              }}
              className='font-medium text-text-secondary hover:text-brand-400 cursor-pointer transition-colors duration-150'
            >
              {job.employer.companyName}
            </span>
            {job.location && (
              <>
                <span className='opacity-30'>·</span>
                <span>{job.location}</span>
              </>
            )}
            {posted && (
              <>
                <span className='opacity-30'>·</span>
                <span className={expired ? 'text-danger' : ''}>{posted}</span>
              </>
            )}
          </div>

          {/* Row 3: tags */}
          <div className='flex items-center gap-1.5 flex-wrap'>
            <Tag variant={REGIME_TAG_VARIANT[job.jobRegime] || 'default'} dot>
              {REGIME_LABELS[job.jobRegime]}
            </Tag>
            <Tag variant='default'>
              {EXP_LABELS[job.experience]}
            </Tag>
            {job.category && job.category !== 'OTHER' && (
              <Tag variant='brand'>
                {CATEGORY_LABELS[job.category]}
              </Tag>
            )}
            {job.isInternship && (
              <Tag variant='green'>სტაჟირება</Tag>
            )}
          </div>

        </div>
      </div>
    </Card>
  );

  if (expired) return cardContent;

  return (
    <Link to={'/jobs/' + job.id} className='block no-underline text-inherit'>
      {cardContent}
    </Link>
  );
}
