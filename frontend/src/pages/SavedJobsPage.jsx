import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { Card, Tag, Spinner, PageShell } from '../components/ui';
import CompanyAvatar from '../components/CompanyAvatar';
import { REGIME_LABELS, CATEGORY_LABELS } from '../utils/constants';

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
  }, [user, navigate]);

  const unsave = async (jobId) => {
    try {
      await api.delete('/saved-jobs/' + jobId);
      setSaved(prev => prev.filter(s => s.job.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  return (
    <PageShell>
      <div className='max-w-3xl mx-auto px-5 pb-16'>
        <div className='pt-8 mb-6'>
          <p className='text-[10.5px] tracking-[0.2em] uppercase text-text-muted mb-1.5'>შენახული</p>
          <h1 className='font-display font-semibold text-[24px] text-text-primary leading-tight'>
            შენახული ვაკანსიები
          </h1>
        </div>

        {error ? (
          <div className='bg-danger-50/10 border border-danger/20 rounded-xl px-5 py-4 text-[13px] text-danger-400'>
            {error}
          </div>
        ) : loading ? (
          <div className='flex items-center justify-center py-24 text-text-muted text-[13px] gap-3'>
            <Spinner size='sm' />
            იტვირთება...
          </div>
        ) : saved.length === 0 ? (
          <Card variant='default' className='text-center py-20 px-8 flex flex-col items-center'>
            <div className='w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-text-muted'>
                <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
              </svg>
            </div>
            <p className='font-medium text-[14px] text-text-primary mb-1.5'>შენახული ვაკანსია არ გაქვთ</p>
            <p className='text-[12.5px] text-text-muted mb-5'>ვაკანსიის გვერდზე შეინახე ვაკანსიები მოგვიანებით სანახავად.</p>
            <button
              onClick={() => navigate('/')}
              className='h-9 px-5 bg-brand-600 hover:bg-brand-700 text-white text-[12.5px] font-medium rounded-xl transition-colors duration-150'>
              ვაკანსიების ძიება
            </button>
          </Card>
        ) : (
          <div className='flex flex-col gap-2.5'>
            {saved.map(({ job, savedAt }) => (
              <Card
                key={job.id}
                variant='interactive'
                padding='none'
                className='px-5 py-4 flex items-center gap-4 group'
              >
                <CompanyAvatar company={job.employer} size='sm' />

                <Link
                  to={'/jobs/' + job.id}
                  className='flex-1 min-w-0 cursor-pointer no-underline text-inherit'>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <p className='text-[13.5px] font-medium text-text-primary group-hover:text-brand-400 transition-colors duration-150 truncate'>
                      {job.title}
                    </p>
                    {job.status === 'CLOSED' && (
                      <span className='text-[10px] px-1.5 py-0.5 bg-surface-200 text-text-muted rounded-md border border-border-subtle flex-shrink-0'>
                        დახურული
                      </span>
                    )}
                  </div>
                  <p className='text-[12px] text-text-muted truncate'>
                    <span className='text-text-secondary'>{job.employer?.companyName}</span>
                    {job.location ? ' · ' + job.location : ''}
                    {' · '}
                    {job.salary?.toLocaleString()} {job.currency}
                  </p>
                  <div className='flex items-center gap-2 mt-2'>
                    {job.jobRegime && (
                      <Tag variant='default' size='sm'>
                        {REGIME_LABELS[job.jobRegime]}
                      </Tag>
                    )}
                    {job.category && (
                      <Tag variant='brand' size='sm'>
                        {CATEGORY_LABELS[job.category] || job.category}
                      </Tag>
                    )}
                    <span className='text-[10.5px] text-text-muted/50 ml-auto'>
                      {new Date(savedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); unsave(job.id); }}
                  title='წაშლა'
                  className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-brand-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all duration-150'>
                  <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor' stroke='none'>
                    <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
                  </svg>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
