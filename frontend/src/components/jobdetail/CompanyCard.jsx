import { useNavigate } from 'react-router-dom';
import { Card } from '../ui';
import CompanyAvatar from '../CompanyAvatar';

export default function CompanyCard({ employer }) {
  const navigate = useNavigate();
  if (!employer) return null;

  const slug = employer.companyName.toLowerCase().replace(/ /g, '-');

  return (
    <div className='mb-10'>
      <h2 className='font-display font-semibold text-lg text-text-primary mb-4 pb-3 border-b border-border-subtle tracking-tight'>
        კომპანიის შესახებ
      </h2>
      <Card variant='elevated' padding='lg'>
        <div className='flex items-start gap-4'>
          <CompanyAvatar company={employer} size='lg' />
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <p
                  className='font-semibold text-md text-text-primary hover:text-brand-400 cursor-pointer transition-colors duration-150 leading-tight'
                  onClick={() => navigate('/companies/' + slug)}
                >
                  {employer.companyName}
                </p>
                {employer.website && (
                  <a
                    href={employer.website}
                    target='_blank'
                    rel='noreferrer'
                    className='text-xs text-brand-400 hover:text-brand-300 hover:underline transition-colors duration-150 mt-0.5 block truncate'
                    onClick={e => e.stopPropagation()}
                  >
                    {employer.website}
                  </a>
                )}
              </div>
              {employer.jobCount > 1 && (
                <button
                  onClick={() => navigate('/companies/' + slug)}
                  className='flex items-center gap-1 text-xs text-text-muted hover:text-brand-400 transition-colors duration-150 flex-shrink-0 group'
                >
                  სხვა ვაკანსიები
                  <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
                    className='group-hover:translate-x-0.5 transition-transform duration-150'>
                    <path d='M5 12h14M12 5l7 7-7 7'/>
                  </svg>
                </button>
              )}
            </div>

            {employer.companyDescription && (
              <p className='text-sm text-text-secondary leading-relaxed mt-3 line-clamp-3'>
                {employer.companyDescription}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
