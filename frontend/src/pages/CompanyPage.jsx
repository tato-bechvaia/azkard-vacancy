import { useEffect, useState } from 'react';
import { assetUrl } from '../utils/assetUrl';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS    = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1-3 წელი', THREE_TO_FIVE: '3-5 წელი', FIVE_PLUS: '5+ წელი' };

export default function CompanyPage() {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);

  useEffect(() => {
    api.get('/profiles/company/' + slug)
      .then(({ data }) => { setCompany(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]); 

  useEffect(() => {
    setHeaderAvatarError(false);
  }, [company?.avatarUrl]);

  if (loading) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <p className='text-gray-400 text-sm'>იტვირთება...</p>
    </div>
  );

  if (!company) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <div className='text-center'>
        <p className='font-display font-semibold text-xl text-gray-900 mb-2'>კომპანია ვერ მოიძებნა</p>
        <button onClick={() => navigate('/')} className='text-brand-600 text-sm hover:underline'>
          უკან
        </button>
      </div>
    </div>
  );

  const regimeTag = (r) => {
    if (r === 'REMOTE') return 'bg-teal-50 text-teal-700 border-teal-200';
    if (r === 'HYBRID') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const fmtDayMonth = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ka-GE', { day: '2-digit', month: 'short' }).format(date);
  };

  const dateRangeLabel = (job) => {
    if (!job?.startDate || !job?.endDate) return null;
    return `${fmtDayMonth(job.startDate)}–${fmtDayMonth(job.endDate)}`;
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-3xl mx-auto pt-20 px-4 pb-10'>
        <button
          onClick={() => navigate('/')}
          className='text-sm text-gray-400 hover:text-gray-900 transition mb-6 flex items-center gap-1'>
          ← უკან
        </button>

        {/* Company header */}
        <div className='bg-white border border-surface-200 rounded-2xl p-6 mb-4'>
          <div className='flex items-center gap-4 mb-4'>
            {company.avatarUrl && !headerAvatarError ? (
              <img
                src={assetUrl(company.avatarUrl)}
                alt={company.companyName}
                onError={() => setHeaderAvatarError(true)}
                className='w-16 h-16 rounded-xl object-cover border border-surface-200'
              />
            ) : (
              <div className='w-16 h-16 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-semibold text-brand-600 text-2xl'>
                {company.companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className='font-display font-semibold text-xl text-gray-900'>{company.companyName}</h1>
              {company.website && (
                <a
                  href={company.website}
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm text-brand-600 hover:underline'>
                  {company.website}
                </a>
              )}
            </div>
          </div>
          {company.description && (
            <p className='text-sm text-gray-600 leading-relaxed'>{company.description}</p>
          )}
        </div>

        {/* Jobs */}
        <div className='flex items-center justify-between mb-3'>
          <p className='font-display font-semibold text-gray-900'>
            აქტიური ვაკანსიები ({company.jobs.length})
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          {company.jobs.map(job => (
            <div
              key={job.id}
              onClick={() => navigate('/jobs/' + job.id)}
              className='bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-gray-300 transition-colors duration-150 group'>
              <div className='flex items-start justify-between gap-4 mb-2'>
                <p className='font-display font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition'>
                  {job.title}
                </p>
                <p className='font-display font-semibold text-sm text-gray-900 flex-shrink-0'>
                  {job.salary.toLocaleString()} ₾
                </p>
              </div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className={'text-xs px-2 py-0.5 rounded border ' + regimeTag(job.jobRegime)}>
                  {REGIME_LABELS[job.jobRegime]}
                </span>
                <span className='text-xs px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.location && (
                  <span className='text-xs px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200'>
                    {job.location}
                  </span>
                )}
                {dateRangeLabel(job) && (
                  <span className='text-xs px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200'>
                    {dateRangeLabel(job)}
                  </span>
                )}
                <span className='text-xs text-gray-400 ml-auto'>
                  განაცხადი: {job._count?.applications || 0}
                </span>
              </div>
            </div>
          ))}
          {company.jobs.length === 0 && (
            <div className='text-center py-12 text-gray-400 text-sm'>
              აქტიური ვაკანსია არ არის
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

