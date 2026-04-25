import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { PageShell, Container, Spinner, EmptyState, Button } from '../components/ui';
import FilterBar from '../components/home/FilterBar';
import JobListCard from '../components/home/JobListCard';

const LIMIT = 15;

export default function VacanciesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search     = searchParams.get('q')      || '';
  const location   = searchParams.get('loc')    || '';
  const regimes    = useMemo(
    () => (searchParams.get('regime') || '').split(',').filter(Boolean),
    [searchParams]
  );
  const category   = searchParams.get('cat')    || '';
  const experience = searchParams.get('exp')    || '';
  const sort       = searchParams.get('sort')   || 'newest';
  const salaryMin  = searchParams.get('salMin') || '';
  const salaryMax  = searchParams.get('salMax') || '';

  const updateParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSearch    = useCallback((v) => updateParam('q',      v), [updateParam]);
  const setLocation  = useCallback((v) => updateParam('loc',    v), [updateParam]);
  const setSalaryRange = useCallback((min, max) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (min) next.set('salMin', min); else next.delete('salMin');
      if (max) next.set('salMax', max); else next.delete('salMax');
      return next;
    }, { replace: true });
  }, [setSearchParams]);
  const toggleRegime  = useCallback((v) => {
    const next = regimes.includes(v) ? regimes.filter(r => r !== v) : [...regimes, v];
    updateParam('regime', next.join(','));
  }, [regimes, updateParam]);
  const setCategory   = useCallback((v) => updateParam('cat',  v), [updateParam]);
  const setExperience = useCallback((v) => updateParam('exp',  v), [updateParam]);
  const setSort       = useCallback((v) => updateParam('sort', v === 'newest' ? '' : v), [updateParam]);
  const resetFilters  = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      ['q', 'loc', 'regime', 'cat', 'exp', 'sort', 'salMin', 'salMax'].forEach(k => next.delete(k));
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const activeCount = useMemo(() =>
    [...regimes, category, experience, location, sort !== 'newest' ? sort : '', salaryMin, salaryMax].filter(Boolean).length,
    [regimes, category, experience, location, sort, salaryMin, salaryMax]
  );

  // Data
  const [allJobs, setAllJobs] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef  = useRef(null);
  const abortRef     = useRef(null);
  const loadingRef   = useRef(false);

  const filterKey = [search, location, regimes.join(','), category, experience, sort, salaryMin, salaryMax].join('|');

  useEffect(() => {
    setAllJobs([]);
    setPage(1);
    setHasMore(true);
  }, [filterKey]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    loadingRef.current = true;

    api.get('/jobs', {
      params: { search, location, regime: regimes.join(','), experience, category, salaryMin, salaryMax, sort, page, limit: LIMIT },
      signal: controller.signal,
    })
      .then(({ data }) => {
        // Combine all tiers: Premium+ first, then Premium, then Standard
        const premPlus = data.premiumPlusJobs || [];
        const prem     = data.premiumJobs || [];
        const std      = data.standardJobs || [];

        if (page === 1) {
          setAllJobs([...premPlus, ...prem, ...std]);
        } else {
          setAllJobs(prev => [...prev, ...std]);
        }
        setTotal((premPlus.length + prem.length) + (data.total || 0));
        setHasMore(page < data.pages);
      })
      .catch(err => { if (err.code === 'ERR_CANCELED') return; })
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [filterKey, page]);

  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) setPage(prev => prev + 1);
    }, { rootMargin: '200px' });
    observerRef.current.observe(node);
  }, [hasMore]);

  return (
    <PageShell>
      <Container size='xl'>
        <div className='pt-8 pb-4'>
          <p className='text-[10.5px] tracking-[0.2em] uppercase text-text-muted mb-1'>ყველა</p>
          <h1 className='font-display font-bold text-2xl text-text-primary tracking-tight mb-1'>
            ვაკანსიები
          </h1>
          <p className='text-sm text-text-secondary'>
            Premium+ → Premium → Standard პრიორიტეტით
          </p>
        </div>
      </Container>

      {/* Search bar */}
      <div className='border-b border-border-subtle'>
        <Container size='xl'>
          <div className='py-4 flex gap-3'>
            <div className='flex-1 relative'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-text-muted'>
                <circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='ვაკანსიის ძებნა...'
                className='w-full h-10 pl-9 pr-4 bg-surface-100 border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 transition-all duration-150'
              />
            </div>
            <div className='relative w-48'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
                className='absolute left-3 top-1/2 -translate-y-1/2 text-text-muted'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
              </svg>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder='ლოკაცია'
                className='w-full h-10 pl-9 pr-4 bg-surface-100 border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30 transition-all duration-150'
              />
            </div>
          </div>
        </Container>
      </div>

      <FilterBar
        regimes={regimes}
        toggleRegime={toggleRegime}
        category={category}
        setCategory={setCategory}
        experience={experience}
        setExperience={setExperience}
        sort={sort}
        setSort={setSort}
        salaryMin={salaryMin}
        salaryMax={salaryMax}
        setSalaryRange={setSalaryRange}
        activeCount={activeCount}
        resetFilters={resetFilters}
      />

      <section className='py-6'>
        <Container size='xl'>
          {total > 0 && (
            <p className='text-sm text-text-secondary mb-5'>
              <span className='font-semibold text-text-primary'>{total.toLocaleString()}</span> ვაკანსია
            </p>
          )}

          <div className='flex flex-col gap-2'>
            {allJobs.length === 0 && loading ? (
              <div className='flex flex-col items-center gap-3 py-24 text-text-muted'>
                <Spinner size='lg' />
                <p className='text-sm'>იტვირთება...</p>
              </div>
            ) : allJobs.length === 0 ? (
              <EmptyState
                icon={<svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/></svg>}
                title='ვაკანსია ვერ მოიძებნა'
                description='სცადეთ ფილტრების შეცვლა'
                action={<Button variant='ghost' size='sm' onClick={resetFilters}>გასუფთავება</Button>}
              />
            ) : (
              allJobs.map(job => <JobListCard key={job.id} job={job} />)
            )}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className='flex items-center justify-center py-12'>
              {loading && allJobs.length > 0 && (
                <div className='flex items-center gap-2 text-sm text-text-muted'>
                  <Spinner size='sm' />
                  იტვირთება...
                </div>
              )}
            </div>
          )}

          {!hasMore && allJobs.length > 0 && (
            <p className='text-center text-xs text-text-muted py-8 tracking-wide'>
              — ყველა ვაკანსია ნაჩვენებია —
            </p>
          )}
        </Container>
      </section>
    </PageShell>
  );
}
