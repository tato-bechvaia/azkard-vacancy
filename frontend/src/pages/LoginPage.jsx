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
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
      <div className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>
        <h1 className='text-2xl font-bold text-slate-800 mb-6'>Sign in to Azkard</h1>
        {error && <p className='text-red-500 mb-4 text-sm'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email' placeholder='Email' required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
          />
          <input
            type='password' placeholder='Password' required
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
          />
          <button type='submit'
            className='w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 font-medium'>
            Sign in
          </button>
        </form>
        <p className='mt-4 text-sm text-slate-500'>
          No account? <Link to='/register' className='text-teal-600 hover:underline'>Register</Link>
        </p>
      </div>
    </div>
  );
}