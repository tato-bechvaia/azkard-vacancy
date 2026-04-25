import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CompanyAvatar from './CompanyAvatar';

const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700',
  HYBRID:    'bg-blue-50 text-blue-700',
  FULL_TIME: 'bg-gray-100 text-gray-600',
};
const REGIME_LABELS = { REMOTE: 'დისტ.', HYBRID: 'ჰიბრ.', FULL_TIME: 'ადგ.' };
const EXP_LABELS    = { NONE: 'Junior', ONE_TO_THREE: '1–3 წ.', THREE_TO_FIVE: '3–5 წ.', FIVE_PLUS: '5+ წ.' };
const CATEGORY_LABELS = {
  IT: 'IT', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი', FINANCE: 'ფინანსები',
  DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი', LOGISTICS: 'ლოჯისტიკა',
  HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება', HOSPITALITY: 'სტუმართმ.', OTHER: 'სხვა',
};

const fmtDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date)) return null;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
};

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

/**
 * Reusable carousel section.
 *
 * Props:
 *  title       – section heading (string)
 *  icon        – emoji or short text shown before the title
 *  accentColor – tailwind color class suffix or hex, used for pill bg (default blue)
 *  jobs        – array of job objects
 *  dark        – render on dark background
 */
export default function CarouselSection({ title, icon, jobs = [], dark = false, badge }) {
  const navigate     = useNavigate();
  const visibleCount = useVisibleCount();
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => { setIndex(0); }, [jobs]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const maxIndex = Math.max(0, jobs.length - visibleCount);

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex]);

  useEffect(() => {
    if (hovered || jobs.length <= visibleCount) return;
    timerRef.current = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1));
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [hovered, maxIndex, jobs.length, visibleCount]);

  if (!jobs.length) return null;

  const cardWidthPct = 100 / visibleCount;
  const translateX   = -(index * cardWidthPct);

  const textMain  = dark ? 'text-white'      : 'text-gray-900';
  const textSub   = dark ? 'text-gray-400'   : 'text-gray-500';
  const btnBorder = dark ? 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700';
  const dotActive = dark ? 'bg-white/60'     : 'bg-gray-800';
  const dotIdle   = dark ? 'bg-white/15'     : 'bg-gray-200';

  return (
    <section>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2.5'>
          {icon && <span className='text-[15px] leading-none select-none'>{icon}</span>}
          <h2 className={`font-display font-semibold text-[13.5px] tracking-tight ${textMain}`}>{title}</h2>
          {badge !== undefined && (
            <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-semibold border tracking-wide ${
              dark
                ? 'bg-white/[0.07] text-gray-400 border-white/[0.08]'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {badge ?? jobs.length}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1.5'>
          <button
            onClick={prev}
            disabled={index === 0}
            aria-label='წინა'
            className={`w-7 h-7 flex items-center justify-center rounded-lg border disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 ${btnBorder}`}>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M15 18l-6-6 6-6'/></svg>
          </button>
          <button
            onClick={next}
            disabled={index >= maxIndex}
            aria-label='შემდეგი'
            className={`w-7 h-7 flex items-center justify-center rounded-lg border disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 ${btnBorder}`}>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><path d='M9 18l6-6-6-6'/></svg>
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        className='overflow-hidden'
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div
          className='flex transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'
          style={{ transform: `translateX(${translateX}%)` }}>
          {jobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              visible={visible}
              delay={i * 40}
              width={cardWidthPct}
              dark={dark}
              navigate={navigate}
            />
          ))}
        </div>
      </div>

      {/* Dots */}
      {jobs.length > visibleCount && (
        <div className='flex items-center justify-center gap-1.5 mt-4'>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`სლაიდი ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === index ? `w-4 h-1.5 ${dotActive}` : `w-1.5 h-1.5 ${dotIdle} hover:opacity-60`}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function JobCard({ job, visible, delay, width, dark, navigate }) {
  const posted = fmtDate(job.createdAt);
  const expiry = fmtDate(job.expiresAt);

  const cardBase = dark
    ? 'bg-white/[0.04] border-white/[0.07] hover:border-white/20 hover:bg-white/[0.07]'
    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm';

  const titleColor   = dark ? 'text-white group-hover:text-gray-100' : 'text-gray-900 group-hover:text-brand-600';
  const companyColor = dark ? 'text-gray-400' : 'text-gray-500';
  const salaryColor  = dark ? 'text-white'    : 'text-gray-900';
  const metaColor    = dark ? 'text-gray-600' : 'text-gray-400';

  return (
    <div
      className='flex-shrink-0 pr-2.5 last:pr-0'
      style={{ width: `${width}%` }}>
      <Link
        to={'/jobs/' + job.id}
        className={[
          'group block cursor-pointer rounded-xl border p-4 transition-all duration-200 no-underline text-inherit',
          cardBase,
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        ].join(' ')}
        style={{ transitionDelay: `${delay}ms`, transitionProperty: 'opacity, transform, border-color, background-color, box-shadow' }}>

        {/* Top row: avatar + salary */}
        <div className='flex items-start justify-between gap-2 mb-3'>
          <CompanyAvatar company={job.employer} size='sm' />
          <span className={`font-semibold text-[13px] flex-shrink-0 ${salaryColor}`}>
            {job.salary.toLocaleString()} ₾
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-medium text-[13px] leading-snug mb-1 transition-colors duration-150 line-clamp-2 ${titleColor}`}>
          {job.title}
        </h3>

        {/* Company */}
        <p className={`text-[11px] mb-3 truncate ${companyColor}`}>
          {job.employer.companyName}
          {job.location && <span className='opacity-60'> · {job.location}</span>}
        </p>

        {/* Tags */}
        <div className='flex items-center gap-1 flex-wrap mb-3'>
          <span className={`inline-flex items-center text-[9.5px] px-1.5 py-0.5 rounded-full font-medium ${
            dark
              ? 'bg-white/[0.06] text-gray-400 border border-white/[0.08]'
              : REGIME_TAG[job.jobRegime]
          }`}>
            {REGIME_LABELS[job.jobRegime]}
          </span>
          {job.isInternship && (
            <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-medium ${
              dark ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-50 text-violet-600'
            }`}>
              სტაჟ.
            </span>
          )}
          {job.isForStudents && !job.isInternship && (
            <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-medium ${
              dark ? 'bg-green-500/15 text-green-300 border border-green-500/20' : 'bg-green-50 text-green-600'
            }`}>
              სტუდ.
            </span>
          )}
          {job.category && job.category !== 'OTHER' && (
            <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full ${
              dark ? 'bg-white/[0.05] text-gray-500 border border-white/[0.06]' : 'bg-gray-50 text-gray-400'
            }`}>
              {CATEGORY_LABELS[job.category]}
            </span>
          )}
        </div>

        {/* Date range */}
        {posted && expiry && (
          <p className={`text-[9.5px] ${metaColor}`}>{posted} – {expiry}</p>
        )}
      </Link>
    </div>
  );
}
