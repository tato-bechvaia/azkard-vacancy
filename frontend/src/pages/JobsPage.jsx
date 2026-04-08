import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_LABELS   = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS      = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1–3 წელი', THREE_TO_FIVE: '3–5 წელი', FIVE_PLUS: '5+ წელი' };
const CATEGORY_LABELS = {
  IT: 'IT', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი',
  FINANCE: 'ფინანსები', DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი',
  LOGISTICS: 'ლოჯისტიკა', HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება',
  HOSPITALITY: 'სტუმართმოყვარეობა', OTHER: 'სხვა'
};

const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700',
  HYBRID:    'bg-blue-50 text-blue-700',
  FULL_TIME: 'bg-gray-100 text-gray-600',
};

const REGIME_ACCENT = {
  REMOTE:    'border-l-teal-400',
  HYBRID:    'border-l-blue-400',
  FULL_TIME: 'border-l-brand-400',
};

const LIMIT = 10;

const isNew = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000;
};

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [location, setLocation]     = useState('');
  const [regime, setRegime]         = useState('');
  const [category, setCategory]     = useState('');
  const [salaryMin, setSalaryMin]   = useState('');
  const [salaryMax, setSalaryMax]   = useState('');
  const [experience, setExperience] = useState('');

  const observerRef = useRef(null);
  const loadingRef  = useRef(false);

  const fmtDayMonth = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  };

  const dateRangeLabel = (job) => {
    if (!job?.startDate || !job?.endDate) return null;
    const start = fmtDayMonth(job.startDate);
    const end   = fmtDayMonth(job.endDate);
    if (!start || !end) return null;
    return `${start} – ${end}`;
  };

  useEffect(() => {
    setJobs([]);
    setPage(1);
    setHasMore(true);
  }, [search, location, regime, experience, category, salaryMin, salaryMax]);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    api.get('/jobs', { params: { search, location, regime, experience, category, salaryMin, salaryMax, page, limit: LIMIT } })
      .then(({ data }) => {
        setJobs(prev => page === 1 ? data.jobs : [...prev, ...data.jobs]);
        setTotal(data.total);
        setHasMore(page < data.pages);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [search, location, regime, experience, category, salaryMin, salaryMax, page]);

  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) setPage(prev => prev + 1);
    }, { rootMargin: '200px' });
    observerRef.current.observe(node);
  }, [hasMore]);

  const resetFilters = () => {
    setRegime(''); setCategory(''); setSalaryMin('');
    setSalaryMax(''); setExperience(''); setLocation('');
  };

  const activeCount = [regime, category, salaryMin, salaryMax, experience, location].filter(Boolean).length;

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className='bg-gray-950 pt-14'>
        <div className='max-w-6xl mx-auto px-6 pt-12 pb-10'>

          <p className='text-brand-400 text-xs font-medium tracking-widest uppercase mb-3'>
            Azkard Job Board
          </p>
          <h1 className='font-display font-bold text-4xl text-white mb-2 leading-tight'>
            იპოვე სწორი ვაკანსია
          </h1>
          <p className='text-gray-500 text-sm mb-8'>
            {total > 0 ? `${total.toLocaleString()} ვაკანსია ელოდება` : '\u00a0'}
          </p>

          {/* Search bar */}
          <form className='bg-white rounded-2xl flex overflow-hidden shadow-2xl shadow-black/30'>
            <div className='flex items-center gap-3 flex-1 px-5 border-r border-gray-100'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='2' className='flex-shrink-0'>
                <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
              </svg>
              <input
                type='text'
                placeholder='ვაკანსია, კომპანია ან საკვანძო სიტყვა'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='flex-1 h-14 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent'
              />
            </div>
            <div className='flex items-center gap-3 w-52 px-5'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='2' className='flex-shrink-0'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
              </svg>
              <input
                type='text'
                placeholder='ქალაქი'
                value={location}
                onChange={e => setLocation(e.target.value)}
                className='flex-1 h-14 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent'
              />
            </div>
            <div className='p-2'>
              <button
                type='submit'
                className='h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors duration-150 whitespace-nowrap'>
                ძიება
              </button>
            </div>
          </form>

          {/* Regime quick chips */}
          <div className='flex items-center gap-2 mt-4 flex-wrap'>
            {[
              { value: '',          label: 'ყველა' },
              { value: 'REMOTE',    label: 'დისტანციური' },
              { value: 'HYBRID',    label: 'ჰიბრიდული' },
              { value: 'FULL_TIME', label: 'ადგილზე' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setRegime(opt.value)}
                className={'px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ' +
                  (regime === opt.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white border border-white/10')}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-8 flex gap-8'>

        {/* Sidebar */}
        <aside className='w-52 flex-shrink-0'>
          <div className='sticky top-20'>
            <div className='flex items-center justify-between mb-5'>
              <p className='text-sm font-semibold text-gray-900'>ფილტრები</p>
              {activeCount > 0 && (
                <button
                  onClick={resetFilters}
                  className='text-xs text-brand-600 hover:text-brand-700 transition-colors duration-150 flex items-center gap-1.5'>
                  გასუფთავება
                  <span className='w-4 h-4 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-medium text-[10px] leading-none'>
                    {activeCount}
                  </span>
                </button>
              )}
            </div>

            {/* Experience */}
            <div className='mb-6'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>გამოცდილება</p>
              <div className='flex flex-col'>
                {[
                  { value: '',              label: 'ყველა' },
                  { value: 'NONE',          label: 'არ სჭირდება' },
                  { value: 'ONE_TO_THREE',  label: '1–3 წელი' },
                  { value: 'THREE_TO_FIVE', label: '3–5 წელი' },
                  { value: 'FIVE_PLUS',     label: '5+ წელი' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ' +
                      (experience === opt.value
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className='mb-6'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>კატეგორია</p>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className='w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm text-gray-600 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100'>
                <option value=''>ყველა</option>
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div className='mb-6'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'>ხელფასი (₾)</p>
              <div className='flex gap-2'>
                <input
                  type='number' placeholder='მინ.'
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className='w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100'
                />
                <input
                  type='number' placeholder='მაქს.'
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className='w-full h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100'
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Job list */}
        <main className='flex-1 min-w-0'>

          <div className='flex items-center justify-between mb-5'>
            <p className='text-sm text-gray-500'>
              <span className='font-semibold text-gray-900'>{total.toLocaleString()}</span> ვაკანსია
              {search && <span className='text-brand-600 font-medium'> &ldquo;{search}&rdquo;</span>}
            </p>
          </div>

          <div className='flex flex-col gap-3'>
            {jobs.length === 0 && !loading ? (
              <div className='bg-white border border-gray-100 rounded-2xl text-center py-20'>
                <div className='w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.5'>
                    <rect x='2' y='7' width='20' height='14' rx='2'/>
                    <path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/>
                  </svg>
                </div>
                <p className='font-semibold text-gray-700 mb-1'>ვაკანსია ვერ მოიძებნა</p>
                <p className='text-sm text-gray-400'>სცადეთ ფილტრების შეცვლა</p>
              </div>
            ) : (
              jobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => navigate('/jobs/' + job.id)}
                  className={'bg-white border border-gray-100 border-l-4 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:shadow-gray-900/5 transition duration-200 group ' + REGIME_ACCENT[job.jobRegime]}>

                  <div className='flex items-start gap-4'>
                    <CompanyAvatar company={job.employer} size='md' />

                    <div className='flex-1 min-w-0'>
                      {/* Title + salary */}
                      <div className='flex items-start justify-between gap-4 mb-2'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-display font-semibold text-[15px] text-gray-900 group-hover:text-brand-600 transition-colors duration-150 leading-snug'>
                            {job.title}
                          </h3>
                          {isNew(job.createdAt) && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full bg-brand-600 text-white font-medium tracking-wide'>
                              ახალი
                            </span>
                          )}
                        </div>
                        <span className='flex-shrink-0 text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100'>
                          {job.salary.toLocaleString()} ₾
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className='flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap'>
                        <span
                          onClick={e => { e.stopPropagation(); navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-')); }}
                          className='font-medium text-gray-700 hover:text-brand-600 cursor-pointer transition-colors duration-150'>
                          {job.employer.companyName}
                        </span>
                        {job.location && (
                          <>
                            <span className='text-gray-200'>·</span>
                            <span>{job.location}</span>
                          </>
                        )}
                        {dateRangeLabel(job) && (
                          <>
                            <span className='text-gray-200'>·</span>
                            <span>{dateRangeLabel(job)}</span>
                          </>
                        )}
                      </div>

                      {/* Tags + stats */}
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className={'text-xs px-2.5 py-1 rounded-full font-medium ' + REGIME_TAG[job.jobRegime]}>
                          {REGIME_LABELS[job.jobRegime]}
                        </span>
                        <span className='text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-500'>
                          {EXP_LABELS[job.experience]}
                        </span>
                        {job.category && job.category !== 'OTHER' && (
                          <span className='text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600'>
                            {CATEGORY_LABELS[job.category]}
                          </span>
                        )}
                        <div className='ml-auto flex items-center gap-3 text-xs text-gray-400'>
                          <span className='flex items-center gap-1'>
                            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/>
                            </svg>
                            {job.views}
                          </span>
                          <span className='flex items-center gap-1'>
                            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/>
                              <path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'/>
                            </svg>
                            {job._count?.applications || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className='flex items-center justify-center py-10'>
              {loading && (
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
                    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-25'/>
                    <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round' className='opacity-75'/>
                  </svg>
                  იტვირთება...
                </div>
              )}
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <p className='text-center text-xs text-gray-400 py-8'>ყველა ვაკანსია ნაჩვენებია</p>
          )}

          {/* Footer */}
          <div className='mt-16 pt-8 border-t border-gray-100 flex items-center justify-between'>
            <div>
              <div className='h-7 px-3 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-sm tracking-wide mb-1.5'>
                Azkard
              </div>
              <p className='text-xs text-gray-400'>© 2026 Azkard. ყველა უფლება დაცულია.</p>
            </div>
            <div className='flex items-center gap-6 text-xs text-gray-400'>
              <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>კონფიდენციალობა</span>
              <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>პირობები</span>
              <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>კონტაქტი</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
