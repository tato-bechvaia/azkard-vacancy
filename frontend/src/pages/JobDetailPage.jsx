import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_LABELS = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS    = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1–3 წელი', THREE_TO_FIVE: '3–5 წელი', FIVE_PLUS: '5+ წელი' };

const REGIME_TAG = {
  REMOTE:    'bg-teal-50 text-teal-700 border-teal-100',
  HYBRID:    'bg-blue-50 text-blue-700 border-blue-100',
  FULL_TIME: 'bg-brand-50 text-brand-600 border-brand-100',
};

export default function JobDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob]               = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile]         = useState(null);
  const [savedCv, setSavedCv]       = useState(null);
  const [applied, setApplied]       = useState(false);
  const [message, setMessage]       = useState('');

  useEffect(() => {
    api.get('/jobs/' + id).then(({ data }) => setJob(data)).catch(() => {});
    if (user?.role === 'CANDIDATE') {
      api.get('/profiles/me').then(({ data }) => {
        if (data.cvUrl) setSavedCv(data.cvUrl);
      }).catch(() => {});
    }
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (cvFile) formData.append('cv', cvFile);
      await api.post('/applications/job/' + id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApplied(true);
      setMessage('განაცხადი გაგზავნილია!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'შეცდომა');
    }
  };

  if (!job) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <div className='flex items-center gap-2 text-gray-400 text-sm'>
        <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-25'/>
          <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round' className='opacity-75'/>
        </svg>
        იტვირთება...
      </div>
    </div>
  );

  const fmtDayMonth = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
  };

  const dateRangeLabel = (j) => {
    if (!j?.startDate || !j?.endDate) return null;
    const start = fmtDayMonth(j.startDate);
    const end   = fmtDayMonth(j.endDate);
    if (!start || !end) return null;
    return `${start} – ${end}`;
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-5xl mx-auto pt-20 px-4 pb-16'>

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className='text-sm text-gray-400 hover:text-gray-700 transition-colors duration-150 mb-7 flex items-center gap-2 group'>
          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
            className='group-hover:-translate-x-0.5 transition-transform duration-150'>
            <path d='M19 12H5M12 19l-7-7 7-7'/>
          </svg>
          ვაკანსიებზე დაბრუნება
        </button>

        <div className='flex gap-7 items-start'>

          {/* ── Left: Job content ── */}
          <div className='flex-1 min-w-0'>

            {/* Header card */}
            <div className='bg-white border border-gray-100 rounded-2xl p-8 mb-4'>
              <div className='flex items-start gap-5'>
                <CompanyAvatar company={job.employer} size='lg' />
                <div className='flex-1 min-w-0'>
                  <h1 className='font-display font-semibold text-2xl text-gray-900 leading-tight mb-1'>
                    {job.title}
                  </h1>
                  <div className='flex items-center gap-2 text-sm flex-wrap'>
                    <span
                      onClick={() => navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'))}
                      className='font-medium text-gray-700 hover:text-brand-600 cursor-pointer transition-colors duration-150'>
                      {job.employer.companyName}
                    </span>
                    {job.employer.website && (
                      <>
                        <span className='text-gray-200'>·</span>
                        <a href={job.employer.website} target='_blank' rel='noreferrer'
                          className='text-brand-600 hover:underline text-xs'
                          onClick={e => e.stopPropagation()}>
                          {job.employer.website}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className='text-right flex-shrink-0'>
                  <p className='font-display font-semibold text-2xl text-teal-700'>
                    {job.salary.toLocaleString()} ₾
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>{job.currency || 'GEL'} / თვეში</p>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2 mt-6'>
                <span className={'text-xs px-3 py-1.5 rounded-full font-medium border ' + REGIME_TAG[job.jobRegime]}>
                  {REGIME_LABELS[job.jobRegime]}
                </span>
                <span className='text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.location && (
                  <span className='text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100 flex items-center gap-1'>
                    <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                    </svg>
                    {job.location}
                  </span>
                )}
                {dateRangeLabel(job) && (
                  <span className='text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100'>
                    {dateRangeLabel(job)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className='bg-white border border-gray-100 rounded-2xl p-8'>
              <h2 className='font-display font-semibold text-gray-900 mb-5'>სამუშაოს აღწერა</h2>
              <p className='text-gray-600 text-sm leading-7 whitespace-pre-line'>{job.description}</p>
            </div>
          </div>

          {/* ── Right: Sticky sidebar ── */}
          <div className='w-72 flex-shrink-0'>
            <div className='sticky top-24 flex flex-col gap-3'>

              {/* Stats strip */}
              <div className='bg-white border border-gray-100 rounded-2xl px-5 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-center flex-1'>
                    <p className='font-semibold text-gray-900 text-xl'>{job.views}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>ნახვა</p>
                  </div>
                  <div className='w-px h-8 bg-gray-100' />
                  <div className='text-center flex-1'>
                    <p className='font-semibold text-gray-900 text-xl'>{job._count?.applications || 0}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>განაცხადი</p>
                  </div>
                  <div className='w-px h-8 bg-gray-100' />
                  <div className='text-center flex-1'>
                    <p className='font-semibold text-teal-700 text-xl'>{job.salary.toLocaleString()}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>₾ / თვე</p>
                  </div>
                </div>
              </div>

              {/* Apply card */}
              {user?.role === 'CANDIDATE' && !applied && (
                <div className='bg-white border border-gray-100 rounded-2xl p-5'>
                  <h3 className='font-display font-semibold text-sm text-gray-900 mb-4'>განაცხადის გაგზავნა</h3>

                  <textarea
                    placeholder='სამოტივაციო წერილი (არასავალდებულო)...'
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    rows={4}
                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-colors duration-150 resize-none'
                  />

                  {savedCv ? (
                    <div className='bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 mb-3 flex items-center justify-between'>
                      <div>
                        <p className='text-xs text-teal-700 font-medium'>CV ავტომატურად დაერთვება</p>
                        <p className='text-xs text-teal-600/70 mt-0.5'>პროფილში შენახული</p>
                      </div>
                      <label className='text-xs text-teal-600 cursor-pointer hover:underline'>
                        <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setCvFile(e.target.files[0])} />
                        შეცვლა
                      </label>
                    </div>
                  ) : (
                    <label className={'flex items-center gap-3 h-11 px-4 rounded-xl border cursor-pointer transition-colors duration-150 mb-3 ' +
                      (cvFile ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300')}>
                      <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setCvFile(e.target.files[0])} />
                      <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={cvFile ? '#0D9488' : '#9CA3AF'} strokeWidth='2'>
                        <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                      </svg>
                      <span className={'text-sm ' + (cvFile ? 'text-teal-700 font-medium' : 'text-gray-400')}>
                        {cvFile ? cvFile.name : 'CV-ის ატვირთვა'}
                      </span>
                    </label>
                  )}

                  <button
                    onClick={handleApply}
                    className='w-full h-11 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors duration-150'>
                    განაცხადის გაგზავნა
                  </button>

                  {message && !applied && (
                    <p className='text-center text-xs text-red-500 mt-3'>{message}</p>
                  )}
                </div>
              )}

              {user?.role === 'CANDIDATE' && applied && (
                <div className='bg-teal-50 border border-teal-100 rounded-2xl p-5 text-center'>
                  <div className='w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-2'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#0D9488' strokeWidth='2'>
                      <polyline points='20 6 9 17 4 12'/>
                    </svg>
                  </div>
                  <p className='text-teal-700 text-sm font-semibold'>განაცხადი გაგზავნილია</p>
                  <p className='text-teal-600/70 text-xs mt-1'>მოლოდინში გახდება სტატუსი</p>
                </div>
              )}

              {!user && (
                <div className='bg-white border border-gray-100 rounded-2xl p-5 text-center'>
                  <div className='w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3'>
                    <svg width='18' height='18' viewBox='0 0 16 16' fill='none' stroke='#6B46E0' strokeWidth='1.5'>
                      <circle cx='8' cy='5' r='3'/><path d='M2 14c0-4 2.5-6 6-6s6 2 6 6'/>
                    </svg>
                  </div>
                  <p className='text-gray-500 text-sm mb-4'>განაცხადის გასაგზავნად შედით სისტემაში</p>
                  <button
                    onClick={() => navigate('/login')}
                    className='w-full h-11 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors duration-150'>
                    შესვლა
                  </button>
                </div>
              )}

              {/* Other company jobs */}
              {job.employer.jobCount > 1 && (
                <button
                  onClick={() => navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'))}
                  className='w-full bg-white border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 rounded-2xl px-5 py-4 text-sm text-gray-600 hover:text-brand-600 transition-all duration-150 text-left flex items-center justify-between group'>
                  <span>
                    <span className='font-medium'>{job.employer.companyName}</span>
                    <span className='text-gray-400'>-ის სხვა ვაკანსიები</span>
                  </span>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
                    className='group-hover:translate-x-0.5 transition-transform duration-150'>
                    <path d='M5 12h14M12 5l7 7-7 7'/>
                  </svg>
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
