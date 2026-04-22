import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

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
  const [status, setStatus]       = useState('idle');
  const [errMsg, setErrMsg]       = useState('');
  const fileRef = useRef(null);

  const toggleCat = (val) => {
    setSelCats(prev => {
      if (prev.includes(val)) return prev.filter(c => c !== val);
      if (prev.length >= 3) return prev;
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
        <div className='flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]'>
          <div>
            <h3 className='font-display font-semibold text-white text-[15px]'>{box.employer?.companyName}</h3>
            <p className='text-[11px] text-gray-500 mt-0.5'>CV გაგზავნა</p>
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
            <div className='relative'>
              <label className='block text-[11px] text-gray-500 mb-1.5'>
                სფერო (მაქს. 3)
                {selCats.length > 0 && <span className='ml-1.5 text-white/40'>{selCats.length}/3</span>}
              </label>
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
                    <button type='button' onClick={() => setCatOpen(false)}
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
              <input ref={fileRef} type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={e => setFile(e.target.files[0] || null)} />
            </div>

            {errMsg && <p className='text-[11.5px] text-red-400'>{errMsg}</p>}

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
function CompanyBox({ box, index: idx }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(false);
  const [imgError, setImgError] = useState(false);

  const initials = (name) =>
    (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* Outer: perspective container + staggered entrance */}
      <div
        className='company-box-entrance'
        style={{ perspective: '900px', animationDelay: `${idx * 70}ms` }}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* 3D flip card wrapper */}
        <div style={{
          position: 'relative',
          height: '168px',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 1.21s cubic-bezier(0.23, 1, 0.32, 1)',
        }}>

          {/* ── FRONT FACE ── */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: '#0e0e0e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '18px 18px 16px',
            display: 'flex',
            flexDirection: 'column',
            /* Stacked offset shadow = 3D box depth illusion */
            boxShadow:
              '4px 4px 0 #070707, 8px 8px 0 #050505, 0 16px 36px rgba(0,0,0,0.55)',
            userSelect: 'none',
          }}>
            {/* "Tape" strip — package detail */}
            <div style={{
              position: 'absolute',
              top: -1,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36px',
              height: '7px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '0 0 5px 5px',
            }} />

            {/* Avatar */}
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.55)',
              flexShrink: 0,
            }}>
              {box.employer?.avatarUrl && !imgError
                ? <img src={box.employer.avatarUrl} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
                : initials(box.employer?.companyName)
              }
            </div>

            {/* Company name */}
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#e5e7eb',
              lineHeight: 1.35,
              marginBottom: '4px',
            }}>
              {box.employer?.companyName}
            </p>

            {/* Sub hint */}
            <p style={{
              fontSize: '10.5px',
              color: 'rgba(255,255,255,0.22)',
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              CV გაგზავნა
              <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' style={{ opacity: 0.5 }}>
                <path d='M5 12h14M12 5l7 7-7 7'/>
              </svg>
            </p>
          </div>

          {/* ── BACK FACE ── */}
          <div
            onClick={() => setSelected(true)}
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#f4f3ef',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '4px 4px 0 #dddcd8, 8px 8px 0 #d0cfc9, 0 16px 36px rgba(0,0,0,0.45)',
              userSelect: 'none',
            }}
          >
            {/* Upload icon circle */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round'>
                <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/>
                <polyline points='17 8 12 3 7 8'/>
                <line x1='12' y1='3' x2='12' y2='15'/>
              </svg>
            </div>

            <div style={{ textAlign: 'center', lineHeight: 1.35 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '3px' }}>
                Drop Your CV
              </p>
              <p style={{ fontSize: '10.5px', color: '#888' }}>
                {box.employer?.companyName}
              </p>
            </div>
          </div>

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

  const seen = new Set();
  const visible = boxes.filter(b => {
    if (seen.has(b.companyId)) return false;
    seen.add(b.companyId);
    return true;
  });

  return (
    <section className='py-12'>
      {/* Section header */}
      <div className='mb-6'>
        <p className='text-[10px] tracking-[0.2em] uppercase text-gray-500 mb-1'>Direct Connect</p>
        <h2 className='font-display font-semibold text-[22px] text-white leading-tight tracking-tight'>
          კომპანიებს გაუგზავნე CV
        </h2>
        <p className='text-[13px] text-gray-500 mt-1.5'>
          პირდაპირი კავშირი კომპანიის HR-თან — ვაკანსიის გარეშეც
        </p>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5'>
        {visible.map((box, i) => (
          <CompanyBox key={box.id} box={box} index={i} />
        ))}
      </div>
    </section>
  );
}
