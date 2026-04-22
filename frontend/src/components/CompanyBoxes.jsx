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

const CATEGORIES = [
  { value: 'ALL',          label: 'ყველა' },
  { value: 'IT',           label: 'IT' },
  { value: 'SALES',        label: 'გაყიდვები' },
  { value: 'MARKETING',    label: 'მარკეტინგი' },
  { value: 'FINANCE',      label: 'ფინანსები' },
  { value: 'DESIGN',       label: 'დიზაინი' },
  { value: 'MANAGEMENT',   label: 'მენეჯმენტი' },
  { value: 'LOGISTICS',    label: 'ლოჯისტიკა' },
  { value: 'HEALTHCARE',   label: 'მედიცინა' },
  { value: 'EDUCATION',    label: 'განათლება' },
  { value: 'HOSPITALITY',  label: 'სტუმართმოყვარეობა' },
  { value: 'OTHER',        label: 'სხვა' },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.slice(1).map(c => [c.value, c.label]));

const SUBMISSION_CATS = [
  { value: 'IT',          label: 'IT' },
  { value: 'SALES',       label: 'გაყიდვები' },
  { value: 'MARKETING',   label: 'მარკეტინგი' },
  { value: 'FINANCE',     label: 'ფინანსები' },
  { value: 'DESIGN',      label: 'დიზაინი' },
  { value: 'MANAGEMENT',  label: 'მენეჯმენტი' },
  { value: 'LOGISTICS',   label: 'ლოჯისტიკა' },
  { value: 'HEALTHCARE',  label: 'მედიცინა' },
  { value: 'EDUCATION',   label: 'განათლება' },
  { value: 'HOSPITALITY', label: 'სტუმართმოყვარეობა' },
  { value: 'OTHER',       label: 'სხვა' },
];

// ── CV Submission modal ──────────────────────────────────────────────────────
function CVModal({ box, onClose }) {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [msg, setMsg]             = useState('');
  const [file, setFile]           = useState(null);
  const [selCats, setSelCats]     = useState([]);
  const [catOpen, setCatOpen]     = useState(false);
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg]       = useState('');
  const fileRef = useRef(null);

  const toggleCat = (val) => {
    setSelCats(prev => {
      if (prev.includes(val)) return prev.filter(c => c !== val);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, val];
    });
  };

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
      fd.append('categories', JSON.stringify(selCats));
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
            {/* Category multi-select (max 3) */}
            <div className='relative'>
              <label className='block text-[11px] text-gray-500 mb-1.5'>
                სფერო (მაქს. 3)
                {selCats.length > 0 && (
                  <span className='ml-1.5 text-white/40'>{selCats.length}/3</span>
                )}
              </label>
              {/* Trigger */}
              <button
                type='button'
                onClick={() => setCatOpen(o => !o)}
                className='w-full h-9 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 text-[12.5px] text-left flex items-center justify-between transition-colors hover:border-white/20'
                style={{ color: selCats.length ? '#e5e7eb' : '#4B5563' }}>
                <span className='truncate'>
                  {selCats.length === 0
                    ? 'კატეგორიის არჩევა...'
                    : selCats.map(v => SUBMISSION_CATS.find(c => c.value === v)?.label).join(', ')}
                </span>
                <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#6B7280' strokeWidth='2'
                  style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0, marginLeft: '6px' }}>
                  <polyline points='6 9 12 15 18 9'/>
                </svg>
              </button>
              {/* Dropdown */}
              {catOpen && (
                <div className='absolute z-10 left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden'>
                  <div className='flex flex-wrap gap-1.5 p-2.5'>
                    {SUBMISSION_CATS.map(c => {
                      const active = selCats.includes(c.value);
                      const disabled = !active && selCats.length >= 3;
                      return (
                        <button
                          key={c.value}
                          type='button'
                          disabled={disabled}
                          onClick={() => toggleCat(c.value)}
                          className='px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-all duration-100'
                          style={{
                            background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            color: active ? '#a5b4fc' : disabled ? '#374151' : '#9CA3AF',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                          }}>
                          {active && <span className='mr-1'>✓</span>}
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className='px-3 pb-2.5 flex justify-between items-center'>
                    <span className='text-[10.5px] text-gray-600'>
                      {selCats.length === 3 ? 'მაქსიმუმი მიღწეულია' : `კიდევ ${3 - selCats.length} შეგიძლია`}
                    </span>
                    <button
                      type='button'
                      onClick={() => setCatOpen(false)}
                      className='text-[11px] text-gray-500 hover:text-white transition-colors px-2 py-0.5 rounded'>
                      დახურვა
                    </button>
                  </div>
                </div>
              )}
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
        style={{ perspective: '800px', animationDelay: entranceDelay }}
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
            <p className='text-[11.5px] text-gray-500 leading-relaxed mb-3 line-clamp-2'>
              {box.description}
            </p>
          )}

          {/* Category badge */}
          {box.category && box.category !== 'OTHER' && (
            <div
              className='inline-flex items-center text-[9.5px] font-medium px-2 py-0.5 rounded-full mb-3'
              style={{ background: `${colorScheme.accent}18`, color: colorScheme.accent, border: `1px solid ${colorScheme.accent}30` }}>
              {CAT_LABEL[box.category] || box.category}
            </div>
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
  const [boxes, setBoxes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeCategory, setActive] = useState('ALL');

  useEffect(() => {
    api.get('/company-boxes')
      .then(({ data }) => setBoxes(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!boxes.length) return null;

  // Only show filter tabs for categories that actually have boxes
  const presentCats = ['ALL', ...new Set(boxes.map(b => b.category || 'OTHER'))];
  const filterTabs = CATEGORIES.filter(c => presentCats.includes(c.value));

  const visible = activeCategory === 'ALL'
    ? boxes
    : boxes.filter(b => (b.category || 'OTHER') === activeCategory);

  return (
    <section className='py-12'>
      {/* Section header */}
      <div className='flex items-start justify-between gap-4 mb-6 flex-wrap'>
        <div className='flex flex-col'>
          <p className='text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1'>Direct Connect</p>
          <h2 className='font-display font-semibold text-[22px] text-white leading-tight tracking-tight'>
            კომპანიებს გაუგზავნე CV
          </h2>
          <p className='text-[13px] text-gray-500 mt-1.5'>
            პირდაპირი კავშირი კომპანიის HR-თან — ვაკანსიის გარეშეც
          </p>
        </div>

        {/* Category filter dropdown */}
        {filterTabs.length > 2 && (
          <div className='flex-shrink-0 self-end'>
            <select
              value={activeCategory}
              onChange={e => setActive(e.target.value)}
              className='h-8 bg-white/[0.05] border border-white/[0.10] rounded-lg px-3 text-[12px] text-gray-300 focus:outline-none focus:border-white/20 transition-colors appearance-none pr-7 cursor-pointer'
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
              {filterTabs.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4'>
        {visible.map((box, i) => (
          <CompanyBox
            key={box.id}
            box={box}
            colorScheme={BOX_COLORS[i % BOX_COLORS.length]}
            index={i}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className='text-center py-12 text-gray-600 text-[13px]'>
          ამ კატეგორიაში CV Box არ არის
        </div>
      )}
    </section>
  );
}
