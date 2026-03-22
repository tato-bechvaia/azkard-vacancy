import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_LABELS   = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const EXP_LABELS      = { NONE: 'გამოცდილება არ სჭირდება', ONE_TO_THREE: '1-3 წელი', THREE_TO_FIVE: '3-5 წელი', FIVE_PLUS: '5+ წელი' };
const CATEGORY_LABELS = {
  IT: 'IT და ტექნოლოგია', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი',
  FINANCE: 'ფინანსები', DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი',
  LOGISTICS: 'ლოჯისტიკა', HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება',
  HOSPITALITY: 'სტუმართმოყვარეობა', OTHER: 'სხვა'
};

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [regime, setRegime]         = useState('');
  const [category, setCategory]     = useState('');
  const [salaryMin, setSalaryMin]   = useState('');
  const [salaryMax, setSalaryMax]   = useState('');
  const [experience, setExperience] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/jobs', { params: { search, regime, experience, category, salaryMin, salaryMax } })
      .then(({ data }) => { setJobs(data.jobs); setTotal(data.total); })
      .catch(() => {});
  }, [search, regime, experience, category, salaryMin, salaryMax]);

  const clearFilters = () => {
    setRegime(''); setCategory(''); setSalaryMin('');
    setSalaryMax(''); setExperience('');
  };

  const activeCount = [regime, category, salaryMin, salaryMax, experience].filter(Boolean).length;

  const regimeTag = (r) => {
    if (r === 'REMOTE')   return 'bg-teal-50 text-teal-700 border-teal-200';
    if (r === 'HYBRID')   return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

        <div className='max-w-5xl mx-auto pt-20 px-4 pb-10'>

            {/* Search bar */}
            <div className='relative mt-6 mb-3'>
            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>ძიება</span>
            <input
                type='text'
                placeholder='ვაკანსიის ან კომპანიის ძიება...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='w-full h-12 bg-white border border-surface-200 rounded-xl pl-16 pr-4 text-sm focus:outline-none focus:border-brand-600 shadow-sm'
            />
            </div>

            {/* Filter bar */}
            <div className='bg-white border border-surface-200 rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2'>

            <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className='h-8 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600 text-gray-600'>
                <option value=''>ყველა კატეგორია</option>
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
                ))}
            </select>

            <select
                value={regime}
                onChange={e => setRegime(e.target.value)}
                className='h-8 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600 text-gray-600'>
                <option value=''>სამუშაო რეჟიმი</option>
                <option value='FULL_TIME'>ადგილზე</option>
                <option value='REMOTE'>დისტანციური</option>
                <option value='HYBRID'>ჰიბრიდული</option>
            </select>

            <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className='h-8 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600 text-gray-600'>
                <option value=''>გამოცდილება</option>
                <option value='NONE'>არ სჭირდება</option>
                <option value='ONE_TO_THREE'>1-3 წელი</option>
                <option value='THREE_TO_FIVE'>3-5 წელი</option>
                <option value='FIVE_PLUS'>5+ წელი</option>
            </select>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className={'h-8 px-3 rounded-lg text-sm border transition ' +
                (showFilters
                    ? 'bg-brand-50 border-brand-200 text-brand-600'
                    : 'bg-surface-50 border-surface-200 text-gray-500 hover:border-gray-300')}>
                ხელფასი {salaryMin || salaryMax ? '✓' : ''}
            </button>

            {activeCount > 0 && (
                <button
                onClick={clearFilters}
                className='h-8 px-3 rounded-lg text-sm text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent transition ml-auto'>
                გასუფთავება ({activeCount})
                </button>
            )}
            </div>

            {/* Salary filter expand */}
            {showFilters && (
            <div className='bg-white border border-surface-200 rounded-xl p-4 mb-4 flex items-center gap-4'>
                <span className='text-sm text-gray-500'>ხელფასი (GEL):</span>
                <input
                type='number' placeholder='მინ.'
                value={salaryMin}
                onChange={e => setSalaryMin(e.target.value)}
                className='w-28 h-8 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                />
                <span className='text-gray-300'>—</span>
                <input
                type='number' placeholder='მაქს.'
                value={salaryMax}
                onChange={e => setSalaryMax(e.target.value)}
                className='w-28 h-8 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                />
            </div>
            )}

            {/* Count */}
            <p className='text-sm text-gray-400 mb-3'>
            ნაპოვნია <span className='font-medium text-gray-900'>{total}</span> ვაკანსია
            </p>

            {/* Jobs list */}
            <div className='flex flex-col gap-2'>
            {jobs.map(job => (
                <div
                key={job.id}
                onClick={() => navigate('/jobs/' + job.id)}
                className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition group'>

                    <CompanyAvatar company={job.employer} size='md' />

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

                        <div className='flex items-center gap-2 mt-2 flex-wrap'>
                            <span className={'text-xs px-2 py-0.5 rounded border ' + regimeTag(job.jobRegime)}>
                                {REGIME_LABELS[job.jobRegime]}
                            </span>
                            <span className='text-xs px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200'>
                                {EXP_LABELS[job.experience]}
                            </span>
                            {job.category && job.category !== 'OTHER' && (
                                <span className='text-xs px-2 py-0.5 rounded border bg-brand-50 text-brand-600 border-brand-100'>
                                {CATEGORY_LABELS[job.category]}
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
                    </div>
                </div>
            ))}

            {jobs.length === 0 && (
                <div className='text-center py-20 text-gray-400'>
                    <p className='font-medium text-gray-600 mb-1'>ვაკანსია ვერ მოიძებნა</p>
                    <p className='text-sm'>სცადეთ ფილტრების შეცვლა</p>
                </div>
            )}
            </div>
      </div>
    </div>
  );
}