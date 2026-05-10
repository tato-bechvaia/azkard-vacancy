import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Card, Badge, Tag, Button } from '../components/ui';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS    = { NONE: 'გამოცდ. გარეშე', ONE_TO_THREE: '1–3 წ.', THREE_TO_FIVE: '3–5 წ.', FIVE_PLUS: '5+ წ.' };

const REGIME_TAG_VARIANT = {
  REMOTE:    'teal',
  HYBRID:    'blue',
  FULL_TIME: 'violet',
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
    <div className='min-h-screen bg-surface flex items-center justify-center'>
      <div className='flex items-center gap-3 text-text-muted text-sm font-medium'>
        <svg className='animate-spin h-5 w-5 text-brand-500' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-10'/>
          <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
        </svg>
        იტვირთება...
      </div>
    </div>
  );

  if (!company) return (
    <div className='min-h-screen bg-surface flex items-center justify-center p-6'>
      <Card className='text-center max-w-sm w-full py-12 border-dashed'>
        <p className='font-display font-bold text-lg text-text-primary mb-2'>კომპანია ვერ მოიძებნა</p>
        <p className='text-sm text-text-muted mb-8'>შესაძლოა ბმული არასწორია ან კომპანიამ წაშალა პროფილი</p>
        <Button onClick={() => navigate('/')} variant='primary' size='md'>
          ვაკანსიებზე დაბრუნება
        </Button>
      </Card>
    </div>
  );

  return (
    <div className='min-h-screen bg-surface'>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className='bg-surface-50 border-b border-border-subtle pt-[5.25rem]'>
        <div className='max-w-4xl mx-auto px-6 pt-12 pb-14'>

          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-brand-400 transition-colors duration-150 mb-10 group'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'
              className='group-hover:-translate-x-1 transition-transform duration-150'>
              <path d='M19 12H5M12 19l-7-7 7-7'/>
            </svg>
            ვაკანსიებზე დაბრუნება
          </button>

          <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
            <div className='flex items-center gap-6'>
              {/* Company logo */}
              {company.avatarUrl && !headerAvatarError ? (
                <img
                  src={assetUrl(company.avatarUrl)}
                  alt={company.companyName}
                  onError={() => setHeaderAvatarError(true)}
                  className='w-[80px] h-[80px] rounded-3xl object-cover border border-border-subtle shadow-xl shadow-black/20 flex-shrink-0'
                />
              ) : (
                <div className='w-[80px] h-[80px] rounded-3xl bg-brand-600/10 border border-brand-400/20 flex items-center justify-center font-display font-black text-brand-400 text-3xl flex-shrink-0 shadow-lg'>
                  {company.companyName.charAt(0)}
                </div>
              )}

              <div>
                <h1 className='font-display font-black text-3xl text-text-primary leading-tight tracking-tight mb-2'>
                  {company.companyName}
                </h1>
                {company.website && (
                  <a
                    href={company.website}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors duration-150 flex items-center gap-1.5 group/link'>
                    {company.website.replace(/^https?:\/\//, '')}
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' className='group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform'>
                      <path d='M7 17L17 7M17 7H7M17 7V17'/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className='flex items-center gap-10 border-l border-border-subtle pl-10 md:border-none md:pl-0'>
              <div className='text-center md:text-right'>
                <p className='font-display font-black text-2xl text-text-primary leading-none'>{company.jobs.length}</p>
                <p className='text-[10px] text-text-muted uppercase tracking-[0.2em] font-black mt-2'>ვაკანსია</p>
              </div>
            </div>
          </div>

          {company.description && (
            <p className='text-text-secondary text-md leading-[1.8] mt-10 max-w-2xl opacity-90'>
              {company.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Jobs ─────────────────────────────────────────── */}
      <div className='max-w-4xl mx-auto px-6 py-12'>

        <div className='flex items-center justify-between mb-8'>
          <h2 className='font-display font-bold text-xl text-text-primary tracking-tight'>
            აქტიური ვაკანსიები
            <span className='ml-3 font-sans font-medium text-sm text-text-muted bg-surface-100 px-2 py-0.5 rounded-full border border-border-subtle'>
              {company.jobs.length}
            </span>
          </h2>
        </div>

        <div className='flex flex-col gap-4'>
          {company.jobs.map(job => (
            <Link
              key={job.id}
              to={'/jobs/' + job.id}
              className='block no-underline text-inherit group'>
              
              <Card variant='interactive' padding='lg' className='group-hover:border-brand-500/30 transition-all duration-300'>
                <div className='flex items-start justify-between gap-4 mb-5'>
                  <div>
                    <h3 className='font-bold text-lg text-text-primary group-hover:text-brand-400 transition-colors duration-200 leading-snug tracking-tight mb-1'>
                      {job.title}
                    </h3>
                    <div className='flex items-center gap-2 text-xs text-text-muted font-medium'>
                      {job.location && (
                        <>
                          <span className='flex items-center gap-1'>
                            <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                            </svg>
                            {job.location}
                          </span>
                          <span className='opacity-30'>·</span>
                        </>
                      )}
                      <span>{dateRangeLabel(job) || 'მუდმივი'}</span>
                    </div>
                  </div>
                  <p className='font-black text-lg text-text-primary tracking-tighter'>
                    {job.salary?.toLocaleString()} ₾
                  </p>
                </div>

                <div className='flex items-center gap-2 flex-wrap'>
                  <Tag variant={REGIME_TAG_VARIANT[job.jobRegime] || 'default'} dot>
                    {REGIME_LABELS[job.jobRegime]}
                  </Tag>
                  <Tag variant='default'>
                    {EXP_LABELS[job.experience]}
                  </Tag>
                  
                  <div className='ml-auto flex items-center gap-1.5 text-[11px] font-bold text-text-muted opacity-40 uppercase tracking-widest'>
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                      <path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/>
                      <path d='M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75'/>
                    </svg>
                    {job._count?.applications || 0}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {company.jobs.length === 0 && (
            <Card className='text-center py-20 bg-surface-50/50 border-dashed'>
              <div className='w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-text-muted'>
                  <path d='M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z'/><polyline points='13 2 13 9 20 9'/>
                </svg>
              </div>
              <p className='text-md font-bold text-text-primary mb-1'>აქტიური ვაკანსია არ არის</p>
              <p className='text-sm text-text-muted'>ამჟამად კომპანიას არ აქვს გამოქვეყნებული ვაკანსიები</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
