import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

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
    <div className='min-h-screen bg-surface-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div
            onClick={() => navigate('/')}
            className='inline-flex items-center cursor-pointer mb-6'>
            <div className='h-9 px-4 rounded-lg bg-brand-600 flex items-center justify-center text-white font-display font-bold text-lg tracking-wide'>
              Azkard
            </div>
          </div>
          <h1 className='font-display font-bold text-xl text-gray-900'>მოგესალმებით</h1>
          <p className='text-sm text-gray-400 mt-1'>შედით თქვენს ანგარიშზე</p>
        </div>

        <div className='bg-white border border-surface-200 rounded-2xl p-6'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4'>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className='space-y-3'>
            <div>
              <label className='text-xs text-gray-500 block mb-1.5'>ელ-ფოსტა</label>
              <input
                type='email' required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                placeholder='you@example.com'
              />
            </div>
            <div>
              <label className='text-xs text-gray-500 block mb-1.5'>პაროლი</label>
              <input
                type='password' required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                placeholder='••••••••'
              />
            </div>
            <button
              type='submit'
              className='w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-medium transition mt-2'>
              შესვლა
            </button>
          </form>
        </div>

        <p className='text-center text-sm text-gray-400 mt-4'>
          ანგარიში არ გაქვთ?{' '}
          <Link to='/register' className='text-brand-600 hover:underline'>
            დარეგისტრირდით
          </Link>
        </p>
      </div>
    </div>
  );
}