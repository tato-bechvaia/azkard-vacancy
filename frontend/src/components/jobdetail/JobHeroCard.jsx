import { useNavigate } from 'react-router-dom';
import CompanyAvatar from '../CompanyAvatar';
import { dateRangeLabel } from '../../utils/constants';

export default function JobHeroCard({ job }) {
  const navigate = useNavigate();
  const { title, employer, location, salary, currency, startDate, endDate } = job;
  const period = dateRangeLabel(startDate, endDate);

  const SalaryBlock = ({ className = '' }) => (
    <div className={className}>
      <p className='font-display font-bold text-[1.85rem] text-text-primary leading-none'>
        {salary?.toLocaleString()}
        <span className='text-xl text-brand-400 ml-1.5'>₾</span>
      </p>
      <p className='text-xs text-text-muted mt-1.5 text-right'>{currency || 'GEL'} · თვეში</p>
    </div>
  );

  return (
    <div className='bg-surface-50 border border-border-strong rounded-2xl p-6 sm:p-8 mb-3'>
      <div className='flex items-start gap-4 sm:gap-5'>
        <CompanyAvatar company={employer} size='lg' />

        <div className='flex-1 min-w-0'>
          <h1 className='font-display font-bold text-2xl sm:text-[1.75rem] text-text-primary leading-tight tracking-tight mb-2.5'>
            {title}
          </h1>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-text-secondary'>
            <span
              className='font-medium text-text-primary hover:text-brand-400 cursor-pointer transition-colors duration-150'
              onClick={() => navigate('/companies/' + employer.companyName.toLowerCase().replace(/ /g, '-'))}
            >
              {employer?.companyName}
            </span>
            {location && (
              <>
                <span className='text-border'>·</span>
                <span className='flex items-center gap-1'>
                  <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                  </svg>
                  {location}
                </span>
              </>
            )}
            {period && (
              <>
                <span className='text-border'>·</span>
                <span className='flex items-center gap-1'>
                  <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/>
                  </svg>
                  {period}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Salary right-aligned — hidden on small screens */}
        <SalaryBlock className='text-right flex-shrink-0 hidden sm:block' />
      </div>

      {/* Salary below title on mobile */}
      <div className='mt-4 sm:hidden'>
        <p className='font-display font-bold text-[1.5rem] text-text-primary leading-none'>
          {salary?.toLocaleString()}
          <span className='text-xl text-brand-400 ml-1'>₾</span>
        </p>
        <p className='text-xs text-text-muted mt-1'>{currency || 'GEL'} · თვეში</p>
      </div>
    </div>
  );
}
