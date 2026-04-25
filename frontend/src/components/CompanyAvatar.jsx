import { useState, useEffect } from 'react';
import { assetUrl } from '../utils/assetUrl';

export default function CompanyAvatar({ company, size = 'md' }) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [company?.avatarUrl]);

  const sizes = {
    xs:  'w-6 h-6 text-[10px] rounded-md',
    sm:  'w-7 h-7 text-xs rounded-lg',
    md:  'w-10 h-10 text-sm rounded-xl',
    lg:  'w-16 h-16 text-2xl rounded-xl',
  };

  if (company?.avatarUrl && !loadError) {
    return (
      <img
        src={assetUrl(company.avatarUrl)}
        alt={company.companyName}
        onError={() => setLoadError(true)}
        className={sizes[size] + ' object-cover border border-surface-200 flex-shrink-0'}
      />
    );
  }

  return (
    <div className={sizes[size] + ' bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-bold text-brand-600 flex-shrink-0'}>
      {(company?.companyName || '?').charAt(0)}
    </div>
  );
}
