import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = localStorage.getItem('displayName') || '';

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

      <div className='flex items-center gap-3'>
        {user ? (
          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-500'>
              გამარჯობა,{' '}
              <span className='font-medium text-gray-900'>{displayName}</span>
            </span>
            <button
              onClick={() => navigate('/profile')}
              className='text-sm bg-surface-50 border border-surface-200 hover:bg-surface-100 text-gray-700 px-4 h-8 rounded-lg transition'>
              პროფილი
            </button>
            <button
              onClick={logout}
              className='text-sm text-gray-400 hover:text-red-500 transition'>
              გასვლა
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className='text-sm text-gray-500 hover:text-gray-900 transition'>
              შესვლა
            </button>
            <button
              onClick={() => navigate('/register')}
              className='text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 h-8 rounded-lg transition font-medium'>
              რეგისტრაცია
            </button>
          </>
        )}
      </div>
    </nav>
  );
}