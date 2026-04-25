import { Link } from 'react-router-dom';
import { Card, Badge, Tag } from '../ui';
import CompanyAvatar from '../CompanyAvatar';
import { REGIME_LABELS, CATEGORY_LABELS, fmtDate, isNew } from '../../utils/constants';

const REGIME_TAG_VARIANT = {
  REMOTE:    'teal',
  HYBRID:    'blue',
  FULL_TIME: 'violet',
};

function SimilarJobCard({ job }) {
  const fresh  = isNew(job.createdAt);
  const posted = fmtDate(job.createdAt);

  return (
    <Link to={'/jobs/' + job.id} className='block no-underline text-inherit'>
      <Card
        variant='interactive'
        padding='md'
        className='group h-full flex flex-col min-w-[260px] sm:min-w-0'
      >
        <div className='flex items-center gap-2.5 mb-3'>
          <CompanyAvatar company={job.employer} size='sm' />
          <span className='text-xs text-text-muted truncate'>{job.employer?.companyName}</span>
        </div>

        <div className='flex items-start justify-between gap-2 mb-1.5'>
          <h3 className='font-medium text-sm text-text-primary group-hover:text-brand-400 transition-colors duration-150 leading-snug line-clamp-2'>
            {job.title}
            {fresh && <Badge variant='brand' size='sm' className='ml-2 align-middle'>ახალი</Badge>}
          </h3>
        </div>

        <p className='text-sm font-semibold text-text-primary mb-3'>
          {job.salary?.toLocaleString()} ₾
        </p>

        <div className='flex flex-wrap gap-1.5 mt-auto'>
          <Tag variant={REGIME_TAG_VARIANT[job.jobRegime] || 'default'} dot>
            {REGIME_LABELS[job.jobRegime]}
          </Tag>
          {job.category && job.category !== 'OTHER' && (
            <Tag variant='brand'>{CATEGORY_LABELS[job.category]}</Tag>
          )}
        </div>

        {posted && (
          <p className='text-xs text-text-muted mt-3'>{posted}</p>
        )}
      </Card>
    </Link>
  );
}

export default function SimilarJobs({ jobs }) {
  if (!jobs?.length) return null;

  const visible = jobs.slice(0, 3);

  return (
    <div className='mb-10'>
      <h2 className='font-display font-bold text-xl text-text-primary mb-5 pb-3 border-b border-border-subtle tracking-tight'>
        სხვა ვაკანსიები
      </h2>
      {/* Horizontal scroll on mobile, 3-col grid on desktop */}
      <div className='flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible'
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {visible.map(job => (
          <SimilarJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
