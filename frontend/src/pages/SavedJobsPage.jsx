import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const REGIME_GEO = { REMOTE: 'დისტანციური', HYBRID: 'ჰიბრიდული', FULL_TIME: 'ადგილზე' };
const CAT_GEO = {
  IT: 'IT', SALES: 'გაყიდვები', MARKETING: 'მარკეტინგი', FINANCE: 'ფინანსები',
  DESIGN: 'დიზაინი', MANAGEMENT: 'მენეჯმენტი', LOGISTICS: 'ლოჯისტიკა',
  HEALTHCARE: 'მედიცინა', EDUCATION: 'განათლება', HOSPITALITY: 'სტუმართმოყვარეობა', OTHER: 'სხვა',
};

export default function SavedJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/saved-jobs')
      .then(({ data }) => setSaved(data))
      .catch(err => setError(err?.response?.data?.message || 'შეცდომა. სცადეთ ხელახლა.'))
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (jobId) => {
    await api.delete('/saved-jobs/' + jobId);
    setSaved(prev => prev.filter(s => s.job.id !== jobId));
  };

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-3xl mx-auto pt-[5.25rem] px-5 pb-16'>
        <div className='pt-8 mb-6'>
          <p className='text-[10.5px] tracking-[0.2em] uppercase text-gray-400 mb-1'>შენახული</p>
          <h1 className='font-display font-semibold text-[24px] text-gray-900 leading-tight'>
            შენახული ვაკანსიები
          </h1>
        </div>

        {error ? (
          <div className='bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-[13px] text-red-600'>
            {error}
          </div>
        ) : loading ? (
          <div className='flex items-center justify-center py-24 text-gray-400 text-[13px] gap-2'>
            <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
              <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20'/>
              <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
            </svg>
            იტვირთება...
          </div>
        ) : saved.length === 0 ? (
          <div className='bg-white border border-gray-100 rounded-2xl text-center py-20 px-8'>
            <div className='w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.5'>
                <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
              </svg>
            </div>
            <p className='font-medium text-[14px] text-gray-700 mb-1.5'>შენახული ვაკანსია არ გაქვთ</p>
            <p className='text-[12.5px] text-gray-400 mb-5'>ვაკანსიის გვერდზე შეინახე ვაკანსიები მოგვიანებით სანახავად.</p>
            <button
              onClick={() => navigate('/')}
              className='h-9 px-5 bg-brand-600 hover:bg-brand-700 text-white text-[12.5px] font-medium rounded-xl transition-colors duration-150'>
              ვაკანსიების ძიება
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-2.5'>
            {saved.map(({ job, savedAt }) => (
              <div
                key={job.id}
                className='bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-gray-200 transition-colors duration-150 group'>
                <CompanyAvatar company={job.employer} size='sm' />

                <div
                  className='flex-1 min-w-0 cursor-pointer'
                  onClick={() => navigate('/jobs/' + job.id)}>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <p className='text-[13.5px] font-medium text-gray-900 group-hover:text-brand-600 transition-colors duration-150 truncate'>
                      {job.title}
                    </p>
                    {job.status === 'CLOSED' && (
                      <span className='text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md border border-gray-200 flex-shrink-0'>
                        დახურული
                      </span>
                    )}
                  </div>
                  <p className='text-[12px] text-gray-400 truncate'>
                    {job.employer?.companyName}
                    {job.location ? ' · ' + job.location : ''}
                    {' · '}
                    {job.salary?.toLocaleString()} {job.currency}
                  </p>
                  <div className='flex items-center gap-2 mt-1.5'>
                    {job.jobRegime && (
                      <span className='text-[10.5px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>
                        {REGIME_GEO[job.jobRegime]}
                      </span>
                    )}
                    {job.category && (
                      <span className='text-[10.5px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md'>
                        {CAT_GEO[job.category] || job.category}
                      </span>
                    )}
                    <span className='text-[10.5px] text-gray-300'>
                      შენახულია {new Date(savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => unsave(job.id)}
                  title='წაშლა'
                  className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-brand-500 hover:text-red-400 hover:bg-red-50 transition-all duration-150'>
                  <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor' stroke='none'>
                    <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
