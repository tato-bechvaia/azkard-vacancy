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
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
      <div className='bg-white p-8 rounded-2xl shadow-lg w-full max-w-md'>
        <h1 className='text-2xl font-bold text-slate-800 mb-6'>Create your account</h1>
        {error && <p className='text-red-500 mb-4 text-sm'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <select
            value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
            <option value='CANDIDATE'>I am looking for a job</option>
            <option value='EMPLOYER'>I am hiring</option>
          </select>
          {form.role === 'CANDIDATE' ? (
            <input
              type='text' placeholder='Full Name' required
              value={form.fullName}
              onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />
          ) : (
            <input
              type='text' placeholder='Company Name' required
              value={form.companyName}
              onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />
          )}
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
            Create account
          </button>
        </form>
        <p className='mt-4 text-sm text-slate-500'>
          Already have an account? <Link to='/login' className='text-teal-600 hover:underline'>Sign in</Link>
        </p>
      </div>
    </div>
  );
}