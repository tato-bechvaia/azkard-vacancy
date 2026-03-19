import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import Navbar from '../components/Navbar';

const STATUS_STYLES = {
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  REVIEWING:   'bg-blue-50 text-blue-700 border-blue-200',
  SHORTLISTED: 'bg-brand-50 text-brand-600 border-brand-200',
  REJECTED:    'bg-red-50 text-red-600 border-red-200',
  HIRED:       'bg-teal-50 text-teal-700 border-teal-200',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(user?.role === 'EMPLOYER' ? 'jobs' : 'applications');

  const [jobs, setJobs]               = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicants, setApplicants]   = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [profile, setProfile]         = useState(null);
  const [form, setForm]               = useState({});
  const [message, setMessage]         = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm]         = useState({
    title: '', description: '', location: '',
    salaryMin: '', salaryMax: '', jobRegime: 'FULL_TIME',
    jobPeriod: '', experience: 'NONE', applicationMethod: 'CV_ONLY'
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
      setMessage('Job posted!');
      const { data } = await api.get('/jobs/mine');
      setJobs(data);
      setJobForm({ title: '', description: '', location: '', salaryMin: '', salaryMax: '', jobRegime: 'FULL_TIME', jobPeriod: '', experience: 'NONE', applicationMethod: 'CV_ONLY' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profiles/me', form);
      setMessage('Profile updated!');
    } catch (err) {
      setMessage('Failed to update');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete('/jobs/' + id);
    const { data } = await api.get('/jobs/mine');
    setJobs(data);
  };

  const handleCloseJob = async (id) => {
    await api.put('/jobs/' + id, { status: 'CLOSED' });
    const { data } = await api.get('/jobs/mine');
    setJobs(data);
  };

  const initials = profile
    ? (profile.fullName || profile.companyName || '').slice(0, 2).toUpperCase()
    : '';

  const displayName = profile ? (profile.fullName || profile.companyName || '') : '';

  const navItems = user?.role === 'EMPLOYER'
    ? [
        { key: 'jobs',       label: 'My Jobs',    count: jobs.length },
        { key: 'applicants', label: 'Applicants',  count: null },
        { key: 'analytics',  label: 'Analytics',   count: null },
        { key: 'settings',   label: 'Settings',    count: null },
      ]
    : [
        { key: 'applications', label: 'Applications', count: applications.length },
        { key: 'cv',           label: 'My CV',         count: null },
        { key: 'settings',     label: 'Edit Profile',  count: null },
      ];

  return (
    <div className='min-h-screen bg-surface-50'>
      <Navbar />

      <div className='max-w-5xl mx-auto pt-20 px-4 pb-10 flex gap-6'>

        {/* Sidebar */}
        <aside className='w-52 flex-shrink-0 pt-4'>
          <div className='bg-white border border-surface-200 rounded-2xl p-4'>

            <div className='flex flex-col items-center text-center mb-4 pb-4 border-b border-surface-100'>
              <div className='w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center font-display font-bold text-brand-600 text-base mb-2'>
                {initials}
              </div>
              <p className='font-display font-semibold text-sm text-gray-900'>{displayName}</p>
              <p className='text-xs text-gray-400 mt-0.5'>{user?.role === 'EMPLOYER' ? 'Employer' : 'Candidate'}</p>
            </div>

            <div className='flex flex-col gap-0.5'>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActivePanel(item.key)}
                  className={'flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition ' +
                    (activePanel === item.key
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-surface-50')}>
                  {item.label}
                  {item.count !== null && item.count > 0 && (
                    <span className='text-xs bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full'>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}

              <div className='mt-3 pt-3 border-t border-surface-100'>
                <button
                  onClick={logout}
                  className='w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition'>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className='flex-1 min-w-0 pt-4'>

          {message && (
            <div className='bg-teal-50 border border-teal-200 text-teal-700 text-sm px-4 py-2.5 rounded-xl mb-4'>
              {message}
            </div>
          )}

          {/* EMPLOYER — MY JOBS */}
          {activePanel === 'jobs' && user?.role === 'EMPLOYER' && (
            <div>
              <div className='grid grid-cols-3 gap-3 mb-6'>
                {[
                  { label: 'Active jobs', value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'Total views', value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'Applications', value: jobs.reduce((a, j) => a + j._count.applications, 0) },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-surface-200 rounded-xl p-4'>
                    <p className='text-xs text-gray-400 uppercase tracking-wider mb-1'>{stat.label}</p>
                    <p className='font-display font-bold text-2xl text-gray-900'>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className='flex items-center justify-between mb-3'>
                <p className='font-display font-semibold text-gray-900'>Posted jobs</p>
                <button
                  onClick={() => setShowJobForm(!showJobForm)}
                  className='text-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg transition'>
                  {showJobForm ? 'Cancel' : '+ New Job'}
                </button>
              </div>

              {showJobForm && (
                <form onSubmit={handlePostJob} className='bg-white border border-surface-200 rounded-xl p-5 mb-4 space-y-3'>
                  <input required placeholder='Job Title' value={jobForm.title}
                    onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))}
                    className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  <textarea required placeholder='Job Description' value={jobForm.description} rows={3}
                    onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                    className='w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 resize-none' />
                  <div className='grid grid-cols-2 gap-3'>
                    <input placeholder='Location' value={jobForm.location}
                      onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                    <input placeholder='Period (e.g. 1 month)' value={jobForm.jobPeriod}
                      onChange={e => setJobForm(p => ({ ...p, jobPeriod: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                    <input required type='number' placeholder='Min Salary (GEL)' value={jobForm.salaryMin}
                      onChange={e => setJobForm(p => ({ ...p, salaryMin: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                    <input type='number' placeholder='Max Salary (GEL)' value={jobForm.salaryMax}
                      onChange={e => setJobForm(p => ({ ...p, salaryMax: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  </div>
                  <div className='grid grid-cols-3 gap-3'>
                    <select value={jobForm.jobRegime} onChange={e => setJobForm(p => ({ ...p, jobRegime: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'>
                      <option value='FULL_TIME'>On-site</option>
                      <option value='REMOTE'>Remote</option>
                      <option value='HYBRID'>Hybrid</option>
                    </select>
                    <select value={jobForm.experience} onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'>
                      <option value='NONE'>No experience</option>
                      <option value='ONE_TO_THREE'>1-3 years</option>
                      <option value='THREE_TO_FIVE'>3-5 years</option>
                      <option value='FIVE_PLUS'>5+ years</option>
                    </select>
                    <select value={jobForm.applicationMethod} onChange={e => setJobForm(p => ({ ...p, applicationMethod: e.target.value }))}
                      className='h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600'>
                      <option value='CV_ONLY'>CV only</option>
                      <option value='FORM_ONLY'>Form only</option>
                      <option value='BOTH'>CV + Form</option>
                    </select>
                  </div>
                  <button type='submit' className='w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-medium transition'>
                    Post Job
                  </button>
                </form>
              )}

              <div className='flex flex-col gap-2'>
                {jobs.map(job => (
                  <div key={job.id} className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-display font-semibold text-sm text-gray-900'>{job.title}</p>
                      <p className='text-xs text-gray-400 mt-0.5'>
                        {job.location || 'Remote'} · {job.salaryMin.toLocaleString()} ₾
                      </p>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='text-xs text-gray-500'>{job.views} views · {job._count.applications} applied</p>
                    </div>
                    <span className={'text-xs px-2 py-0.5 rounded border ' +
                      (job.status === 'HIRING' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-gray-100 text-gray-500 border-gray-200')}>
                      {job.status === 'HIRING' ? 'Hiring' : 'Closed'}
                    </span>
                    <div className='flex gap-3 flex-shrink-0'>
                      <button onClick={() => viewApplicants(job)} className='text-xs text-brand-600 hover:underline'>
                        Applicants
                      </button>
                      {job.status === 'HIRING' && (
                        <button onClick={() => handleCloseJob(job.id)} className='text-xs text-gray-400 hover:text-gray-600'>
                          Close
                        </button>
                      )}
                      <button onClick={() => handleDeleteJob(job.id)} className='text-xs text-red-400 hover:text-red-600'>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className='text-center py-12 text-gray-400 text-sm'>
                    No jobs posted yet. Click "+ New Job" to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EMPLOYER — APPLICANTS */}
          {activePanel === 'applicants' && user?.role === 'EMPLOYER' && (
            <div>
              <div className='flex items-center justify-between mb-4'>
                <p className='font-display font-semibold text-gray-900'>
                  {selectedJob ? 'Applicants for: ' + selectedJob.title : 'Select a job to view applicants'}
                </p>
                <button onClick={() => setActivePanel('jobs')} className='text-xs text-gray-400 hover:text-gray-600'>
                  ← Back to jobs
                </button>
              </div>

              <div className='flex flex-col gap-2'>
                {applicants.map(app => (
                  <div key={app.id} className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0'>
                      {app.candidate.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900'>{app.candidate.fullName}</p>
                      {app.coverLetter && (
                        <p className='text-xs text-gray-400 truncate mt-0.5'>"{app.coverLetter}"</p>
                      )}
                      <p className='text-xs text-gray-400 mt-0.5'>
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {app.cvUrl && (
                      <a
                        href={'http://localhost:5000' + app.cvUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='text-xs text-brand-600 hover:underline flex-shrink-0'
                      >
                        CV
                      </a>
                    )}
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className='text-xs bg-surface-50 border border-surface-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-600 flex-shrink-0'>
                      <option value='PENDING'>Pending</option>
                      <option value='REVIEWING'>Reviewing</option>
                      <option value='SHORTLISTED'>Shortlisted</option>
                      <option value='REJECTED'>Rejected</option>
                      <option value='HIRED'>Hired</option>
                    </select>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <div className='text-center py-12 text-gray-400 text-sm'>No applicants yet.</div>
                )}
              </div>
            </div>
          )}

          {/* EMPLOYER — ANALYTICS */}
          {activePanel === 'analytics' && user?.role === 'EMPLOYER' && (
            <div>
              <p className='font-display font-semibold text-gray-900 mb-4'>Analytics</p>
              <div className='grid grid-cols-2 gap-3 mb-6'>
                {[
                  { label: 'Total views',    value: jobs.reduce((a, j) => a + j.views, 0).toLocaleString() },
                  { label: 'Applications',   value: jobs.reduce((a, j) => a + j._count.applications, 0) },
                  { label: 'Active jobs',    value: jobs.filter(j => j.status === 'HIRING').length },
                  { label: 'Closed jobs',    value: jobs.filter(j => j.status === 'CLOSED').length },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-surface-200 rounded-xl p-4'>
                    <p className='text-xs text-gray-400 uppercase tracking-wider mb-1'>{stat.label}</p>
                    <p className='font-display font-bold text-2xl text-gray-900'>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className='bg-white border border-surface-200 rounded-xl p-8 text-center text-gray-400 text-sm'>
                Charts and graphs coming in Phase 6 📊
              </div>
            </div>
          )}

          {/* EMPLOYER — SETTINGS */}
          {activePanel === 'settings' && user?.role === 'EMPLOYER' && (
            <div>
              <p className='font-display font-semibold text-gray-900 mb-4'>Company profile</p>
              <form onSubmit={handleUpdateProfile} className='bg-white border border-surface-200 rounded-xl p-5 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1.5'>Company name</label>
                    <input value={form.companyName || ''} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                      className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1.5'>Website</label>
                    <input value={form.website || ''} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                      className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  </div>
                </div>
                <div>
                  <label className='text-xs text-gray-500 block mb-1.5'>Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                    className='w-full bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 resize-none' />
                </div>
                <button type='submit' className='bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition'>
                  Save changes
                </button>
              </form>
            </div>
          )}

          {/* CANDIDATE — APPLICATIONS */}
          {activePanel === 'applications' && user?.role === 'CANDIDATE' && (
            <div>
              <div className='grid grid-cols-3 gap-3 mb-6'>
                {[
                  { label: 'Applied',      value: applications.length },
                  { label: 'In review',    value: applications.filter(a => a.status === 'REVIEWING' || a.status === 'SHORTLISTED').length },
                  { label: 'Shortlisted',  value: applications.filter(a => a.status === 'SHORTLISTED').length },
                ].map(stat => (
                  <div key={stat.label} className='bg-white border border-surface-200 rounded-xl p-4'>
                    <p className='text-xs text-gray-400 uppercase tracking-wider mb-1'>{stat.label}</p>
                    <p className='font-display font-bold text-2xl text-gray-900'>{stat.value}</p>
                  </div>
                ))}
              </div>

              <p className='font-display font-semibold text-gray-900 mb-3'>My applications</p>

              <div className='flex flex-col gap-2'>
                {applications.map(app => (
                  <div key={app.id} className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4'>
                    <div className='w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center font-display font-bold text-xs text-gray-500 flex-shrink-0'>
                      {app.job.employer.companyName.charAt(0)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-sm font-medium text-gray-900 cursor-pointer hover:text-brand-600 transition'
                        onClick={() => navigate('/jobs/' + app.jobId)}>
                        {app.job.title}
                      </p>
                      <p className='text-xs text-gray-400 mt-0.5'>
                        {app.job.employer.companyName} · {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={'text-xs px-2.5 py-1 rounded-lg border font-medium ' + STATUS_STYLES[app.status]}>
                      {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className='text-center py-12 text-sm text-gray-400'>
                    No applications yet.{' '}
                    <span onClick={() => navigate('/')} className='text-brand-600 cursor-pointer hover:underline'>
                      Browse jobs
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CANDIDATE — CV */}
          {activePanel === 'cv' && user?.role === 'CANDIDATE' && (
            <div>
              <p className='font-display font-semibold text-gray-900 mb-4'>My CV</p>
              {profile?.cvUrl ? (
                <div className='bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4 mb-4'>
                  <div className='w-10 h-12 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 text-xs font-bold'>
                    PDF
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>Current CV</p>
                    <p className='text-xs text-gray-400 mt-0.5'>Uploaded previously</p>
                  </div>
                  <a
                    href={'http://localhost:5000' + profile.cvUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm text-brand-600 hover:underline'
                  >
                    View
                  </a>
                </div>
              ) : null}
              <div className='border-2 border-dashed border-surface-200 rounded-xl p-8 text-center text-gray-400 text-sm cursor-pointer hover:border-brand-400 hover:text-brand-500 transition'>
                Click to upload CV (PDF or Word, max 5MB)
              </div>
            </div>
          )}

          {/* CANDIDATE — SETTINGS */}
          {activePanel === 'settings' && user?.role === 'CANDIDATE' && (
            <div>
              <p className='font-display font-semibold text-gray-900 mb-4'>Edit profile</p>
              <form onSubmit={handleUpdateProfile} className='bg-white border border-surface-200 rounded-xl p-5 space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1.5'>Full name</label>
                    <input value={form.fullName || ''} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                      className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  </div>
                  <div>
                    <label className='text-xs text-gray-500 block mb-1.5'>Location</label>
                    <input value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                  </div>
                </div>
                <div>
                  <label className='text-xs text-gray-500 block mb-1.5'>Headline</label>
                  <input value={form.headline || ''} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                    placeholder='e.g. Senior React Developer'
                    className='w-full h-9 bg-surface-50 border border-surface-200 rounded-lg px-3 text-sm focus:outline-none focus:border-brand-600' />
                </div>
                <button type='submit' className='bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition'>
                  Save changes
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}