import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-200 h-14 flex items-center px-6 justify-between'>

      <div
        onClick={() => navigate('/')}
        className='inline-flex items-center cursor-pointer'>
        <div className='h-8 px-3 rounded-lg bg-brand-600 flex items-center justify-center text-white font-display font-bold text-sm tracking-wide'>
          Azkard
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {user ? (
          <>
            <NotificationPanel />
            <button
              onClick={() => navigate('/profile')}
              className='flex items-center gap-2 h-8 px-3 rounded-lg hover:bg-surface-100 transition group'>
              <div className='w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0'>
                <svg width='12' height='12' viewBox='0 0 16 16' fill='none' stroke='white' strokeWidth='1.5'>
                  <circle cx='8' cy='5' r='3'/>
                  <path d='M2 14c0-4 2.5-6 6-6s6 2 6 6'/>
                </svg>
              </div>
              <span className='text-sm text-gray-700 group-hover:text-gray-900 transition'>
                {localStorage.getItem('displayName') || 'პროფილი'}
              </span>
            </button>
            <button
              onClick={logout}
              className='h-8 px-3 rounded-lg text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition'>
              გასვლა
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className='h-8 px-4 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-surface-100 transition'>
              შესვლა
            </button>
            <button
              onClick={() => navigate('/register')}
              className='h-8 px-4 rounded-lg text-sm bg-brand-600 hover:bg-brand-700 text-white transition font-medium'>
              რეგისტრაცია
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
