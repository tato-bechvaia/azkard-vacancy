import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const REGIME_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', FULL_TIME: 'On-site' };
const EXP_LABELS    = { NONE: 'No exp', ONE_TO_THREE: '1-3 yr', THREE_TO_FIVE: '3-5 yr', FIVE_PLUS: '5+' };

const CATEGORIES = [
  { key: 'it',         label: 'IT & Tech',   count: 46  },
  { key: 'sales',      label: 'Sales',        count: 201 },
  { key: 'marketing',  label: 'Marketing',    count: 53  },
  { key: 'finance',    label: 'Finance',      count: 58  },
  { key: 'design',     label: 'Design',       count: 26  },
  { key: 'management', label: 'Management',   count: 119 },
];

const CITIES = ['Tbilisi', 'Batumi', 'Kutaisi', 'Telavi'];

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const [regime, setRegime]       = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    api.get('/jobs', { params: { search, regime, experience, salaryMin, salaryMax } })
      .then(({ data }) => { setJobs(data.jobs); setTotal(data.total); })
      .catch(() => {});
  }, [search, regime, experience, salaryMin, salaryMax]);

  const regimeTag = (r) => {
    if (r === 'REMOTE')    return 'bg-teal-50 text-teal-700 border-teal-200';
    if (r === 'HYBRID')    return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='flex max-w-6xl mx-auto pt-20 px-4 pb-10 gap-6'>

        {/* Sidebar */}
        <aside className='w-48 flex-shrink-0 pt-4'>

          <div className='mb-5'>
            <p className='text-xs font-display font-semibold uppercase tracking-widest text-gray-400 mb-3'>Regime</p>
            <div className='flex flex-col gap-1'>
              {['', 'REMOTE', 'HYBRID', 'FULL_TIME'].map(r => (
                <button
                  key={r}
                  onClick={() => setRegime(r)}
                  className={'text-left text-sm px-3 py-1.5 rounded-lg transition ' +
                    (regime === r
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-surface-100')}>
                  {r === '' ? 'All' : REGIME_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div className='h-px bg-surface-200 mb-5' />

          <div className='mb-5'>
            <p className='text-xs font-display font-semibold uppercase tracking-widest text-gray-400 mb-3'>Category</p>
            {CATEGORIES.map(cat => (
              <div key={cat.key} className='flex items-center justify-between py-1.5 cursor-pointer group'>
                <span className='text-sm text-gray-500 group-hover:text-gray-900 transition'>{cat.label}</span>
                <span className='text-xs text-gray-400 bg-surface-100 px-2 py-0.5 rounded-full'>{cat.count}</span>
              </div>
            ))}
          </div>

          <div className='h-px bg-surface-200 mb-5' />

          <div className='mb-5'>
            <p className='text-xs font-display font-semibold uppercase tracking-widest text-gray-400 mb-3'>Salary (GEL)</p>
            <div className='flex flex-col gap-2'>
              <input
                type='number' placeholder='Min'
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
                className='w-full h-8 bg-white border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
              />
              <input
                type='number' placeholder='Max'
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
                className='w-full h-8 bg-white border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
              />
            </div>
          </div>

          <div className='h-px bg-surface-200 mb-5' />

          <div className='mb-5'>
            <p className='text-xs font-display font-semibold uppercase tracking-widest text-gray-400 mb-3'>Experience</p>
            {['', 'NONE', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS'].map(e => (
              <button
                key={e}
                onClick={() => setExperience(e)}
                className={'text-left w-full text-sm px-3 py-1.5 rounded-lg transition ' +
                  (experience === e
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-surface-100')}>
                {e === '' ? 'Any' : EXP_LABELS[e]}
              </button>
            ))}
          </div>

          <div className='h-px bg-surface-200 mb-5' />

          <div className='mb-5'>
            <p className='text-xs font-display font-semibold uppercase tracking-widest text-gray-400 mb-3'>City</p>
            {CITIES.map(city => (
              <div key={city} className='flex items-center gap-2 py-1.5 cursor-pointer group'>
                <div className='w-3.5 h-3.5 border border-surface-300 rounded group-hover:border-brand-400 transition' />
                <span className='text-sm text-gray-500 group-hover:text-gray-900 transition'>{city}</span>
              </div>
            ))}
          </div>

        </aside>

        {/* Main */}
        <main className='flex-1 min-w-0 pt-4'>

          <div className='relative mb-5'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>🔍</span>
            <input
              type='text'
              placeholder='Search jobs or companies...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full h-11 bg-white border border-surface-200 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:border-brand-600 shadow-sm'
            />
          </div>

          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-gray-500'>
              <span className='font-medium text-gray-900'>{total}</span> jobs found
            </p>
          </div>

          <div className='flex flex-col gap-2'>
            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => navigate('/jobs/' + job.id)}
                className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition group'>

                <div className='w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-bold text-brand-600 flex-shrink-0'>
                  {job.employer.companyName.charAt(0)}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <p className='font-display font-semibold text-gray-900 text-sm group-hover:text-brand-600 transition'>
                        {job.title}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {job.employer.companyName}
                        {job.location ? ' · ' + job.location : ''}
                      </p>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='font-display font-semibold text-gray-900 text-sm'>
                        {job.salaryMin.toLocaleString()} ₾
                        {job.salaryMax ? ' – ' + job.salaryMax.toLocaleString() : ''}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 mt-2'>
                    <span className={'text-xs px-2 py-0.5 rounded border ' + regimeTag(job.jobRegime)}>
                      {REGIME_LABELS[job.jobRegime]}
                    </span>
                    <span className='text-xs px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200'>
                      {EXP_LABELS[job.experience]}
                    </span>
                    {job.views > 0 && (
                      <span className='text-xs text-gray-400 ml-auto'>👁 {job.views}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className='text-center py-20 text-gray-400'>
                <p className='text-3xl mb-3'>🔍</p>
                <p className='font-medium text-gray-600'>No jobs found</p>
                <p className='text-sm mt-1'>Try adjusting your filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}