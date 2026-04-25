import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import NotificationPanel from './NotificationPanel';

const NAV_LINKS = [
  { path: '/',          label: 'მთავარი' },
  { path: '/vacancies', label: 'ვაკანსიები' },
  { path: '/cv-boxes',  label: 'CV Boxes' },
  { path: '/pricing',   label: 'ფასები' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const showBanner = import.meta.env.VITE_SHOW_TEST_BANNER === 'true';

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/jobs';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {showBanner && (
        <div className='fixed top-0 left-0 right-0 z-[60] bg-amber-400 text-gray-900 text-center text-[13px] font-semibold py-2 px-4 tracking-wide'>
          ⚠️ საიტი ტესტირების რეჟიმშია — ყველა ვაკანსია ტესტურია და არ წარმოადგენს რეალურ განცხადებებს
        </div>
      )}
      <nav className={`fixed ${showBanner ? 'top-7' : 'top-0'} left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-14 flex items-center px-6 justify-between`}>

        {/* Left: Logo + Nav links */}
        <div className='flex items-center gap-6'>
          <div
            onClick={() => navigate('/')}
            className='cursor-pointer inline-block'>
            <div className='h-8 px-3.5 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-[15px] tracking-wide'>
              Azkard
            </div>
          </div>

          {/* Navigation links — hidden on mobile */}
          <div className='hidden md:flex items-center gap-1'>
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={[
                  'h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150',
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                ].join(' ')}
              >
                {link.label}
              </button>
            ))}
            {user?.role === 'CANDIDATE' && (
              <button
                onClick={() => navigate('/saved')}
                className={[
                  'h-8 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150',
                  isActive('/saved')
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                ].join(' ')}
              >
                შენახული
              </button>
            )}
          </div>
        </div>

        {/* Right: Auth actions */}
        <div className='flex items-center gap-1.5'>
          {user ? (
            <>
              <NotificationPanel />
              {/* Mobile saved icon */}
              {user.role === 'CANDIDATE' && (
                <button
                  onClick={() => navigate('/saved')}
                  title='შენახული ვაკანსიები'
                  className='md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors duration-150 text-gray-400 hover:text-brand-600'>
                  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
                  </svg>
                </button>
              )}
              <button
                onClick={() => navigate('/profile')}
                className='flex items-center gap-2 h-8 px-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 group'>
                <div className='w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0'>
                  <svg width='10' height='10' viewBox='0 0 16 16' fill='none' stroke='white' strokeWidth='1.75'>
                    <circle cx='8' cy='5' r='3'/>
                    <path d='M2 14c0-4 2.5-6 6-6s6 2 6 6'/>
                  </svg>
                </div>
                <span className='text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors duration-150 font-medium hidden sm:inline'>
                  {localStorage.getItem('displayName') || 'პროფილი'}
                </span>
              </button>
              <button
                onClick={logout}
                className='h-8 px-3 rounded-lg text-[13px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/60 transition-colors duration-150'>
                გასვლა
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className='h-8 px-4 rounded-lg text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150'>
                შესვლა
              </button>
              <button
                onClick={() => navigate('/register')}
                className='h-8 px-4 rounded-lg text-[13px] font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors duration-150'>
                რეგისტრაცია
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex items-center justify-around h-14 px-2'
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {NAV_LINKS.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={[
              'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-colors duration-150 min-w-[52px]',
              isActive(link.path)
                ? 'text-brand-600'
                : 'text-gray-400',
            ].join(' ')}
          >
            {link.path === '/' && (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                <path d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1'/>
              </svg>
            )}
            {link.path === '/pricing' && (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'/>
              </svg>
            )}
            {link.path === '/vacancies' && (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                <rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'/>
              </svg>
            )}
            {link.path === '/cv-boxes' && (
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                <path d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/>
              </svg>
            )}
            <span className='text-[10px] font-medium'>{link.label}</span>
          </button>
        ))}
        {user?.role === 'CANDIDATE' && (
          <button
            onClick={() => navigate('/saved')}
            className={[
              'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-colors duration-150 min-w-[52px]',
              isActive('/saved') ? 'text-brand-600' : 'text-gray-400',
            ].join(' ')}
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
              <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'/>
            </svg>
            <span className='text-[10px] font-medium'>შენახული</span>
          </button>
        )}
      </div>
    </>
  );
}
