import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const toSlug = (name) => name.toLowerCase().replace(/ /g, '-');

  return (
    <div className='border-b border-border-subtle'>
      <div className='max-w-6xl mx-auto px-6 py-10'>
        <p className='text-[11.5px] tracking-[0.22em] uppercase text-text-muted font-semibold text-center mb-7'>
          პარტნიორი კომპანიები
        </p>
        <div className='flex items-center justify-center gap-x-10 gap-y-5 flex-wrap'>
          {companies.map(company => (
            <Link
              key={company.id}
              to={'/companies/' + toSlug(company.companyName)}
              className='flex items-center gap-3 no-underline text-inherit opacity-75 hover:opacity-100 transition-all duration-200 hover:scale-[1.04]'
            >
              <CompanyAvatar company={company} size='sm' />
              <span className='text-[14px] text-text-primary font-medium whitespace-nowrap'>
                {company.companyName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
