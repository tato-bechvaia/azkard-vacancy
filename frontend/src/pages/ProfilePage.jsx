import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { assetUrl } from '../utils/assetUrl';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';
import CompanyAvatar from '../components/CompanyAvatar';

const STATUS_STYLES = {
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  REVIEWING:   'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-brand-50 text-brand-600 border-brand-200',
  REJECTED:    'bg-red-50 text-red-500 border-red-200',
  HIRED:       'bg-teal-50 text-teal-700 border-teal-200',
};

const STATUS_DOT = {
  PENDING:     'bg-amber-400',
  REVIEWING:   'bg-blue-400',
  SHORTLISTED: 'bg-brand-500',
  REJECTED:    'bg-red-400',
  HIRED:       'bg-teal-400',
};

const STATUS_GEO = {
  PENDING:     'განხილვის მოლოდინში',
  REVIEWING:   'განიხილება',
  SHORTLISTED: 'შორტლისტი',
  REJECTED:    'უარყოფილია',
  HIRED:       'აყვანილია',
};

const INPUT = 'w-full h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100/60 transition-all duration-150 placeholder-gray-400';
const TEXTAREA = 'w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100/60 transition-all duration-150 resize-none placeholder-gray-400';
const SELECT_CLS = 'h-10 bg-surface-50 border border-surface-200 rounded-lg px-3 text-[13px] text-gray-700 focus:outline-none focus:border-brand-400 transition-colors duration-150';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(user?.role === 'EMPLOYER' ? 'jobs' : 'applications');

  const [jobs, setJobs]                       = useState([]);
  const [applications, setApplications]       = useState([]);
  const [applicants, setApplicants]           = useState([]);
  const [selectedJob, setSelectedJob]         = useState(null);
  const [profile, setProfile]                 = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [form, setForm]                       = useState({});
  const [message, setMessage]                 = useState('');
  const [showJobForm, setShowJobForm]         = useState(false);
  const [jobForm, setJobForm]                 = useState({
    title: '', description: '', location: '',
    salaryMin: '', jobRegime: 'FULL_TIME',
    experience: 'NONE', applicationMethod: 'CV_ONLY',
    category: 'OTHER',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/profiles/me').then(({ data }) => {
      setProfile(data);
      setForm(data);
    }).catch(() => {});

    if (user.role === 'EMPLOYER') {
      api.get('/jobs/mine').then(({ data }) => setJobs(data)).catch(() => {});
    } else {
      api.get('/applications/mine').then(({ data }) => setApplications(data)).catch(() => {});
    }
  }, []);

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
      await api.post('/jobs', jobForm);
      setShowJobForm(false);
      setMessage('ვაკანსია გამოქვეყნდა!');
      const { data } = await api.get('/jobs/mine');
      setJobs(data);
      setJobForm({
        title: '', description: '', location: '',
        salaryMin: '', jobRegime: 'FULL_TIME',
        experience: 'NONE', applicationMethod: 'CV_ONLY',
        category: 'OTHER',
      });
    } catch (err) {
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
        { key: 'analytics',  label: 'ანალიტიკა',        count: null },
        { key: 'settings',   label: 'პარამეტრები',       count: null },
      ]
    : [
        { key: 'applications', label: 'განაცხადები', count: applications.length },
        { key: 'cv',           label: 'ჩემი CV',      count: null },
        { key: 'settings',     label: 'პროფილი',      count: null },
      ];

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-5xl mx-auto pt-[4.5rem] px-5 pb-12 flex gap-5'>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className='w-[200px] flex-shrink-0 pt-5'>
          <div className='bg-white border border-gray-100 rounded-2xl overflow-hidden'>

            {/* Profile card */}
            <div className='px-5 pt-6 pb-5 border-b border-gray-100'>
              <div className='relative w-fit mb-4'>
                {profile?.avatarUrl && !avatarLoadError ? (
                  <img
                    src={assetUrl(profile.avatarUrl)}
                    alt='avatar'
                    onError={() => setAvatarLoadError(true)}
                    className='w-12 h-12 rounded-full object-cover border border-gray-100'
                  />
                ) : (
                  <div className='w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-semibold text-brand-600 text-[15px]'>
                    {initials}
                  </div>
                )}
                <label className='absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-700 transition-colors duration-150 shadow-sm'>
                  <input type='file' accept='.jpg,.jpeg,.png,.webp' className='hidden' onChange={handleAvatarUpload} />
                  <svg width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
                    <path d='M12 5v14M5 12h14'/>
                  </svg>
                </label>
              </div>
              <p className='font-semibold text-[13.5px] text-gray-900 leading-tight'>{displayName || '—'}</p>
              <p className='text-[11.5px] text-gray-400 mt-0.5'>
                {user?.role === 'EMPLOYER' ? 'დამსაქმებელი' : 'კანდიდატი'}
              </p>
            </div>

            {/* Navigation */}
            <div className='px-2 py-2'>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActivePanel(item.key)}
                  className={'flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-[12.5px] transition-colors duration-150 ' +
                    (activePanel === item.key
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}>
                  {item.label}
                  {item.count !== null && item.count > 0 && (
                    <span className='text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium'>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}

              <div className='mx-3 my-2 h-px bg-gray-100' />

              <button
                onClick={logout}
                className='flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-[12.5px] text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150'>
                <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
                  <path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/>
                </svg>
                გასვლა
              </button>
            </div>

          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <main className='flex-1 min-w-0 pt-5'>

          {/* Toast message */}
          {message && (
            <div className='flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4 shadow-card animate-slide-up'>
              <div className='w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0' />
              <p className='text-[13px] text-gray-700'>{message}</p>
              <button onClick={() => setMessage('')} className='ml-auto text-gray-300 hover:text-gray-500 transition-colors duration-150'>
                <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M18 6 6 18M6 6l12 12'/>
                </svg>
              </button>
            </div>
          )}

          {/* ════ EMPLOYER: My Jobs ═══════════════════════════ */}
          {activePanel === 'jobs' && user?.role === 'EMPLOYER' && (
            <div>
              {/* Stats row */}
              <div className='grid grid-cols-3 gap-3 mb-6'>
                {[
                  { label: 'აქტიური ვაკანსია', value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'ნახვები სულ',       value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'განაცხადები სულ',   value: jobs.reduce((a, j) => a + (j._count?.applications || 0), 0) },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-gray-100 rounded-xl p-5'>
                    <p className='text-[10.5px] text-gray-400 uppercase tracking-wider mb-2'>{stat.label}</p>
                    <p className='font-display font-semibold text-[26px] text-gray-900 leading-none'>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className='flex items-center justify-between mb-4'>
                <p className='font-semibold text-[14px] text-gray-900'>გამოქვეყნებული ვაკანსიები</p>
                <button
                  onClick={() => setShowJobForm(!showJobForm)}
                  className={'text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg transition-colors duration-150 ' +
                    (showJobForm
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-brand-600 hover:bg-brand-700 text-white')}>
                  {showJobForm ? 'გაუქმება' : '+ ახალი ვაკანსია'}
                </button>
              </div>

              {showJobForm && (
                <form onSubmit={handlePostJob} className='bg-white border border-gray-100 rounded-2xl p-6 mb-4 space-y-3.5'>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>დასახელება *</label>
                    <input required placeholder='მაგ: Frontend Developer' value={jobForm.title}
                      onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>აღწერა *</label>
                    <textarea required placeholder='სამუშაოს სრული აღწერა...' value={jobForm.description} rows={4}
                      onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                      className={TEXTAREA} />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>ლოკაცია</label>
                      <input placeholder='თბილისი' value={jobForm.location}
                        onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>ხელფასი (₾) *</label>
                      <input required type='number' placeholder='2000' value={jobForm.salaryMin}
                        onChange={e => setJobForm(p => ({ ...p, salaryMin: e.target.value }))}
                        className={INPUT} />
                    </div>
                    <div>
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>სამუშაო ფორმატი</label>
                      <select value={jobForm.jobRegime} onChange={e => setJobForm(p => ({ ...p, jobRegime: e.target.value }))}
                        className={SELECT_CLS + ' w-full'}>
                        <option value='FULL_TIME'>ადგილზე</option>
                        <option value='REMOTE'>დისტანციური</option>
                        <option value='HYBRID'>ჰიბრიდული</option>
                      </select>
                    </div>
                    <div>
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>გამოცდილება</label>
                      <select value={jobForm.experience} onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))}
                        className={SELECT_CLS + ' w-full'}>
                        <option value='NONE'>არ სჭირდება</option>
                        <option value='ONE_TO_THREE'>1–3 წელი</option>
                        <option value='THREE_TO_FIVE'>3–5 წელი</option>
                        <option value='FIVE_PLUS'>5+ წელი</option>
                      </select>
                    </div>
                    <div>
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>კატეგორია</label>
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
                      <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>განაცხადის მეთოდი</label>
                      <select value={jobForm.applicationMethod} onChange={e => setJobForm(p => ({ ...p, applicationMethod: e.target.value }))}
                        className={SELECT_CLS + ' w-full'}>
                        <option value='CV_ONLY'>მხოლოდ CV</option>
                        <option value='FORM_ONLY'>მხოლოდ ფორმა</option>
                        <option value='BOTH'>CV და ფორმა</option>
                      </select>
                    </div>
                  </div>
                  <div className='pt-1'>
                    <button type='submit' className='h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[13px] font-medium transition-colors duration-150'>
                      გამოქვეყნება
                    </button>
                  </div>
                </form>
              )}

              <div className='flex flex-col gap-2'>
                {jobs.map(job => (
                  <div key={job.id} className='bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2.5 mb-1'>
                        <p className='font-medium text-[13.5px] text-gray-900 truncate'>{job.title}</p>
                        <span className={'text-[10.5px] px-2 py-0.5 rounded-md border font-medium flex-shrink-0 ' +
                          (job.status === 'HIRING'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200')}>
                          {job.status === 'HIRING' ? 'აქტიური' : 'დახურული'}
                        </span>
                      </div>
                      <p className='text-[12px] text-gray-400'>
                        {job.salaryMin.toLocaleString()} ₾
                        {job.location ? ' · ' + job.location : ''}
                        {' · '}ნახვა: {job.views}
                        {' · '}განაცხადი: {job._count?.applications || 0}
                      </p>
                    </div>
                    <div className='flex items-center gap-3 flex-shrink-0'>
                      <button onClick={() => viewApplicants(job)}
                        className='text-[12px] text-brand-600 hover:text-brand-700 font-medium transition-colors duration-150'>
                        განმცხადებლები
                      </button>
                      {job.status === 'HIRING' && (
                        <button onClick={() => handleCloseJob(job.id)}
                          className='text-[12px] text-gray-400 hover:text-gray-600 transition-colors duration-150'>
                          დახურვა
                        </button>
                      )}
                      <button onClick={() => handleDeleteJob(job.id)}
                        className='text-[12px] text-red-400 hover:text-red-600 transition-colors duration-150'>
                        წაშლა
                      </button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className='bg-white border border-gray-100 rounded-xl text-center py-14'>
                    <p className='text-[13px] text-gray-400 mb-1'>ვაკანსია ჯერ არ გაქვთ</p>
                    <button
                      onClick={() => setShowJobForm(true)}
                      className='text-[12.5px] text-brand-600 hover:underline font-medium'>
                      + ახალი ვაკანსიის დამატება
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ EMPLOYER: Applicants ════════════════════════ */}
          {activePanel === 'applicants' && user?.role === 'EMPLOYER' && (
            <div>
              <div className='flex items-center justify-between mb-5'>
                <div>
                  <p className='font-semibold text-[14px] text-gray-900'>
                    {selectedJob ? selectedJob.title : 'განმცხადებლები'}
                  </p>
                  {selectedJob && (
                    <p className='text-[12px] text-gray-400 mt-0.5'>
                      {applicants.length} განმცხადებელი
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActivePanel('jobs')}
                  className='inline-flex items-center gap-1.5 text-[12.5px] text-gray-400 hover:text-gray-700 transition-colors duration-150'>
                  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M19 12H5M12 19l-7-7 7-7'/>
                  </svg>
                  უკან
                </button>
              </div>

              {!selectedJob && (
                <div className='bg-white border border-gray-100 rounded-xl text-center py-14 text-[13px] text-gray-400'>
                  ჯერ ვაკანსია არ არის არჩეული
                </div>
              )}

              <div className='flex flex-col gap-2'>
                {applicants.map(app => (
                  <div key={app.id} className='bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3.5'>
                    <div className='w-9 h-9 rounded-full bg-surface-100 flex items-center justify-center text-[12px] font-semibold text-gray-500 flex-shrink-0 border border-gray-100'>
                      {((app.candidate.firstName || '') + ' ' + (app.candidate.lastName || '')).trim().slice(0, 2).toUpperCase()}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-[13.5px] font-medium text-gray-900'>
                        {(app.candidate.firstName || '') + ' ' + (app.candidate.lastName || '')}
                      </p>
                      {app.coverLetter && (
                        <p className='text-[12px] text-gray-400 truncate mt-0.5'>&ldquo;{app.coverLetter}&rdquo;</p>
                      )}
                      <p className='text-[11.5px] text-gray-300 mt-0.5'>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {app.cvUrl && (
                      <a
                        href={assetUrl(app.cvUrl)}
                        target='_blank'
                        rel='noreferrer'
                        className='flex-shrink-0 text-[12px] font-medium text-brand-600 hover:underline'
                        onClick={() => api.post('/applications/' + app.id + '/view-cv')}>
                        CV ↗
                      </a>
                    )}
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className='text-[12px] bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-400 flex-shrink-0 text-gray-700'>
                      <option value='PENDING'>მოლოდინში</option>
                      <option value='REVIEWING'>განიხილება</option>
                      <option value='SHORTLISTED'>შორტლისტი</option>
                      <option value='REJECTED'>უარყოფილია</option>
                      <option value='HIRED'>აყვანილია</option>
                    </select>
                  </div>
                ))}
                {selectedJob && applicants.length === 0 && (
                  <div className='bg-white border border-gray-100 rounded-xl text-center py-14 text-[13px] text-gray-400'>
                    განმცხადებელი ჯერ არ არის
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ EMPLOYER: Analytics ════════════════════════ */}
          {activePanel === 'analytics' && user?.role === 'EMPLOYER' && (
            <div>
              <p className='font-semibold text-[14px] text-gray-900 mb-5'>ანალიტიკა</p>
              <div className='grid grid-cols-2 gap-3 mb-6'>
                {[
                  { label: 'ნახვები სულ',      value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'განაცხადები სულ',   value: jobs.reduce((a, j) => a + (j._count?.applications || 0), 0) },
                  { label: 'აქტიური ვაკანსია',  value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'დახურული ვაკანსია', value: jobs.filter(j => j.status === 'CLOSED').length },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-gray-100 rounded-xl p-5'>
                    <p className='text-[10.5px] text-gray-400 uppercase tracking-wider mb-2'>{stat.label}</p>
                    <p className='font-display font-semibold text-[26px] text-gray-900 leading-none'>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className='bg-white border border-gray-100 rounded-xl p-10 text-center'>
                <p className='text-[13px] text-gray-400'>გრაფიკები მალე დაემატება</p>
              </div>
            </div>
          )}

          {/* ════ EMPLOYER: Settings ════════════════════════ */}
          {activePanel === 'settings' && user?.role === 'EMPLOYER' && (
            <div>
              <p className='font-semibold text-[14px] text-gray-900 mb-5'>კომპანიის პროფილი</p>
              <form onSubmit={handleUpdateProfile} className='bg-white border border-gray-100 rounded-2xl p-6 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>კომპანიის სახელი</label>
                    <input value={form.companyName || ''} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                      className={INPUT} />
                  </div>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>ვებსაიტი</label>
                    <input value={form.website || ''} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                      placeholder='https://company.ge'
                      className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>კომპანიის აღწერა</label>
                  <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4}
                    placeholder='მოკლე ინფორმაცია კომპანიის შესახებ...'
                    className={TEXTAREA} />
                </div>
                <div>
                  <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>მობილური</label>
                  <input value={form.user?.phone || form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder='+995 555 00 00 00'
                    className={INPUT} />
                </div>
                <div className='pt-1'>
                  <button type='submit' className='h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[13px] font-medium transition-colors duration-150'>
                    შენახვა
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════ CANDIDATE: Applications ════════════════════ */}
          {activePanel === 'applications' && user?.role === 'CANDIDATE' && (
            <div>
              {/* Stats */}
              <div className='grid grid-cols-3 gap-3 mb-6'>
                {[
                  { label: 'განაცხადები', value: applications.length },
                  { label: 'განხილვაში',  value: applications.filter(a => a.status === 'REVIEWING' || a.status === 'SHORTLISTED').length },
                  { label: 'შორტლისტი',  value: applications.filter(a => a.status === 'SHORTLISTED').length },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-gray-100 rounded-xl p-5'>
                    <p className='text-[10.5px] text-gray-400 uppercase tracking-wider mb-2'>{stat.label}</p>
                    <p className='font-display font-semibold text-[26px] text-gray-900 leading-none'>{stat.value}</p>
                  </div>
                ))}
              </div>

              <p className='font-semibold text-[14px] text-gray-900 mb-4'>ჩემი განაცხადები</p>

              <div className='flex flex-col gap-2'>
                {applications.map(app => (
                  <div key={app.id} className='bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4'>
                    <CompanyAvatar company={app.job.employer} size='sm' />
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-[13.5px] font-medium text-gray-900 cursor-pointer hover:text-brand-600 transition-colors duration-150 leading-snug'
                        onClick={() => navigate('/jobs/' + app.jobId)}>
                        {app.job.title}
                      </p>
                      <p className='text-[12px] text-gray-400 mt-0.5'>
                        {app.job.employer.companyName}
                        {' · '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={'inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 ' + STATUS_STYLES[app.status]}>
                      <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + STATUS_DOT[app.status]} />
                      {STATUS_GEO[app.status]}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className='bg-white border border-gray-100 rounded-xl text-center py-14'>
                    <p className='text-[13px] text-gray-400 mb-2'>განაცხადი ჯერ არ გაქვთ</p>
                    <span
                      onClick={() => navigate('/')}
                      className='text-[12.5px] text-brand-600 cursor-pointer hover:underline font-medium'>
                      ვაკანსიების ძიება →
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ CANDIDATE: CV ═══════════════════════════════ */}
          {activePanel === 'cv' && user?.role === 'CANDIDATE' && (
            <div>
              <p className='font-semibold text-[14px] text-gray-900 mb-5'>ჩემი CV</p>

              {profile?.cvUrl ? (
                <div className='bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 mb-4'>
                  <div className='w-10 h-12 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#6B46E0' strokeWidth='1.5'>
                      <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z'/><polyline points='14 2 14 8 20 8'/>
                      <line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/><polyline points='10 9 9 9 8 9'/>
                    </svg>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[13.5px] font-medium text-gray-900'>ჩემი CV</p>
                    <p className='text-[12px] text-gray-400 mt-0.5'>ატვირთულია · PDF</p>
                  </div>
                  <a href={assetUrl(profile.cvUrl)} target='_blank' rel='noreferrer'
                    className='text-[12.5px] font-medium text-brand-600 hover:underline flex-shrink-0'>
                    გახსნა ↗
                  </a>
                </div>
              ) : (
                <div className='bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-4 flex items-start gap-3'>
                  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#D97706' strokeWidth='1.75' className='flex-shrink-0 mt-0.5'>
                    <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/>
                  </svg>
                  <p className='text-[12.5px] text-amber-700'>CV არ გაქვთ ატვირთული. ვაკანსიაზე განაცხადისას გაგიჭირდებათ.</p>
                </div>
              )}

              <label className='flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-brand-300 rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200 group'>
                <input type='file' accept='.pdf,.doc,.docx' className='hidden' onChange={handleCvUpload} />
                <div className='w-10 h-10 rounded-xl bg-surface-100 group-hover:bg-brand-50 flex items-center justify-center mb-3 transition-colors duration-200'>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth='1.5' className='group-hover:stroke-brand-500 transition-colors duration-200'>
                    <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/>
                  </svg>
                </div>
                <p className='text-[13px] text-gray-500 group-hover:text-gray-700 font-medium transition-colors duration-200'>
                  {profile?.cvUrl ? 'ახალი CV-ის ატვირთვა' : 'CV-ის ატვირთვა'}
                </p>
                <p className='text-[11.5px] text-gray-400 mt-1'>PDF ან Word · მაქს. 5MB</p>
              </label>
            </div>
          )}

          {/* ════ CANDIDATE: Settings ════════════════════════ */}
          {activePanel === 'settings' && user?.role === 'CANDIDATE' && (
            <div>
              <p className='font-semibold text-[14px] text-gray-900 mb-5'>პროფილის რედაქტირება</p>
              <form onSubmit={handleUpdateProfile} className='bg-white border border-gray-100 rounded-2xl p-6 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>სახელი</label>
                    <input value={form.firstName || ''} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      placeholder='სახელი'
                      className={INPUT} />
                  </div>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>გვარი</label>
                    <input value={form.lastName || ''} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      placeholder='გვარი'
                      className={INPUT} />
                  </div>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>ლოკაცია</label>
                    <input value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder='თბილისი'
                      className={INPUT} />
                  </div>
                  <div>
                    <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>მობილური</label>
                    <input value={form.user?.phone || form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder='+995 555 00 00 00'
                      className={INPUT} />
                  </div>
                </div>
                <div>
                  <label className='text-[11.5px] text-gray-500 block mb-1.5 font-medium'>სათაური / პოზიცია</label>
                  <input value={form.headline || ''} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                    placeholder='მაგ: React Developer · 4 წლიანი გამოცდილებით'
                    className={INPUT} />
                </div>
                <div className='pt-1'>
                  <button type='submit' className='h-10 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[13px] font-medium transition-colors duration-150'>
                    შენახვა
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
