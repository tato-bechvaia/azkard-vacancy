import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const BOX_COLORS = [
  { bg: '#1a1a2e', accent: '#6366f1', glow: 'rgba(99,102,241,0.25)' },
  { bg: '#0f1f2e', accent: '#0ea5e9', glow: 'rgba(14,165,233,0.25)' },
  { bg: '#1e1a0f', accent: '#f59e0b', glow: 'rgba(245,158,11,0.22)' },
  { bg: '#1a2e1a', accent: '#10b981', glow: 'rgba(16,185,129,0.22)' },
  { bg: '#2e1a1a', accent: '#ef4444', glow: 'rgba(239,68,68,0.22)' },
  { bg: '#1e102e', accent: '#a855f7', glow: 'rgba(168,85,247,0.22)' },
  { bg: '#0f2e2a', accent: '#14b8a6', glow: 'rgba(20,184,166,0.22)' },
  { bg: '#2e1e10', accent: '#f97316', glow: 'rgba(249,115,22,0.22)' },
];

// ── CV Submission modal ──────────────────────────────────────────────────────
function CVModal({ box, onClose }) {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [msg, setMsg]       = useState('');
  const [file, setFile]     = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('');
  const fileRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setErrMsg('CV ფაილი სავალდებულოა'); return; }
    setStatus('loading');
    setErrMsg('');
    try {
      const fd = new FormData();
      fd.append('candidateName', name);
      fd.append('candidateEmail', email);
      fd.append('message', msg);
      fd.append('cv', file);
      await api.post(`/company-boxes/${box.id}/submit`, fd);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrMsg(err?.response?.data?.message || 'შეცდომა. სცადეთ ხელახლა.');
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className='w-full max-w-md bg-gray-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]'>
          <div>
            <p className='text-[10px] text-gray-500 uppercase tracking-widest mb-1'>{box.employer?.companyName}</p>
            <h3 className='font-display font-semibold text-white text-[15px]'>{box.title}</h3>
          </div>
          <button onClick={onClose} className='w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all'>
            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M18 6 6 18M6 6l12 12'/></svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className='px-6 py-10 text-center'>
            <div className='w-12 h-12 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4'>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#10b981' strokeWidth='2' strokeLinecap='round'><path d='M20 6 9 17l-5-5'/></svg>
            </div>
            <p className='font-medium text-white mb-1'>CV წარმატებით გაიგზავნა!</p>
            <p className='text-[12px] text-gray-500'>{box.employer?.companyName} მალე დაგიკავშირდება.</p>
            <button onClick={onClose} className='mt-6 h-9 px-6 bg-white/[0.08] hover:bg-white/[0.12] text-white text-[12.5px] rounded-lg transition-all duration-150'>
              დახურვა
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className='px-6 py-5 flex flex-col gap-3.5'>
            <div>
              <label className='block text-[11px] text-gray-500 mb-1.5'>სახელი და გვარი *</label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                className='w-full h-9 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors'
                placeholder='გიორგი ბერიძე'
              />
            </div>
            <div>
              <label className='block text-[11px] text-gray-500 mb-1.5'>ელ-ფოსტა *</label>
              <input
                required type='email' value={email} onChange={e => setEmail(e.target.value)}
                className='w-full h-9 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors'
                placeholder='giorgi@example.com'
              />
            </div>
            <div>
              <label className='block text-[11px] text-gray-500 mb-1.5'>სამოტივაციო (სურვ.)</label>
              <textarea
                value={msg} onChange={e => setMsg(e.target.value)} rows={2}
                className='w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-white/20 resize-none transition-colors'
                placeholder='რამდენიმე სიტყვა შენს შესახებ...'
              />
            </div>
            <div>
              <label className='block text-[11px] text-gray-500 mb-1.5'>CV ფაილი (PDF/Word) *</label>
              <div
                onClick={() => fileRef.current?.click()}
                className='flex items-center gap-3 h-9 bg-white/[0.04] border border-white/[0.08] border-dashed rounded-lg px-3 cursor-pointer hover:border-white/20 transition-colors'>
                <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#6B7280' strokeWidth='1.75'><path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg>
                <span className='text-[12px] text-gray-500 truncate'>{file ? file.name : 'ფაილის ატვირთვა...'}</span>
              </div>
              <input
                ref={fileRef}
                type='file'
                accept='.pdf,.doc,.docx'
                className='hidden'
                onChange={e => setFile(e.target.files[0] || null)}
              />
            </div>

            {errMsg && (
              <p className='text-[11.5px] text-red-400'>{errMsg}</p>
            )}

            <button
              type='submit'
              disabled={status === 'loading'}
              className='h-10 bg-white text-gray-900 hover:bg-gray-100 rounded-lg text-[13px] font-semibold transition-all duration-150 disabled:opacity-50 mt-1'>
              {status === 'loading' ? 'იგზავნება...' : 'CV გაგზავნა'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Single 3D Company Box ────────────────────────────────────────────────────
function CompanyBox({ box, colorScheme, index: idx }) {
  const [hovered, setHovered]   = useState(false);
  const [selected, setSelected] = useState(false);
  const [rotate, setRotate]     = useState({ x: 0, y: 0 });

  // Staggered entrance via CSS delay
  const entranceDelay = `${idx * 80}ms`;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = -(e.clientY - cy) / (rect.height / 2) * 8;
    const ry =  (e.clientX - cx) / (rect.width  / 2) * 8;
    setRotate({ x: rx, y: ry });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const initials = (name) => name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div
        style={{
          perspective: '800px',
          animationDelay: entranceDelay,
        }}
        className='company-box-entrance'>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setSelected(true)}
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${hovered ? 'scale(1.04)' : 'scale(1)'}`,
            transition: hovered
              ? 'transform 0.15s ease-out, box-shadow 0.2s ease'
              : 'transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease',
            transformStyle: 'preserve-3d',
            background: colorScheme.bg,
            boxShadow: hovered
              ? `0 20px 50px ${colorScheme.glow}, 0 0 0 1px ${colorScheme.accent}40`
              : `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)`,
            cursor: 'pointer',
          }}
          className='relative rounded-2xl p-5 select-none'>

          {/* Floating top accent bar */}
          <div
            className='absolute top-0 left-4 right-4 h-[1.5px] rounded-full'
            style={{ background: `linear-gradient(90deg, transparent, ${colorScheme.accent}80, transparent)` }}
          />

          {/* Corner glow */}
          <div
            className='absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-20 pointer-events-none'
            style={{ background: `radial-gradient(circle, ${colorScheme.accent} 0%, transparent 70%)` }}
          />

          {/* Avatar / Initials */}
          <div
            className='w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-[15px] mb-4'
            style={{ background: `${colorScheme.accent}20`, color: colorScheme.accent, border: `1px solid ${colorScheme.accent}35` }}>
            {box.employer?.avatarUrl
              ? <img src={box.employer.avatarUrl} alt='' className='w-full h-full object-cover rounded-xl' />
              : initials(box.employer?.companyName || '?')
            }
          </div>

          {/* Company name */}
          <p className='text-[10.5px] font-medium tracking-widest uppercase mb-1' style={{ color: colorScheme.accent }}>
            {box.employer?.companyName}
          </p>

          {/* Box title */}
          <h3 className='font-display font-semibold text-[14px] text-white leading-snug mb-2 line-clamp-2'>
            {box.title}
          </h3>

          {/* Description */}
          {box.description && (
            <p className='text-[11.5px] text-gray-500 leading-relaxed mb-4 line-clamp-2'>
              {box.description}
            </p>
          )}

          {/* CTA */}
          <div
            className='inline-flex items-center gap-1.5 text-[11px] font-medium transition-all duration-150'
            style={{ color: hovered ? colorScheme.accent : '#6B7280' }}>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
              <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/>
              <polyline points='17 8 12 3 7 8'/>
              <line x1='12' y1='3' x2='12' y2='15'/>
            </svg>
            CV გაგზავნა
          </div>

          {/* Submission count badge */}
          {box._count?.submissions > 0 && (
            <div className='absolute top-4 right-4 flex items-center gap-1 text-[9.5px] text-gray-600'>
              <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2'/><circle cx='9' cy='7' r='4'/></svg>
              {box._count.submissions}
            </div>
          )}
        </div>
      </div>

      {selected && <CVModal box={box} onClose={() => setSelected(false)} />}
    </>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
export default function CompanyBoxes() {
  const [boxes, setBoxes]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/company-boxes')
      .then(({ data }) => setBoxes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!boxes.length) return null;

  return (
    <section className='py-12'>
      {/* Section header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='flex flex-col'>
          <p className='text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1'>Direct Connect</p>
          <h2 className='font-display font-semibold text-[22px] text-white leading-tight tracking-tight'>
            კომპანიებს გაუგზავნე CV
          </h2>
          <p className='text-[13px] text-gray-500 mt-1.5'>
            პირდაპირი კავშირი კომპანიის HR-თან — ვაკანსიის გარეშეც
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
        {boxes.map((box, i) => (
          <CompanyBox
            key={box.id}
            box={box}
            colorScheme={BOX_COLORS[i % BOX_COLORS.length]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
