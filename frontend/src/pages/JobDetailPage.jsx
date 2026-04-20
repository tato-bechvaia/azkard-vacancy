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
  FULL_TIME: 'bg-gray-100 text-gray-600 border-gray-200',
};

const REGIME_DOT = {
  REMOTE:    'bg-teal-400',
  HYBRID:    'bg-blue-400',
  FULL_TIME: 'bg-violet-400',
};

export default function JobDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob]                 = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile]           = useState(null);
  const [savedCv, setSavedCv]         = useState(null);
  const [applied, setApplied]         = useState(false);
  const [message, setMessage]         = useState('');

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
      <div className='flex items-center gap-2 text-gray-400 text-[13px]'>
        <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
          <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20'/>
          <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
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

      <div className='max-w-5xl mx-auto pt-20 px-5 pb-16'>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className='inline-flex items-center gap-1.5 text-[12.5px] text-gray-400 hover:text-gray-700 transition-colors duration-150 mb-8 group'>
          <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
            className='group-hover:-translate-x-0.5 transition-transform duration-150'>
            <path d='M19 12H5M12 19l-7-7 7-7'/>
          </svg>
          ვაკანსიებზე დაბრუნება
        </button>

        <div className='flex gap-6 items-start'>

          {/* ── Left column ─────────────────────────────────── */}
          <div className='flex-1 min-w-0'>

            {/* Header */}
            <div className='bg-white border border-gray-100 rounded-2xl p-8 mb-3'>
              <div className='flex items-start gap-5 mb-7'>
                <CompanyAvatar company={job.employer} size='lg' />
                <div className='flex-1 min-w-0 pt-0.5'>
                  <h1 className='font-display font-semibold text-[1.6rem] text-gray-900 leading-tight tracking-tight mb-2'>
                    {job.title}
                  </h1>
                  <div className='flex items-center gap-2 text-[13px]'>
                    <span
                      onClick={() => navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'))}
                      className='font-medium text-gray-600 hover:text-brand-600 cursor-pointer transition-colors duration-150'>
                      {job.employer.companyName}
                    </span>
                    {job.employer.website && (
                      <>
                        <span className='text-gray-200'>·</span>
                        <a href={job.employer.website} target='_blank' rel='noreferrer'
                          className='text-brand-600 hover:underline text-[12px]'
                          onClick={e => e.stopPropagation()}>
                          {job.employer.website}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className='text-right flex-shrink-0 pt-0.5'>
                  <p className='font-display font-semibold text-[1.75rem] text-gray-900 leading-none'>
                    {job.salaryMin.toLocaleString()}{job.salaryMax ? '–' + job.salaryMax.toLocaleString() : ''}
                    <span className='text-[1.1rem] text-gray-500 ml-1'>₾</span>
                  </p>
                  <p className='text-[11.5px] text-gray-400 mt-1.5'>{job.currency || 'GEL'} / თვეში</p>
                </div>
              </div>

              {/* Meta tags */}
              <div className='flex flex-wrap gap-2'>
                <span className={'inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full font-medium border ' + REGIME_TAG[job.jobRegime]}>
                  <span className={'w-1.5 h-1.5 rounded-full ' + REGIME_DOT[job.jobRegime]} />
                  {REGIME_LABELS[job.jobRegime]}
                </span>
                <span className='text-[12px] px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.location && (
                  <span className='text-[12px] px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 inline-flex items-center gap-1.5'>
                    <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/>
                    </svg>
                    {job.location}
                  </span>
                )}
                {dateRangeLabel(job) && (
                  <span className='text-[12px] px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 inline-flex items-center gap-1.5'>
                    <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/>
                    </svg>
                    {dateRangeLabel(job)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className='bg-white border border-gray-100 rounded-2xl p-8'>
              <h2 className='font-display font-semibold text-[15px] text-gray-900 mb-5 tracking-tight'>
                სამუშაოს აღწერა
              </h2>
              <div className='text-gray-600 text-[13.5px] leading-[1.85] whitespace-pre-line'>
                {job.description}
              </div>
            </div>

          </div>

          {/* ── Right sidebar ────────────────────────────────── */}
          <div className='w-[268px] flex-shrink-0'>
            <div className='sticky top-24 flex flex-col gap-2.5'>

              {/* Stats */}
              <div className='bg-white border border-gray-100 rounded-2xl px-5 py-4'>
                <div className='flex items-center'>
                  <div className='flex-1 text-center'>
                    <p className='font-semibold text-gray-900 text-[18px] leading-none mb-1'>{job.views}</p>
                    <p className='text-[11px] text-gray-400 uppercase tracking-wider'>ნახვა</p>
                  </div>
                  <div className='w-px h-7 bg-gray-100' />
                  <div className='flex-1 text-center'>
                    <p className='font-semibold text-gray-900 text-[18px] leading-none mb-1'>{job._count?.applications || 0}</p>
                    <p className='text-[11px] text-gray-400 uppercase tracking-wider'>განაცხადი</p>
                  </div>
                  <div className='w-px h-7 bg-gray-100' />
                  <div className='flex-1 text-center'>
                    <p className='font-semibold text-gray-900 text-[18px] leading-none mb-1'>{job.salaryMin.toLocaleString()}</p>
                    <p className='text-[11px] text-gray-400 uppercase tracking-wider'>₾ / თვე</p>
                  </div>
                </div>
              </div>

              {/* Apply card — candidate, not yet applied */}
              {user?.role === 'CANDIDATE' && !applied && (
                <div className='bg-white border border-gray-100 rounded-2xl p-5'>
                  <h3 className='font-semibold text-[13.5px] text-gray-900 mb-4 tracking-tight'>
                    განაცხადის გაგზავნა
                  </h3>

                  <textarea
                    placeholder='სამოტივაციო წერილი (სურვილისამებრ)...'
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    rows={4}
                    className='w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-[13px] text-gray-700 mb-3 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100/60 focus:bg-white transition-all duration-150 resize-none placeholder-gray-400'
                  />

                  {savedCv ? (
                    <div className='bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 mb-3 flex items-center justify-between'>
                      <div>
                        <p className='text-[12px] text-teal-700 font-medium'>CV ავტომატურად დაერთვება</p>
                        <p className='text-[11.5px] text-teal-600/60 mt-0.5'>პროფილში შენახული</p>
                      </div>
                      <label className='text-[12px] text-teal-600 cursor-pointer hover:underline'>
                        <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setCvFile(e.target.files[0])} />
                        შეცვლა
                      </label>
                    </div>
                  ) : (
                    <label className={'flex items-center gap-3 h-10 px-4 rounded-xl border cursor-pointer transition-all duration-150 mb-3 ' +
                      (cvFile ? 'bg-teal-50 border-teal-200' : 'bg-surface-50 border-surface-200 hover:border-gray-300')}>
                      <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setCvFile(e.target.files[0])} />
                      <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke={cvFile ? '#0D9488' : '#9CA3AF'} strokeWidth='1.75'>
                        <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                      </svg>
                      <span className={'text-[13px] ' + (cvFile ? 'text-teal-700 font-medium' : 'text-gray-400')}>
                        {cvFile ? cvFile.name : 'CV-ის ატვირთვა'}
                      </span>
                    </label>
                  )}

                  <button
                    onClick={handleApply}
                    className='w-full h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-[13px] transition-colors duration-150'>
                    განაცხადის გაგზავნა
                  </button>

                  {message && !applied && (
                    <p className='text-center text-[12px] text-red-500 mt-3'>{message}</p>
                  )}
                </div>
              )}

              {/* Success */}
              {user?.role === 'CANDIDATE' && applied && (
                <div className='bg-white border border-gray-100 rounded-2xl p-6 text-center'>
                  <div className='w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-3'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#0D9488' strokeWidth='2.5'>
                      <polyline points='20 6 9 17 4 12'/>
                    </svg>
                  </div>
                  <p className='font-semibold text-gray-800 text-[13.5px] mb-1'>განაცხადი გაგზავნილია</p>
                  <p className='text-gray-400 text-[12px]'>მოლოდინში გახდება სტატუსი</p>
                </div>
              )}

              {/* Guest CTA */}
              {!user && (
                <div className='bg-white border border-gray-100 rounded-2xl p-6 text-center'>
                  <div className='w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3'>
                    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='#9CA3AF' strokeWidth='1.5'>
                      <circle cx='8' cy='5' r='3'/><path d='M2 14c0-4 2.5-6 6-6s6 2 6 6'/>
                    </svg>
                  </div>
                  <p className='text-gray-500 text-[13px] mb-4'>განაცხადის გასაგზავნად შედით სისტემაში</p>
                  <button
                    onClick={() => navigate('/login')}
                    className='w-full h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[13px] font-medium transition-colors duration-150'>
                    შესვლა
                  </button>
                </div>
              )}

              {/* Other company jobs */}
              {job.employer.jobCount > 1 && (
                <button
                  onClick={() => navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'))}
                  className='w-full bg-white border border-gray-100 hover:border-gray-200 hover:shadow-card rounded-2xl px-5 py-4 text-left flex items-center justify-between group transition-all duration-150'>
                  <div>
                    <p className='text-[13px] font-medium text-gray-700 group-hover:text-brand-600 transition-colors duration-150'>
                      {job.employer.companyName}
                    </p>
                    <p className='text-[12px] text-gray-400 mt-0.5'>სხვა ვაკანსიების ნახვა</p>
                  </div>
                  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='2'
                    className='group-hover:translate-x-0.5 transition-transform duration-150 flex-shrink-0'>
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
