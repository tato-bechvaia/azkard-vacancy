import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyAvatar from './CompanyAvatar';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS    = { NONE: 'Junior', ONE_TO_THREE: '1–3 წ.', THREE_TO_FIVE: '3–5 წ.', FIVE_PLUS: '5+ წ.' };

const AUTO_INTERVAL = 4500;

function useVisibleCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640)       setCount(1);
      else if (window.innerWidth < 900)  setCount(2);
      else if (window.innerWidth < 1200) setCount(3);
      else                               setCount(4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

const fmtDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date)) return null;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
};

export default function PremiumCarousel({ jobs }) {
  const navigate     = useNavigate();
  const visibleCount = useVisibleCount();
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const maxIndex = Math.max(0, jobs.length - visibleCount);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex]);

  useEffect(() => {
    if (hovered) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [hovered, maxIndex]);

  if (!jobs?.length) return null;

  const cardWidthPct = 100 / visibleCount;
  const translateX   = -(index * cardWidthPct);

  return (
    <section className='pb-8'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2.5'>
          <span className='text-amber-400 text-[15px] leading-none select-none'>✦</span>
          <h2 className='font-display font-semibold text-[13.5px] text-white tracking-tight'>
            პრემიუმ ვაკანსიები
          </h2>
          <span className='text-[10.5px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/20 tracking-wide'>
            {jobs.length}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label='წინა'
            className='w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:border-amber-400/40 hover:text-amber-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150'>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M15 18l-6-6 6-6'/></svg>
          </button>
          <button
            onClick={next}
            disabled={index >= maxIndex}
            aria-label='შემდეგი'
            className='w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:border-amber-400/40 hover:text-amber-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150'>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M9 18l6-6-6-6'/></svg>
          </button>
        </div>
      </div>

      <div
        className='overflow-hidden'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div
          className='flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'
          style={{ transform: `translateX(${translateX}%)` }}>
          {jobs.map((job, i) => (
            <PremiumCard
              key={job.id}
              job={job}
              visible={visible}
              delay={i * 50}
              width={cardWidthPct}
              navigate={navigate}
            />
          ))}
        </div>
      </div>

      {jobs.length > visibleCount && (
        <div className='flex items-center justify-center gap-1.5 mt-4'>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`სლაიდი ${i + 1}`}
              className={
                'rounded-full transition-all duration-300 ' +
                (i === index ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/10 hover:bg-amber-400/30')
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PremiumCard({ job, visible, delay, width, navigate }) {
  const label = job.premiumBadgeLabel || '✦ Featured';
  const expiry = job.expiresAt ? fmtDate(job.expiresAt) : null;
  const posted = job.createdAt ? fmtDate(job.createdAt) : null;

  return (
    <div
      className='flex-shrink-0 pr-2.5 last:pr-0'
      style={{ width: `${width}%` }}>
      <div
        onClick={() => navigate('/jobs/' + job.id)}
        className={[
          'group relative cursor-pointer rounded-xl overflow-hidden',
          'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
          'border border-white/[0.06]',
          'hover:border-amber-400/25 hover:shadow-[0_6px_24px_rgba(251,191,36,0.10)]',
          'transition-all duration-300',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        ].join(' ')}
        style={{ transitionDelay: `${delay}ms`, transitionProperty: 'opacity, transform, border-color, box-shadow' }}>

        {/* Ambient glow */}
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
             style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)` }} />

        {/* Top accent stripe */}
        <div
          className='absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-90 transition-opacity duration-300'
          style={{ background: job.highlightColor || 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
        />

        <div className='p-4'>
          {/* Badge + Avatar */}
          <div className='flex items-start justify-between mb-3'>
            <span className='inline-flex items-center gap-1 text-[9.5px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-semibold tracking-wide border border-amber-400/15'>
              {label}
            </span>
            <CompanyAvatar company={job.employer} size='sm' />
          </div>

          {/* Title */}
          <h3 className='font-display font-semibold text-[13.5px] text-white leading-snug mb-1 group-hover:text-amber-50 transition-colors duration-200 line-clamp-2'>
            {job.title}
          </h3>

          {/* Company + location */}
          <p className='text-[11px] text-gray-500 mb-3 truncate'>
            {job.employer.companyName}
            {job.location && <span className='text-gray-700'> · {job.location}</span>}
          </p>

          {/* Tags */}
          <div className='flex items-center gap-1 flex-wrap mb-3'>
            <span className='text-[9.5px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-gray-500 border border-white/[0.07]'>
              {REGIME_LABELS[job.jobRegime]}
            </span>
            <span className='text-[9.5px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-gray-500 border border-white/[0.07]'>
              {EXP_LABELS[job.experience]}
            </span>
          </div>

          {/* Footer */}
          <div className='flex items-end justify-between'>
            <div>
              <span className='font-display font-bold text-[15px] text-white'>
                {job.salaryMin.toLocaleString()}{job.salaryMax ? '–' + job.salaryMax.toLocaleString() : ''}
                <span className='text-amber-400 ml-0.5 text-[13px]'>₾</span>
              </span>
              {posted && expiry && (
                <p className='text-[9.5px] text-gray-600 mt-0.5'>{posted} – {expiry}</p>
              )}
            </div>
            <span className='flex items-center gap-1 text-[10px] text-gray-600 group-hover:text-amber-400/60 transition-colors duration-200'>
              <span>იხილე</span>
              <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
                <path d='M5 12h14M12 5l7 7-7 7'/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
