import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_LABELS   = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS      = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1-3 წელი', THREE_TO_FIVE: '3-5 წელი', FIVE_PLUS: '5+ წელი' };
const CATEGORY_LABELS = {
  IT: 'IT და ტექნოლოგია', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი',
  FINANCE: 'ფინანსები', DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი',
  LOGISTICS: 'ლოჯისტიკა', HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება',
  HOSPITALITY: 'სტუმართმოყვარეობა', OTHER: 'სხვა'
};

const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700 border-teal-200',
  HYBRID:    'bg-blue-50 text-blue-700 border-blue-200',
  FULL_TIME: 'bg-gray-100 text-gray-600 border-gray-200',
};

const LIMIT = 10;

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
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(date);
  };

  const dateRangeLabel = (job) => {
    if (!job?.startDate || !job?.endDate) return null;
    const start = fmtDayMonth(job.startDate);
    const end = fmtDayMonth(job.endDate);
    if (!start || !end) return null;
    return `${start} – ${end}`;
  };

  // Reset jobs and fetch page 1 when any filter changes
  useEffect(() => {
    setJobs([]);
    setPage(1);
    setHasMore(true);
  }, [search, location, regime, experience, category, salaryMin, salaryMax]);

  // Fetch jobs for the current page
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
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [search, location, regime, experience, category, salaryMin, salaryMax, page]);

  // Intersection Observer on the sentinel element
  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        setPage(prev => prev + 1);
      }
    }, { rootMargin: '200px' });

    observerRef.current.observe(node);
  }, [hasMore]);

  const resetFilters = () => {
    setRegime(''); setCategory(''); setSalaryMin('');
    setSalaryMax(''); setExperience(''); setLocation('');
  };

  const activeCount = [regime, category, salaryMin, salaryMax, experience, location].filter(Boolean).length;

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className='min-h-screen' style={{ backgroundColor: '#F3F4F6' }}>
      <Navbar />

      {/* Search header */}
      <div className='bg-white border-b border-gray-200 pt-14'>
        <div className='max-w-6xl mx-auto px-6 py-6'>
          <form onSubmit={handleSearch} className='flex gap-0 rounded-xl overflow-hidden border border-gray-300 bg-white shadow-sm'>
            <div className='flex items-center gap-3 flex-1 px-5 border-r border-gray-200'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='2'>
                <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
              </svg>
              <input
                type='text'
                placeholder='ვაკანსია, საკვანძო სიტყვა ან კომპანია'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='flex-1 h-12 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent'
              />
            </div>
            <div className='flex items-center gap-3 flex-1 px-5'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='2'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
              </svg>
              <input
                type='text'
                placeholder='ქალაქი'
                value={location}
                onChange={e => setLocation(e.target.value)}
                className='flex-1 h-12 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent'
              />
            </div>
            <button
              type='submit'
              className='px-8 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold tracking-wide transition whitespace-nowrap'>
              ვაკანსიების ძიება
            </button>
          </form>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-8 flex gap-8'>

        {/* Left sidebar filters */}
        <aside className='w-52 flex-shrink-0'>
          <div className='flex items-center justify-between mb-4'>
            <p className='font-semibold text-gray-900 text-sm'>ფილტრები</p>
            {activeCount > 0 && (
              <button onClick={resetFilters} className='text-xs text-brand-600 hover:underline'>
                გასუფთავება
              </button>
            )}
          </div>

          {/* Job Type / Regime */}
          <div className='mb-6'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>სამუშაო ტიპი</p>
            {[
              { value: '',          label: 'ყველა' },
              { value: 'FULL_TIME', label: 'სრული განაკვეთი' },
              { value: 'REMOTE',    label: 'დისტანციური' },
              { value: 'HYBRID',    label: 'ჰიბრიდული' },
            ].map(opt => (
              <label key={opt.value} className='flex items-center gap-2.5 py-1.5 cursor-pointer group'>
                <div
                  onClick={() => setRegime(opt.value)}
                  className={'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ' +
                    (regime === opt.value
                      ? 'bg-brand-600 border-brand-600'
                      : 'border-gray-300 group-hover:border-brand-400')}>
                  {regime === opt.value && (
                    <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
                      <polyline points='1,4 3,6 7,2' stroke='white' strokeWidth='1.5'/>
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => setRegime(opt.value)}
                  className='text-sm text-gray-600 group-hover:text-gray-900 cursor-pointer'>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Experience */}
          <div className='mb-6'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>გამოცდილება</p>
            {[
              { value: '',             label: 'ყველა' },
              { value: 'NONE',         label: 'არ სჭირდება' },
              { value: 'ONE_TO_THREE', label: '1-3 წელი' },
              { value: 'THREE_TO_FIVE',label: '3-5 წელი' },
              { value: 'FIVE_PLUS',    label: '5+ წელი' },
            ].map(opt => (
              <label key={opt.value} className='flex items-center gap-2.5 py-1.5 cursor-pointer group'>
                <div
                  onClick={() => setExperience(opt.value)}
                  className={'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ' +
                    (experience === opt.value
                      ? 'bg-brand-600 border-brand-600'
                      : 'border-gray-300 group-hover:border-brand-400')}>
                  {experience === opt.value && (
                    <svg width='8' height='8' viewBox='0 0 8 8' fill='none'>
                      <polyline points='1,4 3,6 7,2' stroke='white' strokeWidth='1.5'/>
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => setExperience(opt.value)}
                  className='text-sm text-gray-600 group-hover:text-gray-900 cursor-pointer'>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Category */}
          <div className='mb-6'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>კატეგორია</p>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className='w-full h-9 bg-white border border-gray-300 rounded-lg px-3 text-sm text-gray-600 focus:outline-none focus:border-brand-600'>
              <option value=''>ყველა კატეგორია</option>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className='mb-6'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3'>ხელფასი (GEL)</p>
            <div className='flex gap-2'>
              <input
                type='number' placeholder='მინ.'
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
                className='w-full h-9 bg-white border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
              />
              <input
                type='number' placeholder='მაქს.'
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
                className='w-full h-9 bg-white border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className='flex-1 min-w-0'>

          {/* Results header */}
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-gray-600'>
              <span className='font-semibold text-gray-900'>{total.toLocaleString()}</span> ვაკანსია ნაპოვნია
              {search && (
                <span className='text-brand-600 font-semibold'> "{search}"</span>
              )}
            </p>
          </div>

          {/* Jobs list */}
          <div className='space-y-0 bg-white rounded-xl border border-gray-200 overflow-hidden'>
            {jobs.length === 0 && !loading ? (
              <div className='text-center py-20 text-gray-400'>
                <p className='font-medium text-gray-600 mb-1'>ვაკანსია ვერ მოიძებნა</p>
                <p className='text-sm'>სცადეთ ფილტრების შეცვლა</p>
              </div>
            ) : (
              jobs.map((job, idx) => (
                <div
                  key={job.id}
                  onClick={() => navigate('/jobs/' + job.id)}
                  className={'flex items-start gap-4 px-6 py-5 cursor-pointer hover:bg-gray-50 transition group ' +
                    (idx !== jobs.length - 1 ? 'border-b border-gray-100' : '')}>

                  <CompanyAvatar company={job.employer} size='md' />

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1 flex-wrap'>
                          <h3 className='font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition'>
                            {job.title}
                          </h3>
                          <span className='text-sm font-semibold text-gray-800 ml-1'>{job.salary.toLocaleString()} ₾</span>
                        </div>
                        <div className='flex items-center gap-3 text-xs text-gray-500 flex-wrap'>
                          <span
                            onClick={e => { e.stopPropagation(); navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-')); }}
                            className='font-medium text-gray-700 hover:text-brand-600 cursor-pointer transition'>
                            {job.employer.companyName}
                          </span>
                          {job.location && (
                            <>
                              <span className='text-gray-300'>·</span>
                              <span className='flex items-center gap-1'>
                                <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                  <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                                </svg>
                                {job.location}
                              </span>
                            </>
                          )}
                          {dateRangeLabel(job) && (
                            <>
                              <span className='text-gray-300'>·</span>
                              <span className='text-gray-500'>
                                {dateRangeLabel(job)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className='flex-shrink-0 text-right'>
                        <p className='text-xs text-gray-400'>
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString('ka-GE') + ' · ' : ''}
                          ნახვა: {job.views} · განაცხადი: {job._count?.applications || 0}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 mt-2.5 flex-wrap'>
                      <span className={'text-xs px-2.5 py-1 rounded-full border font-medium ' + REGIME_TAG[job.jobRegime]}>
                        {REGIME_LABELS[job.jobRegime]}
                      </span>
                      <span className='text-xs px-2.5 py-1 rounded-full border bg-gray-50 text-gray-500 border-gray-200'>
                        {EXP_LABELS[job.experience]}
                      </span>
                      {job.category && job.category !== 'OTHER' && (
                        <span className='text-xs px-2.5 py-1 rounded-full border bg-brand-50 text-brand-600 border-brand-100'>
                          {CATEGORY_LABELS[job.category]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Infinite scroll sentinel + loading indicator */}
          {hasMore && (
            <div ref={sentinelRef} className='flex items-center justify-center py-8'>
              {loading && (
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <svg className='animate-spin h-4 w-4 text-gray-400' viewBox='0 0 24 24' fill='none'>
                    <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-25'/>
                    <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round' className='opacity-75'/>
                  </svg>
                  იტვირთება...
                </div>
              )}
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <p className='text-center text-sm text-gray-400 py-8'>ყველა ვაკანსია ნაჩვენებია</p>
          )}

          {/* Footer */}
          <div className='mt-16 pt-8 border-t border-gray-200 flex items-center justify-between'>
            <div>
              <div className='h-7 px-3 rounded-lg bg-brand-600 inline-flex items-center justify-center text-white font-display font-bold text-sm tracking-wide mb-2'>
                Azkard
              </div>
              <p className='text-xs text-gray-400'>© 2026 Azkard. ყველა უფლება დაცულია.</p>
            </div>
            <div className='flex items-center gap-6 text-xs text-gray-400'>
              <span className='hover:text-gray-600 cursor-pointer'>კონფიდენციალობა</span>
              <span className='hover:text-gray-600 cursor-pointer'>პირობები</span>
              <span className='hover:text-gray-600 cursor-pointer'>კონტაქტი</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}