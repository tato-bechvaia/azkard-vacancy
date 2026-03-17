import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const REGIME_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', FULL_TIME: 'Full Time' };
const EXP_LABELS = { NONE: 'No experience', ONE_TO_THREE: '1-3 years', THREE_TO_FIVE: '3-5 years', FIVE_PLUS: '5+ years' };

export default function JobsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]     = useState([]);
  const [search, setSearch] = useState('');
  const [total, setTotal]   = useState(0);

  useEffect(() => {
    api.get('/jobs', { params: { search } })
      .then(({ data }) => { setJobs(data.jobs); setTotal(data.total); });
  }, [search]);

  return (
    <div className='min-h-screen bg-slate-50'>
      <nav className='bg-white shadow-sm px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-teal-600 cursor-pointer' onClick={() => navigate('/jobs')}>
          Azkard Vacancy
        </h1>
        <div className='flex gap-4 items-center'>
          {user ? (
            <>
              <button
                onClick={() => navigate(user.role === 'EMPLOYER' ? '/employer' : '/candidate')}
                className='text-sm text-slate-600 hover:underline'>
                Dashboard
              </button>
              <button onClick={logout} className='text-sm text-red-500 hover:underline'>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className='text-sm text-slate-600 hover:underline'>Login</button>
              <button onClick={() => navigate('/register')} className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700'>Register</button>
            </>
          )}
        </div>
      </nav>

      <div className='max-w-4xl mx-auto py-10 px-4'>
        <h2 className='text-3xl font-bold text-slate-800 mb-2'>Find your next job</h2>
        <p className='text-slate-500 mb-6'>{total} jobs available</p>
        <input
          type='text' placeholder='Search jobs...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='w-full border border-slate-200 rounded-xl px-4 py-3 mb-8 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
        />
        <div className='space-y-4'>
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className='bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold text-slate-800'>{job.title}</h3>
                  <p className='text-teal-600 font-medium'>{job.employer.companyName}</p>
                  <p className='text-slate-500 text-sm mt-1'>{job.location || 'Remote'}</p>
                </div>
                <div className='text-right'>
                  <p className='text-slate-700 font-medium'>
                    {job.salaryMin.toLocaleString()} {job.currency}
                    {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
                  </p>
                  <span className='inline-block mt-1 bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full'>
                    {REGIME_LABELS[job.jobRegime]}
                  </span>
                </div>
              </div>
              <div className='flex gap-2 mt-3'>
                <span className='bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.jobPeriod && (
                  <span className='bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full'>
                    {job.jobPeriod}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}