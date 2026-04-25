import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyAvatar from '../CompanyAvatar';
import { REGIME_LABELS, fmtDate } from '../../utils/constants';

const AUTO_INTERVAL = 5000;

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

function PremiumPlusCard({ job, width }) {
  const navigate = useNavigate();
  const posted = fmtDate(job.createdAt);

  return (
    <div className='flex-shrink-0 pr-3 last:pr-0' style={{ width: `${width}%` }}>
      <div
        onClick={() => navigate('/jobs/' + job.id)}
        className='group relative cursor-pointer rounded-2xl overflow-hidden bg-surface-50 border border-brand-500/20 hover:border-brand-400/40 transition-all duration-300 hover:shadow-glow-brand'
      >
        {/* Top gradient accent */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-amber-400 to-brand-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300' />

        <div className='p-5'>
          {/* Badge + Avatar */}
          <div className='flex items-start justify-between mb-4'>
            <span className='inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-brand-600/20 to-amber-500/20 text-brand-400 border border-brand-400/20 font-bold tracking-wider uppercase'>
              <svg width='10' height='10' viewBox='0 0 24 24' fill='currentColor' className='text-amber-400'>
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
              </svg>
              Premium+
            </span>
            <CompanyAvatar company={job.employer} size='sm' />
          </div>

          {/* Title */}
          <h3 className='font-display font-bold text-md text-text-primary group-hover:text-brand-400 transition-colors duration-200 leading-snug line-clamp-2 mb-2'>
            {job.title}
          </h3>

          {/* Company + Location */}
          <p className='text-xs text-text-muted mb-3 truncate'>
            {job.employer?.companyName}
            {job.location && <span className='opacity-60'> · {job.location}</span>}
          </p>

          {/* Regime tag */}
          {job.jobRegime && (
            <div className='mb-3'>
              <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-text-secondary border border-border font-medium'>
                {REGIME_LABELS[job.jobRegime]}
              </span>
            </div>
          )}

          {/* Footer: salary + date */}
          <div className='flex items-end justify-between pt-2 border-t border-border-subtle'>
            <div>
              <span className='font-display font-bold text-lg text-text-primary'>
                {job.salary?.toLocaleString()}
                <span className='text-brand-400 ml-1 text-sm'>₾</span>
              </span>
              {posted && (
                <p className='text-[9.5px] text-text-muted mt-0.5'>{posted}</p>
              )}
            </div>
            <span className='flex items-center gap-1 text-[10px] text-text-muted group-hover:text-brand-400 transition-colors duration-200'>
              იხილე
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

export default function PremiumPlusCarousel({ jobs }) {
  const visibleCount = useVisibleCount();
  const [index, setIndex]     = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  const maxIndex = Math.max(0, (jobs?.length || 0) - visibleCount);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex]);

  useEffect(() => {
    if (hovered || !jobs?.length) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [hovered, maxIndex, jobs?.length]);

  if (!jobs || jobs.length === 0) return null;

  const cardWidthPct = 100 / visibleCount;
  const translateX = -(index * cardWidthPct);

  return (
    <div className='border-b border-border-subtle bg-gradient-to-b from-surface-50/50 to-transparent'>
      <div className='max-w-6xl mx-auto px-6 py-6'>
        {/* Section label + nav controls */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' className='text-amber-400'>
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
            </svg>
            <p className='text-xs text-text-muted uppercase tracking-widest font-semibold'>
              Premium+ ვაკანსიები
            </p>
            <span className='text-[10px] px-2 py-0.5 rounded-full bg-brand-600/15 text-brand-400 border border-brand-400/20 font-bold'>
              {jobs.length}
            </span>
          </div>

          {jobs.length > visibleCount && (
            <div className='flex items-center gap-1.5'>
              <button
                onClick={prev}
                disabled={index === 0}
                aria-label='წინა'
                className='w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-brand-400/40 hover:text-brand-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150'>
                <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M15 18l-6-6 6-6'/></svg>
              </button>
              <button
                onClick={next}
                disabled={index >= maxIndex}
                aria-label='შემდეგი'
                className='w-7 h-7 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-brand-400/40 hover:text-brand-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150'>
                <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M9 18l6-6-6-6'/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div
          className='overflow-hidden'
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className='flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {jobs.map(job => (
              <PremiumPlusCard key={job.id} job={job} width={cardWidthPct} />
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        {jobs.length > visibleCount && (
          <div className='flex items-center justify-center gap-1.5 mt-4'>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`სლაიდი ${i + 1}`}
                className={
                  'rounded-full transition-all duration-300 ' +
                  (i === index ? 'w-4 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-text-muted/20 hover:bg-brand-400/30')
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
