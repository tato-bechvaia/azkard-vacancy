import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

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
        <h1 className='text-xl font-bold text-teal-600'>Azkard Vacancy</h1>
        <div className='flex gap-4 items-center'>
          {user ? (
            <>
              <span className='text-sm text-slate-500'>{user.role}</span>
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
            <div key={job.id} className='bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold text-slate-800'>{job.title}</h3>
                  <p className='text-teal-600 font-medium'>{job.employer.companyName}</p>
                  <p className='text-slate-500 text-sm mt-1'>{job.location}</p>
                </div>
                <div className='text-right'>
                  {job.salaryMin && (
                    <p className='text-slate-700 font-medium'>
                      £{job.salaryMin.toLocaleString()} - £{job.salaryMax.toLocaleString()}
                    </p>
                  )}
                  <span className='inline-block mt-2 bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full'>
                    {job.status}
                  </span>
                </div>
              </div>
              <p className='text-slate-600 text-sm mt-3 line-clamp-2'>{job.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}