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
      login(data.token, data.role);
      navigate(data.role === 'EMPLOYER' ? '/employer' : '/candidate');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='min-h-screen bg-dark-600 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>

        {/* Logo */}
        <div className='text-center mb-8'>
          <div
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 cursor-pointer mb-6'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center'>
              <span className='text-white font-bold'>A</span>
            </div>
            <span className='text-white font-bold text-2xl'>Azkard</span>
          </div>
          <h1 className='text-2xl font-bold text-white'>Welcome back</h1>
          <p className='text-dark-100 mt-2'>Sign in to your account</p>
        </div>

        {/* Form */}
        <div className='bg-dark-400 border border-white/5 rounded-2xl p-8'>
          {error && (
            <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='text-dark-100 text-sm font-medium block mb-2'>Email</label>
              <input
                type='email' required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                placeholder='you@example.com'
              />
            </div>
            <div>
              <label className='text-dark-100 text-sm font-medium block mb-2'>Password</label>
              <input
                type='password' required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                placeholder='••••••••'
              />
            </div>
            <button
              type='submit'
              className='w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-semibold transition mt-2'>
              Sign in
            </button>
          </form>
        </div>

        <p className='text-center text-dark-100 text-sm mt-6'>
          No account?{' '}
          <Link to='/register' className='text-brand-400 hover:text-brand-300 transition'>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}