import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';
import PremiumCarousel from '../components/PremiumCarousel';
import CarouselSection from '../components/CarouselSection';
import CompanyBoxes from '../components/CompanyBoxes';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_FULL      = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1–3 წელი', THREE_TO_FIVE: '3–5 წელი', FIVE_PLUS: '5+ წელი' };

const CATEGORY_LABELS = {
  IT: 'IT', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი',
  FINANCE: 'ფინანსები', DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი',
  LOGISTICS: 'ლოჯისტიკა', HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება',
  HOSPITALITY: 'სტუმართმ.', OTHER: 'სხვა',
};

const REGIME_DOT = { REMOTE: 'bg-teal-400', HYBRID: 'bg-blue-400', FULL_TIME: 'bg-violet-400' };
const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700',
  HYBRID:    'bg-blue-50 text-blue-700',
  FULL_TIME: 'bg-gray-100 text-gray-600',
};

const LIMIT = 10;

const isNew = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 3 * 24 * 60 * 60 * 1000;
};

const isExpired = (job) => {
  const expiry = job.expiresAt
    ? new Date(job.expiresAt)
    : (() => { const d = new Date(job.createdAt); d.setDate(d.getDate() + 30); return d; })();
  return expiry < new Date();
};

const fmtDayMonth = (d) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
};

const dateRangeLabel = (job) => {
  const posted = fmtDayMonth(job.createdAt);
  const expiry = job.expiresAt
    ? fmtDayMonth(job.expiresAt)
    : (() => { const d = new Date(job.createdAt); d.setDate(d.getDate() + 30); return fmtDayMonth(d); })();
  if (!posted || !expiry) return null;
  return `${posted} – ${expiry}`;
};

export default function JobsPage() {
  const navigate = useNavigate();

  // carousel data
  const [premiumJobs, setPremiumJobs]         = useState([]);
  const [carStudents, setCarStudents]         = useState([]);
  const [carInternships, setCarInternships]   = useState([]);
  const [carTopSalaries, setCarTopSalaries]   = useState([]);
  const [carToday, setCarToday]               = useState([]);
  const [carTop, setCarTop]                   = useState([]);

  // standard listing
  const [jobs, setJobs]   = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // filters
  const [search, setSearch]         = useState('');
  const [location, setLocation]     = useState('');
  const [regime, setRegime]         = useState('');
  const [categories, setCategories] = useState([]);
  const [salaryMin, setSalaryMin]   = useState('');
  const [salaryMax, setSalaryMax]   = useState('');
  const [experience, setExperience] = useState('');

  const observerRef  = useRef(null);
  const loadingRef   = useRef(false);
  const carouselDone = useRef(false); // load carousels only on first page-1 fetch

  useEffect(() => {
    setJobs([]);
    setPremiumJobs([]);
    setPage(1);
    setHasMore(true);
    carouselDone.current = false;
  }, [search, location, regime, experience, categories, salaryMin, salaryMax]);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const category = categories.length === 1 ? categories[0] : '';
    api.get('/jobs', { params: { search, location, regime, experience, category, salaryMin, salaryMax, page, limit: LIMIT } })
      .then(({ data }) => {
        if (page === 1) {
          setPremiumJobs(data.premiumJobs || []);
          if (!carouselDone.current && data.carousels) {
            setCarStudents(data.carousels.students || []);
            setCarInternships(data.carousels.internships || []);
            setCarTopSalaries(data.carousels.topSalaries || []);
            setCarToday(data.carousels.today || []);
            setCarTop(data.carousels.top || []);
            carouselDone.current = true;
          }
        }
        setJobs(prev => page === 1 ? (data.standardJobs || []) : [...prev, ...(data.standardJobs || [])]);
        setTotal(data.total);
        setHasMore(page < data.pages);
      })
      .catch(() => {})
      .finally(() => { setLoading(false); loadingRef.current = false; });
  }, [search, location, regime, experience, categories, salaryMin, salaryMax, page]);

  const sentinelRef = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) setPage(prev => prev + 1);
    }, { rootMargin: '200px' });
    observerRef.current.observe(node);
  }, [hasMore]);

  const toggleCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const resetFilters = () => {
    setRegime(''); setCategories([]); setSalaryMin('');
    setSalaryMax(''); setExperience(''); setLocation('');
  };

  const activeCount = [regime, ...categories, salaryMin, salaryMax, experience, location].filter(Boolean).length;
  const filtersActive = activeCount > 0 || !!search;

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className='bg-gray-950 pt-14'>
        <div className='max-w-6xl mx-auto px-6 pt-14 pb-12'>
          <p className='text-brand-400/70 text-[10.5px] font-medium tracking-[0.22em] uppercase mb-4'>
            Azkard · Job Board
          </p>
          <h1 className='font-display font-semibold text-[2.6rem] text-white leading-[1.12] tracking-tight mb-3'>
            იპოვე სწორი ვაკანსია
          </h1>
          <p className='text-gray-500 text-[13px] mb-9'>
            {total > 0 ? `${total.toLocaleString()} ვაკანსია ხელმისაწვდომია` : '\u00a0'}
          </p>

          {/* Search */}
          <div className='flex items-stretch bg-white/[0.06] border border-white/[0.09] rounded-2xl overflow-hidden'>
            <div className='flex items-center gap-3 flex-1 px-5'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#6B7280' strokeWidth='1.75' className='flex-shrink-0'>
                <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
              </svg>
              <input
                type='text'
                placeholder='ვაკანსია, კომპანია ან საკვანძო სიტყვა'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='flex-1 h-[3.125rem] text-[13.5px] text-white placeholder-gray-500/80 focus:outline-none bg-transparent'
              />
            </div>
            <div className='w-px bg-white/[0.08] my-3' />
            <div className='flex items-center gap-3 w-44 px-5'>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6B7280' strokeWidth='1.75' className='flex-shrink-0'>
                <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
              </svg>
              <input
                type='text'
                placeholder='ქალაქი'
                value={location}
                onChange={e => setLocation(e.target.value)}
                className='flex-1 h-[3.125rem] text-[13.5px] text-white placeholder-gray-500/80 focus:outline-none bg-transparent'
              />
            </div>
            <div className='p-2'>
              <button
                type='button'
                className='h-[2.625rem] px-6 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-xl transition-colors duration-150 whitespace-nowrap'>
                ძიება
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className='sticky top-14 z-40 bg-white border-b border-gray-100'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='flex items-center gap-0 py-2.5 overflow-x-auto scrollbar-hide'>
            {/* Regime */}
            <div className='flex items-center gap-1 flex-shrink-0 pr-4 mr-4 border-r border-gray-100'>
              {[
                { value: '', label: 'ყველა' },
                { value: 'REMOTE', label: 'დისტ.' },
                { value: 'HYBRID', label: 'ჰიბრ.' },
                { value: 'FULL_TIME', label: 'ადგ.' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRegime(opt.value)}
                  className={'h-7 px-3 rounded-full text-[11.5px] font-medium transition-all duration-150 whitespace-nowrap ' +
                    (regime === opt.value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Categories */}
            <div className='flex items-center gap-1 flex-shrink-0 pr-4 mr-4 border-r border-gray-100'>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={'h-7 px-3 rounded-full text-[11.5px] font-medium transition-all duration-150 whitespace-nowrap ' +
                    (categories.includes(key) ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
                  {val}
                </button>
              ))}
            </div>

            {/* Experience */}
            <div className='flex items-center gap-1 flex-shrink-0 pr-4 mr-4 border-r border-gray-100'>
              {[
                { value: '', label: 'ნებისმ.' },
                { value: 'NONE', label: 'Junior' },
                { value: 'ONE_TO_THREE', label: '1–3 წ.' },
                { value: 'THREE_TO_FIVE', label: '3–5 წ.' },
                { value: 'FIVE_PLUS', label: '5+ წ.' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setExperience(opt.value)}
                  className={'h-7 px-3 rounded-full text-[11.5px] font-medium transition-all duration-150 whitespace-nowrap ' +
                    (experience === opt.value ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Salary */}
            <div className='flex items-center gap-2 flex-shrink-0'>
              <input
                type='number' placeholder='₾ მინ.'
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
                className='w-[72px] h-7 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-[11.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 transition-colors duration-150'
              />
              <span className='text-gray-300 text-xs flex-shrink-0'>–</span>
              <input
                type='number' placeholder='₾ მაქს.'
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
                className='w-[72px] h-7 bg-gray-50 border border-gray-200 rounded-lg px-2.5 text-[11.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-400 transition-colors duration-150'
              />
            </div>

            {/* Clear */}
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className='flex-shrink-0 ml-4 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11.5px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150'>
                <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M18 6 6 18M6 6l12 12'/></svg>
                გასუფთავება
                <span className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold leading-none'>{activeCount}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Dark section: Premium + carousels + Company Boxes ────── */}
      {!filtersActive && (
        <div className='bg-gray-950 border-b border-white/[0.04]'>
          <div className='max-w-6xl mx-auto px-6'>

            {/* Premium Jobs */}
            {premiumJobs.length > 0 && (
              <div className='pt-7 pb-2'>
                <PremiumCarousel jobs={premiumJobs} />
              </div>
            )}

            {/* Today's Vacancies */}
            {carToday.length > 0 && (
              <div className='pt-6 pb-2 border-t border-white/[0.04]'>
                <CarouselSection
                  title='დღევანდელი ვაკანსიები'
                  icon='📅'
                  jobs={carToday}
                  dark={true}
                  badge={carToday.length}
                />
              </div>
            )}

            {/* Top Vacancies */}
            {carTop.length > 0 && (
              <div className='pt-6 pb-2 border-t border-white/[0.04]'>
                <CarouselSection
                  title='ტოპ ვაკანსიები'
                  icon='🔥'
                  jobs={carTop}
                  dark={true}
                  badge={carTop.length}
                />
              </div>
            )}

            {/* Top Salaries */}
            {carTopSalaries.length > 0 && (
              <div className='pt-6 pb-2 border-t border-white/[0.04]'>
                <CarouselSection
                  title='მაღალი ხელფასები'
                  icon='💰'
                  jobs={carTopSalaries}
                  dark={true}
                  badge={carTopSalaries.length}
                />
              </div>
            )}

            {/* For Students */}
            {carStudents.length > 0 && (
              <div className='pt-6 pb-2 border-t border-white/[0.04]'>
                <CarouselSection
                  title='სტუდენტებისთვის'
                  icon='🎓'
                  jobs={carStudents}
                  dark={true}
                  badge={carStudents.length}
                />
              </div>
            )}

            {/* Internships */}
            {carInternships.length > 0 && (
              <div className='pt-6 pb-6 border-t border-white/[0.04]'>
                <CarouselSection
                  title='სტაჟირება'
                  icon='🚀'
                  jobs={carInternships}
                  dark={true}
                  badge={carInternships.length}
                />
              </div>
            )}

            {/* Company Boxes */}
            <div className='border-t border-white/[0.04]'>
              <CompanyBoxes />
            </div>

          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-8'>

        <div className='flex items-center justify-between mb-5'>
          <p className='text-[13px] text-gray-400'>
            <span className='font-semibold text-gray-900'>{total.toLocaleString()}</span>{' '}
            ვაკანსია
            {search && <span className='text-brand-600 font-medium'> &ldquo;{search}&rdquo;</span>}
            {categories.length > 0 && (
              <span className='text-gray-500'>{' · '}{categories.map(c => CATEGORY_LABELS[c]).join(', ')}</span>
            )}
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          {jobs.length === 0 && !loading ? (
            <div className='bg-white border border-gray-100 rounded-2xl text-center py-24'>
              <div className='w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-4'>
                <svg width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='#D1D5DB' strokeWidth='1.5'>
                  <rect x='2' y='7' width='20' height='14' rx='2'/>
                  <path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/>
                </svg>
              </div>
              <p className='font-medium text-gray-500 text-[13.5px] mb-1'>ვაკანსია ვერ მოიძებნა</p>
              <p className='text-[12.5px] text-gray-400'>სცადეთ ფილტრების შეცვლა</p>
            </div>
          ) : (
            jobs.map(job => {
              const expired = isExpired(job);
              const dateRange = dateRangeLabel(job);
              return (
                <div
                  key={job.id}
                  onClick={() => !expired && navigate('/jobs/' + job.id)}
                  className={[
                    'bg-white border rounded-xl p-5 transition-all duration-200 group',
                    expired
                      ? 'border-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-100 cursor-pointer hover:border-gray-200 hover:shadow-card-md',
                  ].join(' ')}>

                  <div className='flex items-start gap-4'>
                    <CompanyAvatar company={job.employer} size='md' />

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4 mb-1.5'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h3 className='font-medium text-[14.5px] text-gray-900 group-hover:text-brand-600 transition-colors duration-150 leading-snug'>
                            {job.title}
                          </h3>
                          {expired ? (
                            <span className='text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400 font-semibold border border-gray-200'>
                              ვადა გასულია
                            </span>
                          ) : isNew(job.createdAt) ? (
                            <span className='text-[10px] px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-600 font-semibold border border-brand-100'>
                              ახალი
                            </span>
                          ) : null}
                        </div>
                        <span className='flex-shrink-0 text-[14px] font-semibold text-gray-800'>
                          {job.salaryMin.toLocaleString()}{job.salaryMax ? '–' + job.salaryMax.toLocaleString() : ''} ₾
                        </span>
                      </div>

                      <div className='flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3'>
                        <span
                          onClick={e => { e.stopPropagation(); navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-')); }}
                          className='font-medium text-gray-600 hover:text-brand-600 cursor-pointer transition-colors duration-150'>
                          {job.employer.companyName}
                        </span>
                        {job.location && (
                          <><span className='text-gray-200'>·</span><span>{job.location}</span></>
                        )}
                        {dateRange && (
                          <><span className='text-gray-200'>·</span>
                          <span className={expired ? 'text-red-400' : 'text-gray-400'}>{dateRange}</span></>
                        )}
                      </div>

                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <span className={'inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full font-medium ' + REGIME_TAG[job.jobRegime]}>
                          <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + REGIME_DOT[job.jobRegime]} />
                          {REGIME_LABELS[job.jobRegime]}
                        </span>
                        <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400'>
                          {EXP_FULL[job.experience]}
                        </span>
                        {job.category && job.category !== 'OTHER' && (
                          <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-brand-50 text-brand-500'>
                            {CATEGORY_LABELS[job.category]}
                          </span>
                        )}
                        {job.isInternship && (
                          <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-500'>
                            სტაჟირება
                          </span>
                        )}
                        <div className='ml-auto flex items-center gap-3 text-[11.5px] text-gray-300'>
                          <span className='flex items-center gap-1'>
                            <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/>
                            </svg>
                            {job.views}
                          </span>
                          <span className='flex items-center gap-1'>
                            <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
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
              );
            })
          )}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className='flex items-center justify-center py-12'>
            {loading && (
              <div className='flex items-center gap-2 text-[12px] text-gray-400'>
                <svg className='animate-spin h-3.5 w-3.5' viewBox='0 0 24 24' fill='none'>
                  <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20'/>
                  <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
                </svg>
                იტვირთება...
              </div>
            )}
          </div>
        )}

        {!hasMore && jobs.length > 0 && (
          <p className='text-center text-[11.5px] text-gray-300 py-8 tracking-wide'>
            — ყველა ვაკანსია ნაჩვენებია —
          </p>
        )}

        {/* Footer */}
        <div className='mt-16 pt-6 border-t border-gray-100 flex items-center justify-between'>
          <div>
            <div onClick={() => navigate('/')} className='cursor-pointer inline-block mb-1.5'>
              <div className='h-7 px-3 rounded-md bg-brand-600 inline-flex items-center text-white font-display font-bold text-[13px] tracking-wide'>
                Azkard
              </div>
            </div>
            <p className='text-[11px] text-gray-400'>© 2026 Azkard. ყველა უფლება დაცულია.</p>
          </div>
          <div className='flex items-center gap-5 text-[11.5px] text-gray-400'>
            <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>კონფიდენციალობა</span>
            <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>პირობები</span>
            <span className='hover:text-gray-600 cursor-pointer transition-colors duration-150'>კონტაქტი</span>
          </div>
        </div>
      </div>
    </div>
  );
}
