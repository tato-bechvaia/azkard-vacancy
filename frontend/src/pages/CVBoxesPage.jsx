import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { PageShell, Container, Spinner } from '../components/ui';
import CompanyAvatar from '../components/CompanyAvatar';

export default function CVBoxesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/company-boxes/public')
      .then(({ data }) => setCompanies(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <Container size='lg'>
        <div className='pt-12 pb-20'>
          {/* Header */}
          <div className='mb-10'>
            <p className='text-[10.5px] tracking-[0.2em] uppercase text-brand-400 font-semibold mb-2'>
              CV Boxes
            </p>
            <h1 className='font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight mb-3'>
              კომპანიების CV Boxes
            </h1>
            <p className='text-md text-text-secondary max-w-xl leading-relaxed'>
              გაგზავნეთ თქვენი CV პირდაპირ კომპანიებში, მაშინაც კი თუ აქტიური ვაკანსია არ აქვთ.
              კომპანიები თქვენს CV-ს შეინახავენ და დაგიკავშირდებიან შესაბამისი პოზიციის გახსნისას.
            </p>
          </div>

          {loading ? (
            <div className='flex flex-col items-center gap-3 py-24 text-text-muted'>
              <Spinner size='lg' />
              <p className='text-sm'>იტვირთება...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className='bg-surface-50 border border-border rounded-2xl text-center py-20 px-8'>
              <div className='w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mx-auto mb-4'>
                <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-text-muted'>
                  <path d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/>
                </svg>
              </div>
              <p className='font-medium text-md text-text-primary mb-1.5'>CV Box ჯერ არ არის</p>
              <p className='text-sm text-text-muted'>კომპანიები მალე დაამატებენ CV Box-ებს.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {companies.map((company) => (
                <div
                  key={company.id}
                  className='bg-surface-50 border border-border rounded-2xl p-5 hover:border-border-strong hover:shadow-card transition-all duration-200 group cursor-pointer'
                  onClick={() => navigate('/companies/' + company.companyName.toLowerCase().replace(/ /g, '-'))}
                >
                  <div className='flex items-start gap-3.5 mb-4'>
                    <CompanyAvatar company={company} size='md' />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-md text-text-primary group-hover:text-brand-400 transition-colors duration-150 truncate'>
                        {company.companyName}
                      </h3>
                      {company.website && (
                        <p className='text-xs text-text-muted truncate mt-0.5'>{company.website}</p>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <p className='text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed'>
                      {company.description}
                    </p>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {company.jobCount > 0 && (
                        <span className='text-xs text-text-muted'>
                          {company.jobCount} ვაკანსია
                        </span>
                      )}
                      {company.boxActive && (
                        <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-success-50 text-success border border-success/20 font-medium'>
                          <span className='w-1.5 h-1.5 rounded-full bg-success' />
                          CV Box აქტიური
                        </span>
                      )}
                    </div>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'
                      className='text-text-muted group-hover:text-brand-400 transition-colors duration-150'>
                      <path d='M5 12h14M12 5l7 7-7 7'/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </PageShell>
  );
}
