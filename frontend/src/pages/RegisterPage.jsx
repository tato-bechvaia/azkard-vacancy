import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const COUNTRY_CODES = [
  { code: '+995', flag: '🇬🇪' },
  { code: '+1',   flag: '🇺🇸' },
  { code: '+44',  flag: '🇬🇧' },
  { code: '+49',  flag: '🇩🇪' },
  { code: '+33',  flag: '🇫🇷' },
  { code: '+90',  flag: '🇹🇷' },
  { code: '+380', flag: '🇺🇦' },
  { code: '+374', flag: '🇦🇲' },
  { code: '+994', flag: '🇦🇿' },
];

const INPUT = 'w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-colors duration-150';

const PANELS = [
  { role: 'CANDIDATE', label: 'მაძიებელი',    desc: 'ვეძებ სამუშაოს' },
  { role: 'EMPLOYER',  label: 'დამსაქმებელი', desc: 'ვახდენ დაქირავებას' },
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
        email: form.email, password: form.password, role: form.role,
        firstName: form.firstName, lastName: form.lastName,
        companyName: form.companyName, phone,
      });
      login(data.token, data.role, data.displayName);
      if (cvFile && form.role === 'CANDIDATE') {
        const fd = new FormData();
        fd.append('cv', cvFile);
        await api.post('/profiles/cv', fd, {
          headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + data.token }
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
    <div className='min-h-screen flex'>

      {/* ── Left brand panel ── */}
      <div className='hidden lg:flex w-[44%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden flex-shrink-0'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-brand-700/10 rounded-full blur-2xl pointer-events-none' />

        <div onClick={() => navigate('/')} className='relative cursor-pointer inline-block'>
          <div className='h-9 px-4 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-lg tracking-wide'>
            Azkard
          </div>
        </div>

        <div className='relative'>
          <h2 className='font-display font-bold text-4xl text-white leading-[1.15] mb-5'>
            შეუერთდი<br />საუკეთესო<br />
            <span className='text-brand-400'>პლატფორმას</span>
          </h2>
          <p className='text-gray-500 text-sm leading-relaxed mb-10'>
            რეგისტრაცია სულ რამდენიმე წამში.<br />სამუშაოს პოვნა — ჩვენი საქმეა.
          </p>
          <div className='flex flex-col gap-4'>
            {[
              { icon: '💼', text: 'ვაკანსიები ყველა სფეროში' },
              { icon: '📄', text: 'CV-ის ატვირთვა და მართვა' },
              { icon: '🔔', text: 'განაცხადის სტატუსის შეტყობინება' },
            ].map(({ icon, text }) => (
              <div key={text} className='flex items-center gap-3 text-sm text-gray-300'>
                <div className='w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0'>
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className='text-xs text-gray-700 relative'>© 2026 Azkard</p>
      </div>

      {/* ── Right form panel ── */}
      <div className='flex-1 bg-white flex items-center justify-center px-8 py-12 overflow-y-auto'>
        <div className='w-full max-w-sm'>

          <div className='lg:hidden mb-8'>
            <div onClick={() => navigate('/')} className='cursor-pointer inline-block'>
              <div className='h-9 px-4 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-lg tracking-wide'>
                Azkard
              </div>
            </div>
          </div>

          <h1 className='font-display font-semibold text-2xl text-gray-900 mb-1'>ანგარიშის შექმნა</h1>
          <p className='text-sm text-gray-400 mb-6'>შეუერთდით ათასობით პროფესიონალს</p>

          {/* Role selector */}
          <div className='grid grid-cols-2 gap-2 mb-6'>
            {PANELS.map(({ role, label, desc }) => (
              <button
                key={role}
                type='button'
                onClick={() => setForm(p => ({ ...p, role }))}
                className={'py-3 px-4 rounded-xl text-left transition-all duration-150 border ' +
                  (form.role === role
                    ? 'bg-brand-50 border-brand-300 ring-1 ring-brand-300'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300')}>
                <p className={'text-sm font-medium ' + (form.role === role ? 'text-brand-600' : 'text-gray-700')}>
                  {label}
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>{desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-start gap-2'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='mt-0.5 flex-shrink-0'>
                <circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {form.role === 'CANDIDATE' ? (
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs font-medium text-gray-600 block mb-2'>სახელი</label>
                  <input required type='text' value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className={INPUT} placeholder='გიორგი' />
                </div>
                <div>
                  <label className='text-xs font-medium text-gray-600 block mb-2'>გვარი</label>
                  <input required type='text' value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className={INPUT} placeholder='კვარაცხელია' />
                </div>
              </div>
            ) : (
              <div>
                <label className='text-xs font-medium text-gray-600 block mb-2'>კომპანიის სახელი</label>
                <input required type='text' value={form.companyName}
                  onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                  className={INPUT} placeholder='შპს ჩემი კომპანია' />
              </div>
            )}

            <div>
              <label className='text-xs font-medium text-gray-600 block mb-2'>ელ-ფოსტა</label>
              <input required type='email' value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={INPUT} placeholder='you@example.com' />
            </div>

            <div>
              <label className='text-xs font-medium text-gray-600 block mb-2'>მობილური <span className='text-gray-400 font-normal'>(არასავალდებულო)</span></label>
              <div className='flex gap-2'>
                <select value={form.countryCode}
                  onChange={e => setForm(p => ({ ...p, countryCode: e.target.value }))}
                  className='h-11 bg-gray-50 border border-gray-200 rounded-xl px-2 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 flex-shrink-0'>
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input type='tel' value={form.phoneNumber}
                  onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                  className='flex-1 h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-colors duration-150'
                  placeholder='555 00 00 00' />
              </div>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-600 block mb-2'>პაროლი</label>
              <input required type='password' value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={INPUT} placeholder='მინიმუმ 8 სიმბოლო' />
            </div>

            {form.role === 'CANDIDATE' && (
              <div>
                <label className='text-xs font-medium text-gray-600 block mb-2'>
                  CV <span className='text-gray-400 font-normal'>(არასავალდებულო — PDF ან Word)</span>
                </label>
                <label className={'flex items-center gap-3 h-11 px-4 rounded-xl border cursor-pointer transition-colors duration-150 ' +
                  (cvFile ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300')}>
                  <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setCvFile(e.target.files[0])} />
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke={cvFile ? '#0D9488' : '#9CA3AF'} strokeWidth='2'>
                    <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                  </svg>
                  <span className={'text-sm ' + (cvFile ? 'text-teal-700 font-medium' : 'text-gray-400')}>
                    {cvFile ? cvFile.name : 'CV-ის ატვირთვა'}
                  </span>
                </label>
              </div>
            )}

            <button type='submit' disabled={loading}
              className='w-full h-11 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl text-sm font-medium transition-colors duration-150 mt-2'>
              {loading ? 'იტვირთება...' : 'ანგარიშის შექმნა'}
            </button>
          </form>

          <p className='text-center text-sm text-gray-400 mt-6'>
            უკვე გაქვთ ანგარიში?{' '}
            <Link to='/login' className='text-brand-600 hover:text-brand-700 font-medium transition-colors duration-150'>
              შესვლა
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
