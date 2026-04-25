import { useEffect, useState } from 'react';
import api from '../../api/axios';
import CompanyAvatar from '../CompanyAvatar';

export default function PartnerStrip() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get('/company-boxes/public')
      .then(({ data }) => {
        const seen = new Set();
        setCompanies(
          data.filter(c => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          })
        );
      })
      .catch(() => {});
  }, []);

  if (!companies.length) return null;

  return (
    <div className='border-b border-border-subtle bg-surface-50/30'>
      <div className='max-w-6xl mx-auto px-6 py-5'>
        <div className='flex items-center gap-6 overflow-x-auto scrollbar-hide'>
          <p className='text-[10px] tracking-[0.18em] uppercase text-text-muted font-semibold whitespace-nowrap flex-shrink-0'>
            პარტნიორი კომპანიები
          </p>
          <div className='w-px h-4 bg-border-subtle flex-shrink-0' />
          <div className='flex items-center gap-5'>
            {companies.map(company => (
              <div
                key={company.id}
                className='flex items-center gap-2.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200'
              >
                <CompanyAvatar company={company} size='xs' />
                <span className='text-xs text-text-secondary font-medium whitespace-nowrap'>
                  {company.companyName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
