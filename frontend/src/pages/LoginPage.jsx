import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const FEATURES = ['5 000+ ვაკანსია', '1 200+ კომპანია', 'უფასო რეგისტრაცია'];

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.role, data.displayName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'შესვლა ვერ მოხერხდა');
    }
  };

  return (
    <div className='min-h-screen flex'>

      {/* ── Left brand panel ── */}
      <div className='hidden lg:flex w-[44%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0'>
        {/* Glow blobs */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-brand-700/10 rounded-full blur-2xl pointer-events-none' />

        {/* Logo */}
        <div onClick={() => navigate('/')} className='relative cursor-pointer inline-block'>
          <div className='h-9 px-4 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-lg tracking-wide'>
            Azkard
          </div>
        </div>

        {/* Headline */}
        <div className='relative'>
          <h2 className='font-display font-bold text-4xl text-white leading-[1.15] mb-5'>
            გახადე შენი<br />კარიერა<br />
            <span className='text-brand-400'>სპეციალური</span>
          </h2>
          <p className='text-gray-500 text-sm leading-relaxed mb-10'>
            ათასობით ვაკანსია, სერიოზული კომპანიები,<br />პროფესიული შესაძლებლობები.
          </p>
          <div className='flex flex-col gap-3'>
            {FEATURES.map(feat => (
              <div key={feat} className='flex items-center gap-3 text-sm text-gray-300'>
                <div className='w-5 h-5 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center flex-shrink-0'>
                  <svg width='9' height='9' viewBox='0 0 9 9' fill='none'>
                    <polyline points='1.5,4.5 3.5,6.5 7.5,2.5' stroke='#9F8FEC' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                  </svg>
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        <p className='text-xs text-gray-700 relative'>© 2026 Azkard</p>
      </div>

      {/* ── Right form panel ── */}
      <div className='flex-1 bg-white flex items-center justify-center px-8 py-12'>
        <div className='w-full max-w-sm'>

          {/* Mobile logo */}
          <div className='lg:hidden mb-8'>
            <div onClick={() => navigate('/')} className='cursor-pointer inline-block'>
              <div className='h-9 px-4 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-lg tracking-wide'>
                Azkard
              </div>
            </div>
          </div>

          <h1 className='font-display font-semibold text-2xl text-gray-900 mb-1'>მოგესალმებით</h1>
          <p className='text-sm text-gray-400 mb-8'>შედით თქვენს ანგარიშზე</p>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-start gap-2'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='mt-0.5 flex-shrink-0'>
                <circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='text-xs font-medium text-gray-600 block mb-2'>ელ-ფოსტა</label>
              <input
                type='email' required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-colors duration-150'
                placeholder='you@example.com'
              />
            </div>
            <div>
              <label className='text-xs font-medium text-gray-600 block mb-2'>პაროლი</label>
              <input
                type='password' required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-colors duration-150'
                placeholder='••••••••'
              />
            </div>
            <button
              type='submit'
              className='w-full h-11 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors duration-150 mt-2'>
              შესვლა
            </button>
          </form>

          <p className='text-center text-sm text-gray-400 mt-6'>
            ანგარიში არ გაქვთ?{' '}
            <Link to='/register' className='text-brand-600 hover:text-brand-700 font-medium transition-colors duration-150'>
              დარეგისტრირდით
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
