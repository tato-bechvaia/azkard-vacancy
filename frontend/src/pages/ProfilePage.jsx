import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';
import { Card, Badge, Tag, Button } from '../components/ui';

const STATUS_STYLES = {
  PENDING:     'warning',
  REVIEWING:   'info',
  SHORTLISTED: 'brand',
  REJECTED:    'danger',
  HIRED:       'success',
};

const STATUS_GEO = {
  PENDING:     'განხილვის მოლოდინში',
  REVIEWING:   'განიხილება',
  SHORTLISTED: 'შორტლისტი',
  REJECTED:    'უარყოფილია',
  HIRED:       'აყვანილია',
};

const CAT_LABEL_GEO = { IT:'IT', SALES:'გაყიდვები', MARKETING:'მარკეტინგი', FINANCE:'ფინანსები', DESIGN:'დიზაინი', MANAGEMENT:'მენეჯმენტი', LOGISTICS:'ლოჯისტიკა', HEALTHCARE:'მედიცინა', EDUCATION:'განათლება', HOSPITALITY:'სტუმართმოყვარეობა', OTHER:'სხვა' };

const INPUT = 'w-full h-10 bg-surface-100 border border-border-subtle rounded-lg px-3 text-[13px] text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all duration-150 placeholder-text-muted';
const TEXTAREA = 'w-full bg-surface-100 border border-border-subtle rounded-lg px-3 py-2.5 text-[13px] text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all duration-150 resize-none placeholder-text-muted';
const SELECT_CLS = 'h-10 bg-surface-100 border border-border-subtle rounded-lg px-3 text-[13px] text-text-primary focus:outline-none focus:border-brand-500 transition-colors duration-150';


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activePanel, setActivePanel] = useState(user?.role === 'EMPLOYER' ? 'jobs' : 'applications');

  const [jobs, setJobs]                       = useState([]);
  const [applications, setApplications]       = useState([]);
  const [applicants, setApplicants]           = useState([]);
  const [selectedJob, setSelectedJob]         = useState(null);
  const [profile, setProfile]                 = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [form, setForm]                       = useState({});
  const [message, setMessage]                 = useState('');
  const [paying, setPaying]                   = useState(false);
  const [showJobForm, setShowJobForm]         = useState(false);
  const [jobForm, setJobForm]                 = useState({
    title: '', description: '', location: '',
    salaryMin: '', jobRegime: 'FULL_TIME',
    experience: 'NONE', applicationMethod: 'CV_ONLY',
    category: 'OTHER', pricingTier: 'USUAL',
  });

  // CV Boxes state (employer)
  const [myBoxes, setMyBoxes]               = useState([]);
  const [selectedBox, setSelectedBox]       = useState(null);
  const [boxSubmissions, setBoxSubmissions] = useState([]);
  const [subCatFilter, setSubCatFilter]     = useState('ALL');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/profiles/me').then(({ data }) => {
      setProfile(data);
      setForm(data);
    }).catch(() => {});

    if (user.role === 'EMPLOYER') {
      const fetchJobs = () => api.get('/jobs/mine').then(({ data }) => setJobs(data)).catch(() => {});

      const paymentResult  = searchParams.get('payment');
      const sessionId      = searchParams.get('session_id');
      const cancelledJobId = searchParams.get('jobId');

      if (paymentResult === 'success' && sessionId) {
        api.get('/payments/session/' + sessionId)
          .then(() => { setMessage('გადახდა წარმატებულია! ვაკანსია განთავსდა.'); fetchJobs(); })
          .catch(() => { setMessage('გადახდა დასტურდება...'); fetchJobs(); });
      } else if (paymentResult === 'cancelled') {
        setMessage('გადახდა გაუქმდა. ვაკანსია არ განთავსებულა.');
        if (cancelledJobId) api.delete('/payments/cancel-job/' + cancelledJobId).catch(() => {});
        fetchJobs();
      } else {
        fetchJobs();
      }

      api.get('/profiles/me').then(({ data }) => {
        if (data.id) api.get('/company-boxes/' + data.id).then(r => setMyBoxes(r.data)).catch(() => {});
      }).catch(() => {});
    } else {
      api.get('/applications/mine').then(({ data }) => setApplications(data)).catch(() => {});
    }
  }, [user, navigate, searchParams]);

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setActivePanel('applicants');
    const { data } = await api.get('/applications/job/' + job.id);
    setApplicants(data);
  };

  const updateStatus = async (appId, status) => {
    await api.put('/applications/' + appId + '/status', { status });
    const { data } = await api.get('/applications/job/' + selectedJob.id);
    setApplicants(data);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      setPaying(true);
      const { data } = await api.post('/payments/create-session', {
        ...jobForm,
        salary: jobForm.salaryMin,
      });
      window.location.href = data.url;
    } catch (err) {
      setPaying(false);
      setMessage(err.response?.data?.message || 'შეცდომა');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profiles/me', form);
      setMessage('პროფილი განახლდა!');
    } catch {
      setMessage('განახლება ვერ მოხერხდა');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('წაშლა?')) return;
    await api.delete('/jobs/' + id);
    const { data } = await api.get('/jobs/mine');
    setJobs(data);
  };

  const handleCloseJob = async (id) => {
    await api.put('/jobs/' + id, { status: 'CLOSED' });
    const { data } = await api.get('/jobs/mine');
    setJobs(data);
  };

  const handleCreateBox = async () => {
    try {
      const { data: newBox } = await api.post('/company-boxes', {});
      setMyBoxes([newBox]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'შეცდომა');
    }
  };

  const viewBoxSubmissions = async (box) => {
    setSelectedBox(box);
    setActivePanel('box-submissions');
    setSubCatFilter('ALL');
    const { data } = await api.get('/company-boxes/' + box.id + '/submissions');
    setBoxSubmissions(data);
  };

  const toggleBoxActive = async (box) => {
    const { data: updated } = await api.patch('/company-boxes/' + box.id, { isActive: !box.isActive });
    setMyBoxes(prev => prev.map(b => b.id === box.id ? { ...b, isActive: updated.isActive } : b));
  };

  const handleAvatarDelete = async () => {
    try {
      await api.delete('/profiles/avatar');
      setProfile(p => ({ ...p, avatarUrl: null }));
      setAvatarLoadError(false);
      setMessage('ფოტო წაიშალა');
    } catch {
      setMessage('ფოტოს წაშლა ვერ მოხერხდა');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/profiles/avatar', formData);
      setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }));
      setMessage('ფოტო განახლდა!');
    } catch {
      setMessage('ფოტოს ატვირთვა ვერ მოხერხდა');
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const { data } = await api.post('/profiles/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, cvUrl: data.cvUrl }));
      setMessage('CV განახლდა!');
    } catch {
      setMessage('CV-ის ატვირთვა ვერ მოხერხდა');
    }
  };

  const displayName = profile
    ? (profile.firstName
        ? profile.firstName + ' ' + (profile.lastName || '')
        : profile.companyName || '')
    : '';

  const initials = displayName.trim().slice(0, 2).toUpperCase();

  const navItems = user?.role === 'EMPLOYER'
    ? [
        { key: 'jobs',       label: 'ჩემი ვაკანსიები', count: jobs.length },
        { key: 'applicants', label: 'განმცხადებლები',   count: null },
        { key: 'cvboxes',    label: 'CV Boxes',          count: myBoxes.length || null },
        { key: 'analytics',  label: 'ანალიტიკა',        count: null },
        { key: 'settings',   label: 'პარამეტრები',       count: null },
      ]
    : [
        { key: 'applications', label: 'განაცხადები', count: applications.length },
        { key: 'cv',           label: 'ჩემი CV',      count: null },
        { key: 'settings',     label: 'პროფილი',      count: null },
      ];

  return (
    <div className='min-h-screen bg-surface text-text-primary'>
      <Navbar />

      <div className='max-w-5xl mx-auto pt-[5.25rem] px-5 pb-12 flex flex-col md:flex-row gap-8'>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className='w-full md:w-[220px] flex-shrink-0 pt-5'>
          <Card padding='none' className='overflow-hidden sticky top-[6.5rem]'>

            {/* Profile card */}
            <div className='px-5 pt-6 pb-5 border-b border-border-subtle'>
              {user?.role === 'EMPLOYER' ? (
                <>
                  <div className='relative w-fit mb-4'>
                    {profile?.avatarUrl && !avatarLoadError ? (
                      <img
                        src={assetUrl(profile.avatarUrl)}
                        alt='avatar'
                        onError={() => setAvatarLoadError(true)}
                        className='w-12 h-12 rounded-xl object-cover border border-border-subtle shadow-sm'
                      />
                    ) : (
                      <div className='w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-400/20 flex items-center justify-center font-display font-semibold text-brand-400 text-[15px] shadow-sm'>
                        {initials}
                      </div>
                    )}
                    <label className='absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-brand-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-brand-500 transition-all duration-150 shadow-lg border border-surface'>
                      <input type='file' accept='.jpg,.jpeg,.png,.webp' className='hidden' onChange={handleAvatarUpload} />
                      <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='3'>
                        <path d='M12 5v14M5 12h14'/>
                      </svg>
                    </label>
                    {profile?.avatarUrl && !avatarLoadError && (
                      <button
                        onClick={handleAvatarDelete}
                        title='ფოტოს წაშლა'
                        className='absolute -top-1.5 -right-1.5 w-6 h-6 bg-danger-500 rounded-lg flex items-center justify-center hover:bg-danger-600 transition-all duration-150 shadow-lg border border-surface'>
                        <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='3'>
                          <path d='M18 6 6 18M6 6l12 12'/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className='font-semibold text-md text-text-primary leading-tight'>{displayName || '—'}</p>
                  <p className='text-xs text-text-muted mt-1'>დამსაქმებელი</p>
                </>
              ) : (
                <>
                  <p className='font-semibold text-md text-text-primary leading-tight mb-1'>{displayName || '—'}</p>
                  <p className='text-xs text-text-muted'>კანდიდატი</p>
                </>
              )}
            </div>

            {/* Navigation */}
            <div className='px-2 py-2'>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActivePanel(item.key)}
                  className={'flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 group ' +
                    (activePanel === item.key
                      ? 'bg-brand-600/10 text-brand-400 font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-100')}>
                  {item.label}
                  {item.count !== null && item.count > 0 && (
                    <span className='text-[10px] bg-surface-200 text-text-muted px-2 py-0.5 rounded-full font-bold group-hover:bg-surface-300 transition-colors'>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}

              <div className='mx-3 my-2.5 h-px bg-border-subtle' />

              <button
                onClick={logout}
                className='flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/>
                </svg>
                გასვლა
              </button>
            </div>

          </Card>
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className='flex-1 min-w-0 pt-5'>

          {/* Toast message */}
          {message && (
            <Card padding='sm' className='flex items-center gap-3 mb-6 animate-slide-up border-teal-500/20 bg-teal-500/5'>
              <div className='w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)] flex-shrink-0' />
              <p className='text-sm text-teal-400/90'>{message}</p>
              <button onClick={() => setMessage('')} className='ml-auto text-text-muted hover:text-text-secondary transition-colors duration-150'>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M18 6 6 18M6 6l12 12'/>
                </svg>
              </button>
            </Card>
          )}

          {/* ════ EMPLOYER: My Jobs ═══════════════════════════ */}
          {activePanel === 'jobs' && user?.role === 'EMPLOYER' && (
            <div>
              {/* Stats row */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                {[
                  { label: 'აქტიური ვაკანსია', value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'ნახვები სულ',       value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'განაცხადები სულ',   value: jobs.reduce((a, j) => a + (j._count?.applications || 0), 0) },
                ].map(stat => (
                  <Card key={stat.label} padding='md' className='flex flex-col justify-between min-h-[100px]'>
                    <p className='text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3'>{stat.label}</p>
                    <p className='font-display font-bold text-[28px] text-text-primary leading-none tracking-tight'>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div className='flex items-center justify-between mb-5'>
                <p className='font-bold text-md text-text-primary tracking-tight'>გამოქვეყნებული ვაკანსიები</p>
                <Button
                  size='sm'
                  variant={showJobForm ? 'secondary' : 'primary'}
                  onClick={() => setShowJobForm(!showJobForm)}
                >
                  {showJobForm ? 'გაუქმება' : '+ ახალი ვაკანსია'}
                </Button>
              </div>

              {showJobForm && (
                <Card className='mb-8 animate-in fade-in slide-in-from-top-4 duration-300'>
                  <form onSubmit={handlePostJob} className='space-y-5'>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>დასახელება *</label>
                      <input required placeholder='მაგ: Frontend Developer' value={jobForm.title}
                        onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>აღწერა *</label>
                      <textarea required placeholder='სამუშაოს სრული აღწერა...' value={jobForm.description} rows={6}
                        onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                        className={TEXTAREA} />
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>ლოკაცია</label>
                        <input placeholder='თბილისი' value={jobForm.location}
                          onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))}
                          className={INPUT} />
                      </div>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>ხელფასი (₾) *</label>
                        <input required type='number' placeholder='2000' value={jobForm.salaryMin}
                          onChange={e => setJobForm(p => ({ ...p, salaryMin: e.target.value }))}
                          className={INPUT} />
                      </div>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>სამუშაო ფორმატი</label>
                        <select value={jobForm.jobRegime} onChange={e => setJobForm(p => ({ ...p, jobRegime: e.target.value }))}
                          className={SELECT_CLS + ' w-full'}>
                          <option value='FULL_TIME'>ადგილზე</option>
                          <option value='REMOTE'>დისტანციური</option>
                          <option value='HYBRID'>ჰიბრიდული</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>გამოცდილება</label>
                        <select value={jobForm.experience} onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))}
                          className={SELECT_CLS + ' w-full'}>
                          <option value='NONE'>არ სჭირდება</option>
                          <option value='ONE_TO_THREE'>1–3 წელი</option>
                          <option value='THREE_TO_FIVE'>3–5 წელი</option>
                          <option value='FIVE_PLUS'>5+ წელი</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>კატეგორია</label>
                        <select value={jobForm.category} onChange={e => setJobForm(p => ({ ...p, category: e.target.value }))}
                          className={SELECT_CLS + ' w-full'}>
                          <option value='IT'>IT და ტექნოლოგია</option>
                          <option value='SALES'>გაყიდვები</option>
                          <option value='MARKETING'>მარკეტინგი</option>
                          <option value='FINANCE'>ფინანსები</option>
                          <option value='DESIGN'>დიზაინი</option>
                          <option value='MANAGEMENT'>მენეჯმენტი</option>
                          <option value='LOGISTICS'>ლოჯისტიკა</option>
                          <option value='HEALTHCARE'>მედიცინა</option>
                          <option value='EDUCATION'>განათლება</option>
                          <option value='HOSPITALITY'>სტუმართმოყვარეობა</option>
                          <option value='OTHER'>სხვა</option>
                        </select>
                      </div>
                      <div>
                        <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>განაცხადის მეთოდი</label>
                        <select value={jobForm.applicationMethod} onChange={e => setJobForm(p => ({ ...p, applicationMethod: e.target.value }))}
                          className={SELECT_CLS + ' w-full'}>
                          <option value='CV_ONLY'>მხოლოდ CV</option>
                          <option value='FORM_ONLY'>მხოლოდ ფორმა</option>
                          <option value='BOTH'>CV და ფორმა</option>
                        </select>
                      </div>
                    </div>

                    {/* Pricing tier */}
                    <div className='pt-2'>
                      <label className='text-xs text-text-secondary block mb-3 font-medium ml-1'>განთავსების პაკეტი</label>
                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        {[
                          { tier: 'USUAL',        price: 35, label: 'სტანდარტული', color: 'brand',  perks: ['ძებნაში გამოჩნდება', '30 დღე', 'განაცხადების მართვა'] },
                          { tier: 'PREMIUM',      price: 65, label: 'პრემიუმ',     color: 'amber',  perks: ['კარუსელში გამოჩენა', 'Premium ბეჯი', 'პრიორიტეტი ძებნაში'] },
                          { tier: 'PREMIUM_PLUS', price: 95, label: 'პრემიუმ+',    color: 'brand+', perks: ['Top კარუსელი', 'მაქს. პრიორიტეტი', 'Premium+ ბეჯი'] },
                        ].map(({ tier, price, label, perks }) => (
                          <button
                            key={tier}
                            type='button'
                            onClick={() => setJobForm(p => ({ ...p, pricingTier: tier }))}
                            className={[
                              'relative rounded-2xl border-2 p-4 text-left transition-all duration-200 group/tier',
                              jobForm.pricingTier === tier
                                ? tier === 'PREMIUM_PLUS'
                                  ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_15px_rgba(123,95,228,0.1)]'
                                  : tier === 'PREMIUM'
                                    ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                    : 'border-brand-400 bg-brand-400/10'
                                : 'border-border-subtle bg-surface-100 hover:border-border-strong',
                            ].join(' ')}
                          >
                            {tier === 'PREMIUM' && (
                              <span className='absolute -top-2.5 left-4 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-sm'>Premium</span>
                            )}
                            {tier === 'PREMIUM_PLUS' && (
                              <span className='absolute -top-2.5 left-4 bg-brand-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase flex items-center gap-1 shadow-sm'>
                                <svg width='8' height='8' viewBox='0 0 24 24' fill='currentColor' className='text-amber-400'>
                                  <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/>
                                </svg>
                                Premium+
                              </span>
                            )}
                            {jobForm.pricingTier === tier && (
                              <span className={[
                                'absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border border-white/20',
                                tier === 'PREMIUM_PLUS' ? 'bg-brand-500' : tier === 'PREMIUM' ? 'bg-amber-400' : 'bg-brand-400',
                              ].join(' ')}>
                                <svg className='w-2.5 h-2.5 text-white' fill='none' viewBox='0 0 10 10'>
                                  <path d='M2 5l2.5 2.5L8 3' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                                </svg>
                              </span>
                            )}
                            <p className='text-xl font-black text-text-primary tracking-tight'>{price} ₾</p>
                            <p className='text-xs font-bold text-text-secondary mt-0.5'>{label}</p>
                            <ul className='mt-3 space-y-1.5'>
                              {perks.map(p => (
                                <li key={p} className='text-[11px] text-text-muted flex items-start gap-1.5'>
                                  <svg className='w-3 h-3 text-success mt-0.5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='3'>
                                    <path d='M5 13l4 4L19 7' />
                                  </svg>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-4 border-t border-border-subtle'>
                      <p className='text-xs text-text-muted'>
                        სულ გადასახდელი: <span className='font-bold text-text-primary text-md ml-1'>{jobForm.pricingTier === 'PREMIUM_PLUS' ? '95 ₾' : jobForm.pricingTier === 'PREMIUM' ? '65 ₾' : '35 ₾'}</span>
                      </p>
                      <Button type='submit' loading={paying} className='px-10'>
                        გადახდა და განთავსება
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              <div className='flex flex-col gap-3'>
                {jobs.map(job => (
                  <Card key={job.id} padding='md' className={[
                    'transition-all duration-200',
                    job.paymentStatus === 'PENDING' ? 'opacity-60 border-amber-500/30' : 'hover:border-border-strong',
                  ].join(' ')}>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap mb-1.5'>
                          <h4 className='font-bold text-md text-text-primary truncate'>{job.title}</h4>
                          <Badge variant={job.status === 'HIRING' ? 'success' : 'default'} size='sm' dot>
                            {job.status === 'HIRING' ? 'აქტიური' : 'დახურული'}
                          </Badge>
                          {job.pricingTier === 'PREMIUM_PLUS' && (
                            <Badge variant='brand' size='sm'>PREMIUM+</Badge>
                          )}
                          {job.pricingTier === 'PREMIUM' && (
                            <Badge variant='premium' size='sm'>PREMIUM</Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-xs text-text-muted flex-wrap'>
                          <span className='font-bold text-text-secondary'>{(job.salary || 0).toLocaleString()} ₾</span>
                          {job.location && (
                            <>
                              <span className='opacity-30'>·</span>
                              <span>{job.location}</span>
                            </>
                          )}
                          <span className='opacity-30'>·</span>
                          <span>{job.views} ნახვა</span>
                          <span className='opacity-30'>·</span>
                          <span>{job._count?.applications || 0} განაცხადი</span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 flex-shrink-0'>
                        <Button size='sm' variant='secondary' onClick={() => viewApplicants(job)}>
                          განმცხადებლები
                        </Button>
                        {job.status === 'HIRING' && job.paymentStatus === 'PAID' && (
                          <Button size='sm' variant='ghost' onClick={() => handleCloseJob(job.id)} className='text-text-muted hover:text-text-primary'>
                            დახურვა
                          </Button>
                        )}
                        <Button size='sm' variant='ghost' onClick={() => handleDeleteJob(job.id)} className='text-danger hover:bg-danger/10'>
                          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2'/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    {job.paymentStatus === 'PENDING' && (
                      <div className='mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-500 font-medium'>
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                          <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
                        </svg>
                        გადახდა არ დასრულებულა. ვაკანსია არ ჩანს ძებნაში.
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {jobs.length === 0 && (
                <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                  <div className='w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle'>
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-text-muted'>
                      <path d='M12 5v14M5 12h14'/>
                    </svg>
                  </div>
                  <p className='text-md font-bold text-text-primary mb-1'>ვაკანსიები არ გაქვთ</p>
                  <p className='text-sm text-text-muted mb-6'>განათავსეთ პირველი ვაკანსიაAz-ზე</p>
                  <Button onClick={() => setShowJobForm(true)}>+ ახალი ვაკანსია</Button>
                </Card>
              )}
            </div>
          )}

          {/* ════ EMPLOYER: Applicants ════════════════════════ */}
          {activePanel === 'applicants' && user?.role === 'EMPLOYER' && (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='font-bold text-lg text-text-primary tracking-tight'>
                    {selectedJob ? selectedJob.title : 'განმცხადებლები'}
                  </h3>
                  {selectedJob && (
                    <p className='text-xs text-text-muted mt-1 font-medium'>
                      {applicants.length} განმცხადებელი
                    </p>
                  )}
                </div>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => setActivePanel('jobs')}
                  leadingIcon={
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                      <path d='M19 12H5M12 19l-7-7 7-7'/>
                    </svg>
                  }
                >
                  უკან
                </Button>
              </div>

              {!selectedJob && (
                <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                  <p className='text-sm text-text-muted'>ჯერ ვაკანსია არ არის არჩეული</p>
                </Card>
              )}

              <div className='flex flex-col gap-3'>
                {applicants.map(app => (
                  <Card key={app.id} padding='md' className='hover:border-border-strong transition-colors'>
                    <div className='flex items-center gap-4'>
                      <div className='w-11 h-11 rounded-xl bg-surface-200 flex items-center justify-center text-[13px] font-bold text-text-secondary flex-shrink-0 border border-border-subtle shadow-sm'>
                        {((app.candidate.firstName || '') + ' ' + (app.candidate.lastName || '')).trim().slice(0, 2).toUpperCase()}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-md font-bold text-text-primary'>
                          {(app.candidate.firstName || '') + ' ' + (app.candidate.lastName || '')}
                        </p>
                        {app.coverLetter && (
                          <p className='text-xs text-text-muted truncate mt-1 italic'>&ldquo;{app.coverLetter}&rdquo;</p>
                        )}
                        <p className='text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold opacity-60'>
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='flex items-center gap-4'>
                        {(app.cvUrl || app.candidate?.cvUrl) && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-brand-400 hover:text-brand-300'
                            onClick={() => {
                              api.post('/applications/' + app.id + '/view-cv');
                              window.open(assetUrl(app.cvUrl || app.candidate?.cvUrl), '_blank');
                            }}
                          >
                            CV ↗
                          </Button>
                        )}
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          className={SELECT_CLS + ' h-9'}>
                          <option value='PENDING'>მოლოდინში</option>
                          <option value='REVIEWING'>განიხილება</option>
                          <option value='SHORTLISTED'>შორტლისტი</option>
                          <option value='REJECTED'>უარყოფილია</option>
                          <option value='HIRED'>აყვანილია</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
                {selectedJob && applicants.length === 0 && (
                  <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                    <p className='text-sm text-text-muted'>განმცხადებელი ჯერ არ არის</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ════ EMPLOYER: CV Box (one per company) ═══════ */}
          {activePanel === 'cvboxes' && user?.role === 'EMPLOYER' && (() => {
            const box = myBoxes[0] || null;
            return (
              <div>
                <h3 className='font-bold text-lg text-text-primary tracking-tight mb-6'>CV Box</h3>

                {!box ? (
                  <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                    <div className='w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle'>
                      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-text-muted'>
                        <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2'/><circle cx='12' cy='7' r='4'/>
                      </svg>
                    </div>
                    <p className='text-md font-bold text-text-primary mb-1'>CV Box ჯერ არ გაქვთ</p>
                    <p className='text-sm text-text-muted mb-6'>კანდიდატები პირდაპირ გამოგიგზავნიანთ CV-ს</p>
                    <Button onClick={handleCreateBox}>+ CV Box-ის შექმნა</Button>
                  </Card>
                ) : (
                  <Card padding='lg' className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-border-strong transition-all'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-2xl bg-brand-600/10 border border-brand-400/20 flex items-center justify-center text-brand-400'>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'/>
                        </svg>
                      </div>
                      <div>
                        <div className='flex items-center gap-3 mb-1'>
                          <p className='font-bold text-md text-text-primary'>Drop your CV here</p>
                          <Badge variant={box.isActive ? 'success' : 'default'} dot>
                            {box.isActive ? 'აქტიური' : 'გათიშული'}
                          </Badge>
                        </div>
                        <p className='text-xs text-text-muted font-medium'>{box._count?.submissions ?? 0} CV გამოგზავნილი</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Button variant='secondary' size='sm' onClick={() => toggleBoxActive(box)}>
                        {box.isActive ? 'გათიშვა' : 'გააქტიურება'}
                      </Button>
                      <Button size='sm' onClick={() => viewBoxSubmissions(box)}>
                        CV-ების ნახვა
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            );
          })()}

          {/* ════ EMPLOYER: Box Submissions ══════════════════ */}
          {activePanel === 'box-submissions' && user?.role === 'EMPLOYER' && (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='font-bold text-lg text-text-primary tracking-tight'>
                    {selectedBox ? selectedBox.title : 'CV-ები'}
                  </h3>
                  {selectedBox && (
                    <p className='text-xs text-text-muted mt-1 font-medium'>
                      {boxSubmissions.length} CV გამოგზავნილი
                    </p>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  <select
                    value={subCatFilter}
                    onChange={e => setSubCatFilter(e.target.value)}
                    className={SELECT_CLS + ' h-9 px-3'}>
                    <option value='ALL'>ყველა კატეგორია</option>
                    <option value='IT'>IT</option>
                    <option value='SALES'>გაყიდვები</option>
                    <option value='MARKETING'>მარკეტინგი</option>
                    <option value='FINANCE'>ფინანსები</option>
                    <option value='DESIGN'>დიზაინი</option>
                    <option value='MANAGEMENT'>მენეჯმენტი</option>
                    <option value='OTHER'>სხვა</option>
                  </select>
                  <Button
                    size='sm'
                    variant='secondary'
                    onClick={() => setActivePanel('cvboxes')}
                    leadingIcon={
                      <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                        <path d='M19 12H5M12 19l-7-7 7-7'/>
                      </svg>
                    }
                  >
                    უკან
                  </Button>
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                {boxSubmissions
                  .filter(s => subCatFilter === 'ALL' || (s.categories || []).includes(subCatFilter))
                  .map(sub => (
                  <Card key={sub.id} padding='md' className='hover:border-border-strong transition-colors'>
                    <div className='flex items-center gap-4'>
                      <div className='w-11 h-11 rounded-xl bg-surface-200 flex items-center justify-center text-[13px] font-bold text-text-secondary flex-shrink-0 border border-border-subtle shadow-sm'>
                        {sub.candidateName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-1'>
                          <p className='text-md font-bold text-text-primary'>{sub.candidateName}</p>
                          <span className='text-[10px] text-text-muted opacity-60 font-bold uppercase tracking-wider'>
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className='text-xs text-text-muted font-medium'>{sub.candidateEmail}</p>
                        
                        {(sub.categories || []).length > 0 && (
                          <div className='flex flex-wrap gap-1.5 mt-2.5'>
                            {sub.categories.map(cat => (
                              <Tag key={cat} variant='brand' size='xs'>
                                {CAT_LABEL_GEO[cat] || cat}
                              </Tag>
                            ))}
                          </div>
                        )}
                        {sub.message && (
                          <p className='text-xs text-text-muted mt-2 italic line-clamp-1 opacity-80'>&ldquo;{sub.message}&rdquo;</p>
                        )}
                      </div>
                      {sub.cvUrl && (
                        <Button
                          variant='primary'
                          size='sm'
                          className='flex-shrink-0'
                          onClick={async () => {
                            try {
                              await api.post(`/company-boxes/${selectedBox.id}/submissions/${sub.id}/view`);
                            } catch (_) {}
                            window.open(sub.cvUrl, '_blank', 'noreferrer');
                          }}>
                          CV ↗
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {boxSubmissions.length === 0 && (
                  <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                    <p className='text-sm text-text-muted'>CV ჯერ არ არის გამოგზავნილი</p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ════ EMPLOYER: Analytics ════════════════════════ */}
          {activePanel === 'analytics' && user?.role === 'EMPLOYER' && (
            <div>
              <h3 className='font-bold text-lg text-text-primary tracking-tight mb-6'>ანალიტიკა</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                {[
                  { label: 'ნახვები სულ',      value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'განაცხადები სულ',   value: jobs.reduce((a, j) => a + (j._count?.applications || 0), 0) },
                  { label: 'აქტიური ვაკანსია',  value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'დახურული ვაკანსია', value: jobs.filter(j => j.status === 'CLOSED').length },
                ].map(stat => (
                  <Card key={stat.label} padding='md' className='flex flex-col justify-between min-h-[100px]'>
                    <p className='text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3'>{stat.label}</p>
                    <p className='font-display font-bold text-[28px] text-text-primary leading-none tracking-tight'>{stat.value}</p>
                  </Card>
                ))}
              </div>
              <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                <p className='text-sm text-text-muted font-medium'>გრაფიკები მალე დაემატება</p>
              </Card>
            </div>
          )}

          {/* ════ EMPLOYER: Settings ════════════════════════ */}
          {activePanel === 'settings' && user?.role === 'EMPLOYER' && (
            <div>
              <h3 className='font-bold text-lg text-text-primary tracking-tight mb-6'>კომპანიის პროფილი</h3>
              <Card padding='lg'>
                <form onSubmit={handleUpdateProfile} className='space-y-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>კომპანიის სახელი</label>
                      <input value={form.companyName || ''} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>ვებსაიტი</label>
                      <input value={form.website || ''} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                        placeholder='https://company.ge'
                        className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>კომპანიის აღწერა</label>
                    <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={6}
                      placeholder='მოკლე ინფორმაცია კომპანიის შესახებ...'
                      className={TEXTAREA} />
                  </div>
                  <div>
                    <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>მობილური</label>
                    <input value={form.user?.phone || form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder='+995 555 00 00 00'
                      className={INPUT} />
                  </div>
                  <div className='flex justify-end pt-4 border-t border-border-subtle'>
                    <Button type='submit' className='px-12'>პროფილის შენახვა</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* ════ CANDIDATE: Applications ════════════════════ */}
          {activePanel === 'applications' && user?.role === 'CANDIDATE' && (
            <div>
              {/* Stats row */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
                {[
                  { label: 'განაცხადები', value: applications.length },
                  { label: 'განხილვაში',  value: applications.filter(a => a.status === 'REVIEWING' || a.status === 'SHORTLISTED').length },
                  { label: 'შორტლისტი',  value: applications.filter(a => a.status === 'SHORTLISTED').length },
                ].map(stat => (
                  <Card key={stat.label} padding='md' className='flex flex-col justify-between min-h-[100px]'>
                    <p className='text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3'>{stat.label}</p>
                    <p className='font-display font-bold text-[28px] text-text-primary leading-none tracking-tight'>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <h3 className='font-bold text-lg text-text-primary tracking-tight mb-5'>ჩემი განაცხადები</h3>

              <div className='flex flex-col gap-3'>
                {applications.map(app => (
                  <Card key={app.id} padding='md' className='hover:border-border-strong transition-all group'>
                    <div className='flex items-center gap-4'>
                      <CompanyAvatar company={app.job.employer} size='sm' />
                      <div className='flex-1 min-w-0'>
                        <p
                          className='text-md font-bold text-text-primary cursor-pointer group-hover:text-brand-400 transition-colors duration-150 truncate'
                          onClick={() => navigate('/jobs/' + app.jobId)}>
                          {app.job.title}
                        </p>
                        <p className='text-xs text-text-muted mt-1 font-medium'>
                          {app.job.employer.companyName}
                          <span className='mx-1.5 opacity-30'>·</span>
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={STATUS_STYLES[app.status]} dot>
                        {STATUS_GEO[app.status]}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {applications.length === 0 && (
                  <Card className='text-center py-16 bg-surface-50/50 border-dashed'>
                    <p className='text-sm text-text-muted mb-6'>განაცხადი ჯერ არ გაქვთ</p>
                    <Button onClick={() => navigate('/')}>ვაკანსიების ძიება</Button>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ════ CANDIDATE: CV ═══════════════════════════════ */}
          {activePanel === 'cv' && user?.role === 'CANDIDATE' && (
            <div>
              <h3 className='font-bold text-lg text-text-primary tracking-tight mb-6'>ჩემი CV</h3>

              {profile?.cvUrl ? (
                <Card padding='md' className='flex items-center gap-4 mb-6 bg-brand-600/5 border-brand-400/20'>
                  <div className='w-12 h-12 bg-brand-600/10 rounded-xl flex items-center justify-center flex-shrink-0 text-brand-400 border border-brand-400/20'>
                    <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/><polyline points='14 2 14 8 20 8'/>
                    </svg>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-md font-bold text-text-primary'>ჩემი CV</p>
                    <p className='text-xs text-text-muted mt-1 font-medium tracking-wide uppercase opacity-60'>ატვირთულია · PDF</p>
                  </div>
                  <Button variant='secondary' size='sm' onClick={() => window.open(assetUrl(profile.cvUrl), '_blank')}>
                    გახსნა ↗
                  </Button>
                </Card>
              ) : (
                <Card padding='md' className='flex items-start gap-4 mb-6 border-warning-500/20 bg-warning-500/5'>
                  <div className='text-warning mt-1'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                      <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
                    </svg>
                  </div>
                  <p className='text-sm text-warning-600 font-medium'>
                    CV არ გაქვთ ატვირთული. ვაკანსიაზე განაცხადისას გაგიჭირდებათ.
                  </p>
                </Card>
              )}

              <label className='flex flex-col items-center justify-center border-2 border-dashed border-border-subtle hover:border-brand-500/50 hover:bg-brand-500/5 rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 group'>
                <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={handleCvUpload} />
                <div className='w-14 h-14 rounded-2xl bg-surface-100 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center mb-5 transition-all duration-300 border border-border-subtle shadow-sm'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                  </svg>
                </div>
                <p className='text-md font-bold text-text-primary group-hover:text-brand-400 transition-colors duration-200'>
                  {profile?.cvUrl ? 'ახალი CV-ის ატვირთვა' : 'ატვირთეთ თქვენი CV'}
                </p>
                <p className='text-xs text-text-muted mt-2 font-medium opacity-60'>PDF ან Word · მაქს. 5MB</p>
              </label>
            </div>
          )}

          {/* ════ CANDIDATE: Settings ════════════════════════ */}
          {activePanel === 'settings' && user?.role === 'CANDIDATE' && (
            <div>
              <h3 className='font-bold text-lg text-text-primary tracking-tight mb-6'>პროფილის რედაქტირება</h3>
              <Card padding='lg'>
                <form onSubmit={handleUpdateProfile} className='space-y-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>სახელი</label>
                      <input value={form.firstName || ''} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                        placeholder='სახელი'
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>გვარი</label>
                      <input value={form.lastName || ''} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                        placeholder='გვარი'
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>ლოკაცია</label>
                      <input value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                        placeholder='თბილისი'
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>მობილური</label>
                      <input value={form.user?.phone || form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder='+995 555 00 00 00'
                        className={INPUT} />
                    </div>
                  </div>
                  <div>
                    <label className='text-xs text-text-secondary block mb-2 font-medium ml-1'>სათაური / პოზიცია</label>
                    <input value={form.headline || ''} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                      placeholder='მაგ: React Developer · 4 წლიანი გამოცდილებით'
                      className={INPUT} />
                  </div>
                  <div className='flex justify-end pt-4 border-t border-border-subtle'>
                    <Button type='submit' className='px-12'>პროფილის შენახვა</Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
