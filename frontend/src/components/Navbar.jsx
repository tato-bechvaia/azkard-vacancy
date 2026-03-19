import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark-600/80 backdrop-blur-xl'>
      <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className='cursor-pointer flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>A</span>
          </div>
          <span className='text-white font-bold text-xl'>Azkard</span>
        </div>

        {/* Nav Links */}
        <div className='hidden md:flex items-center gap-6'>
          <button
            onClick={() => navigate('/jobs')}
            className={'text-sm font-medium transition ' + (isActive('/jobs') ? 'text-brand-400' : 'text-dark-100 hover:text-white')}>
            Jobs
          </button>
          {user && (
            <button
              onClick={() => navigate(user.role === 'EMPLOYER' ? '/employer' : '/candidate')}
              className={'text-sm font-medium transition ' + (isActive('/employer') || isActive('/candidate') ? 'text-brand-400' : 'text-dark-100 hover:text-white')}>
              Dashboard
            </button>
          )}
        </div>

        {/* Auth Buttons */}
        <div className='flex items-center gap-3'>
          {user ? (
            <button
              onClick={logout}
              className='text-sm text-dark-100 hover:text-white transition'>
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className='text-sm text-dark-100 hover:text-white transition'>
                Sign in
              </button>
              <button
                onClick={() => navigate('/register')}
                className='text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition font-medium'>
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}