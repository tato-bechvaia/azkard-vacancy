import { useNavigate } from 'react-router-dom';
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

export default function JobListCard({ job }) {
  const navigate = useNavigate();
  const expired = isExpired(job);
  const fresh   = isNew(job.createdAt);
  const posted  = fmtDate(job.createdAt);

  return (
    <Card
      variant={expired ? 'default' : 'interactive'}
      padding='md'
      onClick={() => !expired && navigate('/jobs/' + job.id)}
      className={expired ? 'opacity-50 cursor-not-allowed' : 'group'}
    >
      <div className='flex items-start gap-4'>
        <CompanyAvatar company={job.employer} size='md' />

        <div className='flex-1 min-w-0'>

          {/* Row 1: title + status badge + salary */}
          <div className='flex items-start justify-between gap-4 mb-1.5'>
            <div className='flex items-center gap-2 flex-wrap min-w-0'>
              <h3 className='font-medium text-md text-text-primary group-hover:text-brand-400 transition-colors duration-150 leading-snug'>
                {job.title}
              </h3>
              {expired ? (
                <Badge variant='danger' size='sm'>ვადა გასულია</Badge>
              ) : fresh ? (
                <Badge variant='brand' size='sm'>ახალი</Badge>
              ) : null}
            </div>
            <span className='flex-shrink-0 text-md font-semibold text-text-primary'>
              {job.salary.toLocaleString()} ₾
            </span>
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

          {/* Row 3: tags + views/applications */}
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
}
