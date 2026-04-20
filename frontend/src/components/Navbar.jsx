import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-14 flex items-center px-6 justify-between'>

      <div
        onClick={() => navigate('/')}
        className='cursor-pointer inline-block'>
        <div className='h-8 px-3.5 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-[15px] tracking-wide'>
          Azkard
        </div>
      </div>

      <div className='flex items-center gap-1.5'>
        {user ? (
          <>
            <NotificationPanel />
            <button
              onClick={() => navigate('/profile')}
              className='flex items-center gap-2 h-8 px-3 rounded-lg hover:bg-surface-100 transition-colors duration-150 group'>
              <div className='w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0'>
                <svg width='10' height='10' viewBox='0 0 16 16' fill='none' stroke='white' strokeWidth='1.75'>
                  <circle cx='8' cy='5' r='3'/>
                  <path d='M2 14c0-4 2.5-6 6-6s6 2 6 6'/>
                </svg>
              </div>
              <span className='text-[13px] text-gray-600 group-hover:text-gray-900 transition-colors duration-150 font-medium'>
                {localStorage.getItem('displayName') || 'პროფილი'}
              </span>
            </button>
            <button
              onClick={logout}
              className='h-8 px-3 rounded-lg text-[13px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150'>
              გასვლა
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className='h-8 px-4 rounded-lg text-[13px] text-gray-500 hover:text-gray-900 hover:bg-surface-100 transition-colors duration-150 font-medium'>
              შესვლა
            </button>
            <button
              onClick={() => navigate('/register')}
              className='h-8 px-4 rounded-lg text-[13px] bg-brand-600 hover:bg-brand-700 text-white transition-colors duration-150 font-medium'>
              რეგისტრაცია
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
