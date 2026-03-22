import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const COUNTRY_CODES = [
  { code: '+995', flag: '🇬🇪', name: 'საქართველო' },
  { code: '+1',   flag: '🇺🇸', name: 'აშშ' },
  { code: '+44',  flag: '🇬🇧', name: 'გაერთიანებული სამეფო' },
  { code: '+49',  flag: '🇩🇪', name: 'გერმანია' },
  { code: '+33',  flag: '🇫🇷', name: 'საფრანგეთი' },
  { code: '+90',  flag: '🇹🇷', name: 'თურქეთი' },
  { code: '+380', flag: '🇺🇦', name: 'უკრაინა' },
  { code: '+374', flag: '🇦🇲', name: 'სომხეთი' },
  { code: '+994', flag: '🇦🇿', name: 'აზერბაიჯანი' },
];

export default function RegisterPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', role: 'CANDIDATE',
    firstName: '', lastName: '', companyName: '',
    countryCode: '+995', phoneNumber: ''
  });
  const [cvFile, setCvFile]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phone = form.phoneNumber ? form.countryCode + form.phoneNumber : '';
      const { data } = await api.post('/auth/register', {
        email:       form.email,
        password:    form.password,
        role:        form.role,
        firstName:   form.firstName,
        lastName:    form.lastName,
        companyName: form.companyName,
        phone,
      });

      login(data.token, data.role, data.displayName);

      if (cvFile && form.role === 'CANDIDATE') {
        const formData = new FormData();
        formData.append('cv', cvFile);
        await api.post('/profiles/cv', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + data.token
          }
        });
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'რეგისტრაცია ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-sm'>
        <div className='text-center mb-8'>
          <div
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 cursor-pointer mb-6'>
            <div className='w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display font-bold'>
              A
            </div>
            <span className='font-display font-bold text-2xl text-gray-900'>Azkard</span>
          </div>
          <h1 className='font-display font-bold text-xl text-gray-900'>ანგარიშის შექმნა</h1>
          <p className='text-sm text-gray-400 mt-1'>შეუერთდით ათასობით პროფესიონალს</p>
        </div>

        <div className='bg-white border border-surface-200 rounded-2xl p-6'>
          <div className='grid grid-cols-2 gap-2 mb-5'>
            {['CANDIDATE', 'EMPLOYER'].map(role => (
              <button
                key={role}
                type='button'
                onClick={() => setForm(p => ({ ...p, role }))}
                className={'py-2.5 rounded-xl text-sm font-medium transition border ' +
                  (form.role === role
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-transparent border-surface-200 text-gray-500 hover:border-gray-300')}>
                {role === 'CANDIDATE' ? 'მაძიებელი' : 'დამსაქმებელი'}
              </button>
            ))}
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-3'>
            {form.role === 'CANDIDATE' ? (
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs text-gray-500 block mb-1.5'>სახელი</label>
                  <input
                    required type='text'
                    value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                    placeholder='გიორგი'
                  />
                </div>
                <div>
                  <label className='text-xs text-gray-500 block mb-1.5'>გვარი</label>
                  <input
                    required type='text'
                    value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                    placeholder='კვარაცხელია'
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className='text-xs text-gray-500 block mb-1.5'>კომპანიის სახელი</label>
                <input
                  required type='text'
                  value={form.companyName}
                  onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                  placeholder='შპს ჩემი კომპანია'
                />
              </div>
            )}

            <div>
              <label className='text-xs text-gray-500 block mb-1.5'>ელ-ფოსტა</label>
              <input
                required type='email'
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                placeholder='you@example.com'
              />
            </div>

            <div>
              <label className='text-xs text-gray-500 block mb-1.5'>მობილური (არასავალდებულო)</label>
              <div className='flex gap-2'>
                <select
                  value={form.countryCode}
                  onChange={e => setForm(p => ({ ...p, countryCode: e.target.value }))}
                  className='h-10 bg-surface-50 border border-surface-200 rounded-lg px-2 text-sm focus:outline-none focus:border-brand-600 flex-shrink-0'>
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type='tel'
                  value={form.phoneNumber}
                  onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                  className='flex-1 h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                  placeholder='555 00 00 00'
                />
              </div>
            </div>

            <div>
              <label className='text-xs text-gray-500 block mb-1.5'>პაროლი</label>
              <input
                required type='password'
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'
                placeholder='მინიმუმ 8 სიმბოლო'
              />
            </div>

            {form.role === 'CANDIDATE' && (
              <div>
                <label className='text-xs text-gray-500 block mb-1.5'>
                  CV (არასავალდებულო — PDF ან Word)
                </label>
                <input
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={e => setCvFile(e.target.files[0])}
                  className='w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-surface-200 file:text-xs file:bg-white file:text-gray-600 hover:file:bg-surface-50'
                />
                {cvFile && (
                  <p className='text-xs text-teal-600 mt-1'>✓ {cvFile.name}</p>
                )}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-2.5 rounded-xl text-sm font-medium transition mt-2'>
              {loading ? 'იტვირთება...' : 'ანგარიშის შექმნა'}
            </button>
          </form>
        </div>

        <p className='text-center text-sm text-gray-400 mt-4'>
          უკვე გაქვთ ანგარიში?{' '}
          <Link to='/login' className='text-brand-600 hover:underline'>შესვლა</Link>
        </p>
      </div>
    </div>
  );
}