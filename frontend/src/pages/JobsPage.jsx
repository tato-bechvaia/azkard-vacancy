import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { PageShell } from '../components/ui';
import Hero          from '../components/home/Hero';
import PremiumStrip  from '../components/home/PremiumStrip';
import FilterBar     from '../components/home/FilterBar';
import MainJobList   from '../components/home/MainJobList';
import SecondaryRows from '../components/home/SecondaryRows';

const LIMIT = 10;

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state — derived from URL (source of truth) ─────────────────────
  const search     = searchParams.get('q')      || '';
  const location   = searchParams.get('loc')    || '';
  const regimes    = useMemo(
    () => (searchParams.get('regime') || '').split(',').filter(Boolean),
    [searchParams]
  );
  const category   = searchParams.get('cat')    || '';   // single-select
  const experience = searchParams.get('exp')    || '';
  const sort       = searchParams.get('sort')   || 'newest';
  const salaryMin  = searchParams.get('salMin') || '';
  const salaryMax  = searchParams.get('salMax') || '';

  // categories array for API call + MainJobList results header
  const categories = useMemo(() => (category ? [category] : []), [category]);

  // ── URL update helper ─────────────────────────────────────────────────────
  const updateParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // ── Filter setters ────────────────────────────────────────────────────────
  const setSearch    = useCallback((v) => updateParam('q',      v), [updateParam]);
  const setLocation  = useCallback((v) => updateParam('loc',    v), [updateParam]);
  // Atomic setter — avoids React Router clobbering when both are set in one tick
  const setSalaryRange = useCallback((min, max) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (min) next.set('salMin', min); else next.delete('salMin');
      if (max) next.set('salMax', max); else next.delete('salMax');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const toggleRegime = useCallback((v) => {
    const next = regimes.includes(v) ? regimes.filter(r => r !== v) : [...regimes, v];
    updateParam('regime', next.join(','));
  }, [regimes, updateParam]);

  const setCategory   = useCallback((v) => updateParam('cat',  v), [updateParam]);
  const setExperience = useCallback((v) => updateParam('exp',  v), [updateParam]);
  const setSort       = useCallback((v) => updateParam('sort', v === 'newest' ? '' : v), [updateParam]);

  const resetFilters = useCallback(() => {
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
  const filtersActive = activeCount > 0 || !!search;

  // ── Server data ───────────────────────────────────────────────────────────
  const [premiumJobs,    setPremiumJobs]    = useState([]);
  const [carInternships, setCarInternships] = useState([]);

  // ── Main listing ──────────────────────────────────────────────────────────
  const [jobs,    setJobs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observerRef  = useRef(null);
  const abortRef     = useRef(null);
  const carouselDone = useRef(false);
  const loadingRef   = useRef(false);

  // Stable string used as deps key — changes when any filter changes
  const filterKey = [
    search, location, regimes.join(','), category, experience, sort, salaryMin, salaryMax,
  ].join('|');

  // Reset pagination + data when filters change
  useEffect(() => {
    setJobs([]);
    setPremiumJobs([]);
    setPage(1);
    setHasMore(true);
    carouselDone.current = false;
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch jobs
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    loadingRef.current = true;

    api.get('/jobs', {
      params: {
        search,
        location,
        regime:    regimes.join(','),
        experience,
        category,
        salaryMin,
        salaryMax,
        sort,
        page,
        limit: LIMIT,
      },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (page === 1) {
          setPremiumJobs(data.premiumJobs || []);
          if (!carouselDone.current && data.carousels) {
            setCarInternships(data.carousels.internships || []);
            carouselDone.current = true;
          }
        }
        setJobs(prev => page === 1 ? (data.standardJobs || []) : [...prev, ...(data.standardJobs || [])]);
        setTotal(data.total);
        setHasMore(page < data.pages);
      })
      .catch(err => { if (err.code === 'ERR_CANCELED') return; })
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [filterKey, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll sentinel
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
      <Hero
        search={search}
        setSearch={setSearch}
        location={location}
        setLocation={setLocation}
        total={total}
      />

      <PremiumStrip jobs={premiumJobs} />

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

      <MainJobList
        jobs={jobs}
        loading={loading}
        hasMore={hasMore}
        total={total}
        search={search}
        categories={categories}
        sentinelRef={sentinelRef}
      />

      <SecondaryRows
        filtersActive={filtersActive}
        internships={carInternships}
      />
    </PageShell>
  );
}
