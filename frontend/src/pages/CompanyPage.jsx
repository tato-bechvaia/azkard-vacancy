import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS    = { NONE: 'გამოცდ. გარეშე', ONE_TO_THREE: '1–3 წ.', THREE_TO_FIVE: '3–5 წ.', FIVE_PLUS: '5+ წ.' };

const REGIME_DOT = {
  REMOTE:    'bg-teal-400',
  HYBRID:    'bg-blue-400',
  FULL_TIME: 'bg-violet-400',
};

const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700',
  HYBRID:    'bg-blue-50 text-blue-700',
  FULL_TIME: 'bg-gray-100 text-gray-600',
};

export default function CompanyPage() {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const [company, setCompany]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);

  useEffect(() => {
    api.get('/profiles/company/' + slug)
      .then(({ data }) => { setCompany(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  useEffect(() => {
    setHeaderAvatarError(false);
  }, [company?.avatarUrl]);

  const fmtDayMonth = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  };

  const dateRangeLabel = (job) => {
    if (!job?.startDate || !job?.endDate) return null;
    return `${fmtDayMonth(job.startDate)} – ${fmtDayMonth(job.endDate)}`;
  };

  if (loading) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <div className='flex items-center gap-2 text-gray-400 text-[13px]'>
        <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20'/>
          <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
        </svg>
        იტვირთება...
      </div>
    </div>
  );

  if (!company) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <div className='text-center'>
        <p className='font-display font-semibold text-[18px] text-gray-900 mb-2'>კომპანია ვერ მოიძებნა</p>
        <button onClick={() => navigate('/')} className='text-[13px] text-brand-600 hover:underline'>
          ვაკანსიებზე დაბრუნება
        </button>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className='bg-gray-950 pt-14'>
        <div className='max-w-4xl mx-auto px-6 pt-10 pb-12'>

          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-300 transition-colors duration-150 mb-8 group'>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
              className='group-hover:-translate-x-0.5 transition-transform duration-150'>
              <path d='M19 12H5M12 19l-7-7 7-7'/>
            </svg>
            ვაკანსიებზე დაბრუნება
          </button>

          <div className='flex items-center gap-5'>
            {/* Company logo */}
            {company.avatarUrl && !headerAvatarError ? (
              <img
                src={assetUrl(company.avatarUrl)}
                alt={company.companyName}
                onError={() => setHeaderAvatarError(true)}
                className='w-[60px] h-[60px] rounded-2xl object-cover border border-white/10 flex-shrink-0'
              />
            ) : (
              <div className='w-[60px] h-[60px] rounded-2xl bg-white/[0.07] border border-white/10 flex items-center justify-center font-display font-bold text-white text-2xl flex-shrink-0'>
                {company.companyName.charAt(0)}
              </div>
            )}

            <div>
              <h1 className='font-display font-semibold text-[1.7rem] text-white leading-tight tracking-tight'>
                {company.companyName}
              </h1>
              {company.website && (
                <a
                  href={company.website}
                  target='_blank'
                  rel='noreferrer'
                  className='text-[12.5px] text-brand-400/80 hover:text-brand-400 transition-colors duration-150 mt-1 inline-block'>
                  {company.website} ↗
                </a>
              )}
            </div>
          </div>

          {company.description && (
            <p className='text-gray-400 text-[13.5px] leading-[1.8] mt-6 max-w-xl'>
              {company.description}
            </p>
          )}

          {/* Stats bar */}
          <div className='flex items-center gap-6 mt-8'>
            <div>
              <p className='font-semibold text-white text-[18px] leading-none'>{company.jobs.length}</p>
              <p className='text-[11px] text-gray-500 uppercase tracking-wider mt-1'>ვაკანსია</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Jobs ─────────────────────────────────────────── */}
      <div className='max-w-4xl mx-auto px-6 py-8'>

        <div className='flex items-center justify-between mb-5'>
          <p className='font-semibold text-[14px] text-gray-900'>
            აქტიური ვაკანსიები
            <span className='ml-2 font-normal text-[12.5px] text-gray-400'>({company.jobs.length})</span>
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          {company.jobs.map(job => (
            <div
              key={job.id}
              onClick={() => navigate('/jobs/' + job.id)}
              className='bg-white border border-gray-100 rounded-xl p-5 cursor-pointer hover:border-gray-200 hover:shadow-card-md transition-all duration-200 group'>

              <div className='flex items-start justify-between gap-4 mb-3'>
                <h3 className='font-medium text-[14.5px] text-gray-900 group-hover:text-brand-600 transition-colors duration-150 leading-snug'>
                  {job.title}
                </h3>
                <p className='font-semibold text-[14px] text-gray-800 flex-shrink-0'>
                  {job.salaryMin?.toLocaleString()} ₾
                </p>
              </div>

              <div className='flex items-center gap-1.5 flex-wrap'>
                <span className={'inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full font-medium ' + REGIME_TAG[job.jobRegime]}>
                  <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + REGIME_DOT[job.jobRegime]} />
                  {REGIME_LABELS[job.jobRegime]}
                </span>
                <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.location && (
                  <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 inline-flex items-center gap-1'>
                    <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                    </svg>
                    {job.location}
                  </span>
                )}
                {dateRangeLabel(job) && (
                  <span className='text-[11.5px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-400'>
                    {dateRangeLabel(job)}
                  </span>
                )}
                <span className='ml-auto text-[11.5px] text-gray-300 flex items-center gap-1'>
                  <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/>
                    <path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'/>
                  </svg>
                  {job._count?.applications || 0}
                </span>
              </div>
            </div>
          ))}

          {company.jobs.length === 0 && (
            <div className='bg-white border border-gray-100 rounded-xl text-center py-14'>
              <p className='text-[13px] text-gray-400'>ამჟამად აქტიური ვაკანსია არ არის</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
