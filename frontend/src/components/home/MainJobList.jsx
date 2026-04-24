import { useNavigate } from 'react-router-dom';
import { Container, EmptyState, Spinner, Button } from '../ui';
import { CATEGORY_LABELS } from '../../utils/constants';
import JobListCard from './JobListCard';

export default function MainJobList({
  jobs,
  loading,
  hasMore,
  total,
  search,
  categories,
  sentinelRef,
}) {
  const navigate = useNavigate();

  const BriefcaseIcon = (
    <svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'>
      <rect x='2' y='7' width='20' height='14' rx='2'/>
      <path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/>
    </svg>
  );

  return (
    <section className='py-8'>
      <Container size='xl'>

        {/* Results header */}
        {(total > 0 || jobs.length > 0) && (
          <div className='mb-5'>
            <p className='text-sm text-text-secondary'>
              <span className='font-semibold text-text-primary'>{total.toLocaleString()}</span>
              {' '}ვაკანსია
              {search && (
                <span className='text-brand-400 font-medium'> &ldquo;{search}&rdquo;</span>
              )}
              {categories.length > 0 && (
                <span className='text-text-muted'>
                  {' · '}{categories.map(c => CATEGORY_LABELS[c]).join(', ')}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Job list */}
        <div className='flex flex-col gap-2'>
          {jobs.length === 0 && loading ? (
            <div className='flex flex-col items-center justify-center gap-3 py-24 text-text-muted'>
              <Spinner size='lg' />
              <p className='text-sm'>იტვირთება...</p>
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title='ვაკანსია ვერ მოიძებნა'
              description='სცადეთ ფილტრების შეცვლა'
              action={
                <Button variant='ghost' size='sm' onClick={() => navigate('/')}>
                  გასუფთავება
                </Button>
              }
            />
          ) : (
            jobs.map(job => <JobListCard key={job.id} job={job} />)
          )}
        </div>

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className='flex items-center justify-center py-12'>
            {loading && jobs.length > 0 && (
              <div className='flex items-center gap-2 text-sm text-text-muted'>
                <Spinner size='sm' />
                იტვირთება...
              </div>
            )}
          </div>
        )}

        {!hasMore && jobs.length > 0 && (
          <p className='text-center text-xs text-text-muted py-8 tracking-wide'>
            — ყველა ვაკანსია ნაჩვენებია —
          </p>
        )}

        {/* Footer */}
        <div className='mt-16 pt-6 border-t border-border-subtle flex items-center justify-between'>
          <div>
            <div onClick={() => navigate('/')} className='cursor-pointer inline-block mb-1.5'>
              <div className='h-7 px-3 rounded-md bg-brand-600 inline-flex items-center text-white font-display font-bold text-xs tracking-wide'>
                Azkard
              </div>
            </div>
            <p className='text-xs text-text-muted'>© 2026 Azkard. ყველა უფლება დაცულია.</p>
          </div>
          <div className='flex items-center gap-5 text-xs text-text-muted'>
            <span className='hover:text-text-secondary cursor-pointer transition-colors duration-150'>
              კონფიდენციალობა
            </span>
            <span className='hover:text-text-secondary cursor-pointer transition-colors duration-150'>
              პირობები
            </span>
            <span className='hover:text-text-secondary cursor-pointer transition-colors duration-150'>
              კონტაქტი
            </span>
          </div>
        </div>

      </Container>
    </section>
  );
}
