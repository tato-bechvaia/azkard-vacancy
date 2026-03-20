import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = () => {
    if (!user) return '';
    const name = localStorage.getItem('name') || user.email || user.role || '';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-surface-200 h-14 flex items-center px-6 justify-between'>

      <div
        onClick={() => navigate('/')}
        className='flex items-center gap-2 cursor-pointer'>
        <div className='w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-display font-bold text-sm'>
          A
        </div>
        <span className='font-display font-bold text-lg text-gray-900'>Azkard</span>
      </div>

      <div className='flex-1 max-w-sm mx-8 relative'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>🔍</span>
        <input
          type='text'
          placeholder='Search jobs or companies...'
          onClick={() => navigate('/')}
          className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg pl-8 pr-3 text-sm focus:outline-none focus:border-brand-600 cursor-pointer'
          readOnly
        />
      </div>

      <div className='flex items-center gap-3'>
        {user ? (
          <div
            onClick={() => navigate('/profile')}
            className='w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-display font-bold text-xs cursor-pointer hover:bg-brand-100 transition'>
            {initials()}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className='text-sm text-gray-500 hover:text-gray-900 transition'>
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className='text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 h-8 rounded-lg transition font-medium'>
              Post a Job
            </button>
          </>
        )}
      </div>
    </nav>
  );
}