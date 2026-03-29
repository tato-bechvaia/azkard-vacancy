import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', FULL_TIME: 'On-site' };
const EXP_LABELS    = { NONE: 'No experience', ONE_TO_THREE: '1-3 years', THREE_TO_FIVE: '3-5 years', FIVE_PLUS: '5+ years' };

export default function JobDetailPage() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [job, setJob]             = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile]       = useState(null);
  const [savedCv, setSavedCv]     = useState(null);
  const [applied, setApplied]     = useState(false);
  const [message, setMessage]     = useState('');

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
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    }
  };

  if (!job) return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center'>
      <p className='text-gray-400 text-sm'>Loading...</p>
    </div>
  );

  const fmtDayMonth = (d) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(date);
  };

  const dateRangeLabel = (j) => {
    if (!j?.startDate || !j?.endDate) return null;
    const start = fmtDayMonth(j.startDate);
    const end = fmtDayMonth(j.endDate);
    if (!start || !end) return null;
    return `${start}–${end}`;
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-3xl mx-auto pt-20 px-4 pb-10'>
        <button
          onClick={() => navigate('/')}
          className='text-sm text-gray-400 hover:text-gray-900 transition mb-6 flex items-center gap-1'>
          ← Back to jobs
        </button>

        <div className='bg-white border border-surface-200 rounded-2xl p-8'>

          <div className='flex items-start gap-4 mb-6'>
            <CompanyAvatar company={job.employer} size='lg' />
            <div className='flex-1'>
              <h1 className='font-display font-bold text-xl text-gray-900'>{job.title}</h1>
              <p className='text-gray-500 text-sm mt-0.5'>
                {job.employer.companyName}
                {job.employer.website && (
                  <a href={job.employer.website} target='_blank' rel='noreferrer' className='text-brand-600 ml-2 hover:underline text-xs'>
                    {job.employer.website}
                  </a>
                )}
              </p>
            </div>
            <div className='text-right'>
              <p className='font-display font-bold text-gray-900'>
                {job.salary.toLocaleString()} ₾
              </p>
              <p className='text-xs text-gray-400 mt-0.5'>{job.currency}</p>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 mb-6'>
            <span className='text-xs px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 border border-brand-100'>
              {REGIME_LABELS[job.jobRegime]}
            </span>
            <span className='text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200'>
              {EXP_LABELS[job.experience]}
            </span>
            {job.location && (
              <span className='text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200'>
                {job.location}
              </span>
            )}
            {dateRangeLabel(job) && (
              <span className='text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200'>
                {dateRangeLabel(job)}
              </span>
            )}
            <div className='ml-auto flex items-center gap-3'>
                <span className='text-xs text-gray-400'>
                    ნახვა: {job.views}
                </span>
                <span className='text-xs text-gray-400'>
                    განაცხადი: {job._count?.applications || 0}
                </span>
            </div>
          </div>

          <div className='border-t border-surface-100 pt-6 mb-8'>
            <h2 className='font-display font-semibold text-gray-900 mb-3'>Job Description</h2>
            <p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>{job.description}</p>
          </div>

          {job.employer.jobCount > 1 && (
            <div className='border-t border-surface-100 pt-6 mb-6'>
                <button
                onClick={() => navigate('/companies/' + job.employer.companyName.toLowerCase().replace(/ /g, '-'))}
                className='w-full bg-surface-50 border border-surface-200 hover:border-brand-300 rounded-xl px-4 py-3 text-sm text-gray-600 hover:text-brand-600 transition text-left flex items-center justify-between'>
                <span>
                    <span className='font-medium'>{job.employer.companyName}</span>-ის სხვა ვაკანსიების ნახვა
                </span>
                <span>→</span>
                </button>
            </div>
            )}

          {user?.role === 'CANDIDATE' && !applied && (
        <div className='border-t border-surface-100 pt-6'>
            <h2 className='font-display font-semibold text-gray-900 mb-4'>განაცხადის გაგზავნა</h2>
            <textarea
            placeholder='სამოტივაციო წერილი (არასავალდებულო)...'
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            rows={4}
            className='w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-brand-600 resize-none'
            />

            {savedCv ? (
            <div className='bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between'>
                <div>
                <p className='text-sm text-teal-700 font-medium'>CV ავტომატურად დაერთვება</p>
                <p className='text-xs text-teal-600 mt-0.5'>პროფილში შენახული CV გაიგზავნება</p>
                </div>
                <label className='text-xs text-teal-600 cursor-pointer hover:underline'>
                <input
                    type='file'
                    accept='.pdf,.doc,.docx'
                    className='hidden'
                    onChange={e => setCvFile(e.target.files[0])}
                />
                სხვა CV-ს არჩევა
                </label>
            </div>
            ) : (
            <div className='mb-4'>
                <label className='text-sm text-gray-500 block mb-2'>CV (PDF ან Word)</label>
                <input
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={e => setCvFile(e.target.files[0])}
                className='w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-surface-200 file:text-sm file:bg-white file:text-gray-600 hover:file:bg-surface-50'
                />
            </div>
            )}

            {cvFile && (
            <p className='text-xs text-teal-600 mb-3'>✓ არჩეულია: {cvFile.name}</p>
            )}

            <button
            onClick={handleApply}
            className='w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-medium text-sm transition'>
            განაცხადის გაგზავნა
            </button>
        </div>
)}

          {message && (
            <p className={'mt-4 text-center text-sm font-medium ' + (applied ? 'text-teal-600' : 'text-red-500')}>
              {message}
            </p>
          )}

          {!user && (
            <div className='border-t border-surface-100 pt-6 text-center'>
              <p className='text-gray-400 text-sm mb-3'>Sign in to apply for this job</p>
              <button
                onClick={() => navigate('/login')}
                className='bg-brand-600 hover:bg-brand-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition'>
                Sign in to Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}