import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const REGIME_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', FULL_TIME: 'Full Time' };
const EXP_LABELS = { NONE: 'No experience', ONE_TO_THREE: '1-3 years', THREE_TO_FIVE: '3-5 years', FIVE_PLUS: '5+ years' };

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob]               = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied]       = useState(false);
  const [message, setMessage]       = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data));
  }, [id]);

  const handleApply = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/applications/job/${id}`, { coverLetter });
      setApplied(true);
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    }
  };

  if (!job) return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;

  return (
    <div className='min-h-screen bg-slate-50'>
      <nav className='bg-white shadow-sm px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-teal-600 cursor-pointer' onClick={() => navigate('/jobs')}>
          Azkard Vacancy
        </h1>
        <button onClick={() => navigate('/jobs')} className='text-sm text-slate-600 hover:underline'>
          ← Back to jobs
        </button>
      </nav>

      <div className='max-w-3xl mx-auto py-10 px-4'>
        <div className='bg-white rounded-2xl shadow-sm p-8'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-slate-800'>{job.title}</h1>
              <p className='text-teal-600 font-medium text-lg'>{job.employer.companyName}</p>
              {job.employer.website && (
                <a href={job.employer.website} target='_blank' className='text-slate-400 text-sm hover:underline'>
                  {job.employer.website}
                </a>
              )}
            </div>
            <div className='text-right'>
              <p className='text-xl font-bold text-slate-700'>
                {job.salaryMin.toLocaleString()} {job.currency}
                {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
              </p>
            </div>
          </div>

          <div className='flex gap-2 flex-wrap mb-6'>
            <span className='bg-teal-50 text-teal-700 text-sm px-3 py-1 rounded-full'>{REGIME_LABELS[job.jobRegime]}</span>
            <span className='bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full'>{EXP_LABELS[job.experience]}</span>
            {job.location && <span className='bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full'>📍 {job.location}</span>}
            {job.jobPeriod && <span className='bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full'>⏱ {job.jobPeriod}</span>}
            <span className='bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full'>👁 {job.views} views</span>
          </div>

          <div className='mb-8'>
            <h2 className='text-lg font-semibold text-slate-800 mb-3'>Job Description</h2>
            <p className='text-slate-600 leading-relaxed whitespace-pre-line'>{job.description}</p>
          </div>

          {user?.role === 'CANDIDATE' && !applied && (
            <div className='border-t pt-6'>
              <h2 className='text-lg font-semibold text-slate-800 mb-3'>Apply for this job</h2>
              <textarea
                placeholder='Cover letter (optional)...'
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={4}
                className='w-full border border-slate-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <button
                onClick={handleApply}
                className='w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-medium text-lg'>
                Submit Application
              </button>
            </div>
          )}

          {message && (
            <p className={`mt-4 text-center font-medium ${applied ? 'text-teal-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          {!user && (
            <div className='border-t pt-6 text-center'>
              <p className='text-slate-500 mb-3'>You need to be logged in to apply</p>
              <button
                onClick={() => navigate('/login')}
                className='bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 font-medium'>
                Login to Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}