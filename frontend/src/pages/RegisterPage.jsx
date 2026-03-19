import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

export default function RegisterPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '', role: 'CANDIDATE', fullName: '', companyName: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.role);
      navigate(data.role === 'EMPLOYER' ? '/employer' : '/candidate');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className='min-h-screen bg-dark-600 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>

        <div className='text-center mb-8'>
          <div
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 cursor-pointer mb-6'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center'>
              <span className='text-white font-bold'>A</span>
            </div>
            <span className='text-white font-bold text-2xl'>Azkard</span>
          </div>
          <h1 className='text-2xl font-bold text-white'>Create your account</h1>
          <p className='text-dark-100 mt-2'>Join thousands of professionals</p>
        </div>

        <div className='bg-dark-400 border border-white/5 rounded-2xl p-8'>

          {/* Role selector */}
          <div className='grid grid-cols-2 gap-3 mb-6'>
            {['CANDIDATE', 'EMPLOYER'].map(role => (
              <button
                key={role}
                type='button'
                onClick={() => setForm(p => ({ ...p, role }))}
                className={'py-3 rounded-xl text-sm font-semibold transition border ' +
                  (form.role === role
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-transparent border-white/10 text-dark-100 hover:border-white/20')}>
                {role === 'CANDIDATE' ? '👤 Job Seeker' : '🏢 Employer'}
              </button>
            ))}
          </div>

          {error && (
            <div className='bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {form.role === 'CANDIDATE' ? (
              <div>
                <label className='text-dark-100 text-sm font-medium block mb-2'>Full Name</label>
                <input
                  required type='text'
                  value={form.fullName}
                  onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                  placeholder='John Doe'
                />
              </div>
            ) : (
              <div>
                <label className='text-dark-100 text-sm font-medium block mb-2'>Company Name</label>
                <input
                  required type='text'
                  value={form.companyName}
                  onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                  placeholder='Acme Inc.'
                />
              </div>
            )}
            <div>
              <label className='text-dark-100 text-sm font-medium block mb-2'>Email</label>
              <input
                required type='email'
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                placeholder='you@example.com'
              />
            </div>
            <div>
              <label className='text-dark-100 text-sm font-medium block mb-2'>Password</label>
              <input
                required type='password'
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full bg-dark-500 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 transition placeholder-dark-200'
                placeholder='••••••••'
              />
            </div>
            <button
              type='submit'
              className='w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-semibold transition mt-2'>
              Create Account
            </button>
          </form>
        </div>

        <p className='text-center text-dark-100 text-sm mt-6'>
          Already have an account?{' '}
          <Link to='/login' className='text-brand-400 hover:text-brand-300 transition'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}