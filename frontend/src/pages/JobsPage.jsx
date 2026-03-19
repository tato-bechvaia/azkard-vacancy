import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';

const REGIME_LABELS = { REMOTE: 'Remote', HYBRID: 'Hybrid', FULL_TIME: 'Full Time' };
const EXP_LABELS = { NONE: 'No exp', ONE_TO_THREE: '1-3 yrs', THREE_TO_FIVE: '3-5 yrs', FIVE_PLUS: '5+ yrs' };

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [regime, setRegime]     = useState('');
  const [experience, setExperience] = useState('');
  const [salaryMin, setSalaryMin]   = useState('');
  const [salaryMax, setSalaryMax]   = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/jobs', { params: { search, regime, experience, salaryMin, salaryMax } })
      .then(({ data }) => { setJobs(data.jobs); setTotal(data.total); });
  }, [search, regime, experience, salaryMin, salaryMax]);

  const clearFilters = () => {
    setRegime(''); setExperience(''); setSalaryMin(''); setSalaryMax('');
  };

  const activeFilters = [regime, experience, salaryMin, salaryMax].filter(Boolean).length;

  return (
    <div className='min-h-screen bg-dark-600'>
      <Navbar />

      <div className='max-w-6xl mx-auto px-6 pt-28 pb-20'>

        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Find Jobs</h1>
          <p className='text-dark-100'>{total} positions available</p>
        </div>

        {/* Search + Filter Bar */}
        <div className='flex gap-3 mb-4'>
          <div className='flex-1 relative'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-dark-100'>🔍</span>
            <input
              type='text'
              placeholder='Search jobs, companies...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full bg-dark-400 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={'flex items-center gap-2 px-5 py-3 rounded-xl border transition font-medium text-sm ' +
              (showFilters || activeFilters > 0
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'bg-dark-400 border-white/10 text-dark-100 hover:border-white/20')}>
            Filters
            {activeFilters > 0 && (
              <span className='bg-white text-brand-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold'>
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className='bg-dark-400 border border-white/5 rounded-2xl p-6 mb-6'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <label className='text-dark-100 text-xs font-medium block mb-2'>Work Regime</label>
                <select
                  value={regime}
                  onChange={e => setRegime(e.target.value)}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500'>
                  <option value=''>All</option>
                  <option value='REMOTE'>Remote</option>
                  <option value='HYBRID'>Hybrid</option>
                  <option value='FULL_TIME'>Full Time</option>
                </select>
              </div>
              <div>
                <label className='text-dark-100 text-xs font-medium block mb-2'>Experience</label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500'>
                  <option value=''>All</option>
                  <option value='NONE'>No Experience</option>
                  <option value='ONE_TO_THREE'>1-3 Years</option>
                  <option value='THREE_TO_FIVE'>3-5 Years</option>
                  <option value='FIVE_PLUS'>5+ Years</option>
                </select>
              </div>
              <div>
                <label className='text-dark-100 text-xs font-medium block mb-2'>Min Salary (GEL)</label>
                <input
                  type='number' placeholder='e.g. 1000'
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 placeholder-dark-200'
                />
              </div>
              <div>
                <label className='text-dark-100 text-xs font-medium block mb-2'>Max Salary (GEL)</label>
                <input
                  type='number' placeholder='e.g. 5000'
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 placeholder-dark-200'
                />
              </div>
            </div>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className='mt-4 text-sm text-brand-400 hover:text-brand-300 transition'>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Regime Pills */}
        <div className='flex gap-2 mb-8 flex-wrap'>
          {['', 'REMOTE', 'HYBRID', 'FULL_TIME'].map(r => (
            <button
              key={r}
              onClick={() => setRegime(r)}
              className={'px-4 py-2 rounded-full text-sm font-medium transition border ' +
                (regime === r
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-transparent border-white/10 text-dark-100 hover:border-white/20')}>
              {r === '' ? 'All' : REGIME_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => navigate('/jobs/' + job.id)}
              className='bg-dark-400 border border-white/5 rounded-2xl p-6 hover:border-brand-600/30 transition cursor-pointer group'>

              {/* Company + Status */}
              <div className='flex justify-between items-start mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold'>
                    {job.employer.companyName.charAt(0)}
                  </div>
                  <div>
                    <p className='text-dark-100 text-sm'>{job.employer.companyName}</p>
                    <p className='text-white font-semibold group-hover:text-brand-400 transition'>{job.title}</p>
                  </div>
                </div>
                <span className='bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full font-medium'>
                  {job.status === 'HIRING' ? 'Hiring' : 'Closed'}
                </span>
              </div>

              {/* Tags */}
              <div className='flex gap-2 flex-wrap mb-4'>
                <span className='bg-dark-500 text-dark-100 text-xs px-3 py-1 rounded-full'>
                  {REGIME_LABELS[job.jobRegime]}
                </span>
                <span className='bg-dark-500 text-dark-100 text-xs px-3 py-1 rounded-full'>
                  {EXP_LABELS[job.experience]}
                </span>
                {job.location && (
                  <span className='bg-dark-500 text-dark-100 text-xs px-3 py-1 rounded-full'>
                    📍 {job.location}
                  </span>
                )}
              </div>

              {/* Salary + Views */}
              <div className='flex justify-between items-center'>
                <p className='text-brand-400 font-semibold'>
                  {job.salaryMin.toLocaleString()} GEL
                  {job.salaryMax && ' - ' + job.salaryMax.toLocaleString()}
                </p>
                <p className='text-dark-100 text-xs'>👁 {job.views}</p>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-4xl mb-4'>🔍</p>
            <p className='text-white font-semibold text-lg'>No jobs found</p>
            <p className='text-dark-100 text-sm mt-2'>Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}