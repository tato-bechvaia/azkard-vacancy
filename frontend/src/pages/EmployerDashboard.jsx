import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import { assetUrl } from '../utils/assetUrl';

export default function EmployerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs]               = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants]   = useState([]);
  const [message, setMessage]         = useState('');
  const [paying, setPaying]           = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    salary: '', startDate: '', jobRegime: 'FULL_TIME',
    experience: 'NONE', applicationMethod: 'CV_ONLY', category: 'OTHER',
    pricingTier: 'USUAL',
  });

  const fetchJobs = () => {
    api.get('/jobs/mine').then(({ data }) => setJobs(data));
  };

  useEffect(() => {
    const paymentResult  = searchParams.get('payment');
    const sessionId      = searchParams.get('session_id');
    const cancelledJobId = searchParams.get('jobId');

    if (paymentResult === 'success' && sessionId) {
      // Confirm payment with Stripe and activate the job
      api.get('/payments/session/' + sessionId)
        .then(() => {
          setMessage('გადახდა წარმატებულია! ვაკანსია განთავსდა.');
          fetchJobs();
        })
        .catch(() => {
          setMessage('გადახდა დასტურდება... გთხოვთ მოიცადოთ.');
          fetchJobs();
        });
    } else if (paymentResult === 'cancelled') {
      setMessage('გადახდა გაუქმდა. ვაკანსია არ განთავსებულა.');
      if (cancelledJobId) {
        api.delete('/payments/cancel-job/' + cancelledJobId).catch(() => {});
      }
      fetchJobs();
    } else {
      fetchJobs();
    }
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setPaying(true);
      const { data } = await api.post('/payments/create-session', {
        ...form,
        salaryMin: form.salary,
      });
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setPaying(false);
      setMessage(err.response?.data?.message || 'განთავსება ვერ მოხერხდა');
    }
  };

  const handleClose = async (id) => {
    await api.put('/jobs/' + id, { status: 'CLOSED' });
    fetchJobs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await api.delete('/jobs/' + id);
    if (selectedJob?.id === id) setSelectedJob(null);
    fetchJobs();
  };

  const viewApplicants = async (job) => {
    const { data } = await api.get('/applications/job/' + job.id);
    setApplicants(data);
    setSelectedJob(job);
  };

  const updateStatus = async (appId, status) => {
    await api.put('/applications/' + appId + '/status', { status });
    const { data } = await api.get('/applications/job/' + selectedJob.id);
    setApplicants(data);
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <nav className='bg-white shadow-sm px-6 py-4 flex justify-between items-center'>
        <div onClick={() => navigate('/jobs')} className='cursor-pointer inline-block'>
          <div className='h-9 px-4 rounded-lg bg-brand-600 inline-flex items-center text-white font-display font-bold text-lg tracking-wide'>
            Azkard
          </div>
        </div>
        <div className='flex gap-4 items-center'>
          <span className='text-sm text-slate-500'>Employer Dashboard</span>
          <button onClick={logout} className='text-sm text-red-500 hover:underline'>
            Logout
          </button>
        </div>
      </nav>

      <div className='max-w-4xl mx-auto py-10 px-4'>

        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-slate-800'>My Job Posts</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className='bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 font-medium'>
            {showForm ? 'Cancel' : '+ Post New Job'}
          </button>
        </div>

        {message && (
          <p className='text-teal-600 mb-4 font-medium'>{message}</p>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className='bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-5'>
            <h3 className='text-lg font-semibold text-slate-800'>ახალი ვაკანსია</h3>

            <input
              required placeholder='პოზიციის სახელი' value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />

            <textarea
              required placeholder='ვაკანსიის აღწერა' value={form.description} rows={4}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />

            <div className='grid grid-cols-2 gap-4'>
              <input
                placeholder='მდებარეობა (სურვილისამებრ)' value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                type='date' value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                required type='number' placeholder='ხელფასი (GEL)' value={form.salary}
                onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
            </div>

            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <select
                value={form.jobRegime}
                onChange={e => setForm(p => ({ ...p, jobRegime: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='FULL_TIME'>სრული განაკვეთი</option>
                <option value='REMOTE'>დისტანციური</option>
                <option value='HYBRID'>ჰიბრიდული</option>
              </select>

              <select
                value={form.experience}
                onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='NONE'>გამოცდილების გარეშე</option>
                <option value='ONE_TO_THREE'>1-3 წელი</option>
                <option value='THREE_TO_FIVE'>3-5 წელი</option>
                <option value='FIVE_PLUS'>5+ წელი</option>
              </select>

              <select
                value={form.applicationMethod}
                onChange={e => setForm(p => ({ ...p, applicationMethod: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='CV_ONLY'>მხოლოდ CV</option>
                <option value='FORM_ONLY'>მხოლოდ ფორმა</option>
                <option value='BOTH'>CV + ფორმა</option>
              </select>

              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='IT'>IT</option>
                <option value='SALES'>გაყიდვები</option>
                <option value='MARKETING'>მარკეტინგი</option>
                <option value='FINANCE'>ფინანსები</option>
                <option value='DESIGN'>დიზაინი</option>
                <option value='MANAGEMENT'>მენეჯმენტი</option>
                <option value='LOGISTICS'>ლოგისტიკა</option>
                <option value='HEALTHCARE'>ჯანდაცვა</option>
                <option value='EDUCATION'>განათლება</option>
                <option value='HOSPITALITY'>სტუმართმოყვარეობა</option>
                <option value='OTHER'>სხვა</option>
              </select>
            </div>

            {/* ── Pricing Tier ── */}
            <div>
              <p className='text-sm font-semibold text-slate-700 mb-3'>განთავსების პაკეტი</p>
              <div className='grid grid-cols-2 gap-4'>
                {/* USUAL */}
                <button
                  type='button'
                  onClick={() => setForm(p => ({ ...p, pricingTier: 'USUAL' }))}
                  className={[
                    'relative rounded-xl border-2 p-4 text-left transition-all duration-150',
                    form.pricingTier === 'USUAL'
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  {form.pricingTier === 'USUAL' && (
                    <span className='absolute top-3 right-3 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center'>
                      <svg className='w-2.5 h-2.5 text-white' fill='none' viewBox='0 0 10 10'>
                        <path d='M2 5l2.5 2.5L8 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    </span>
                  )}
                  <p className='text-xl font-bold text-slate-800'>35 ₾</p>
                  <p className='text-sm font-semibold text-slate-700 mt-0.5'>სტანდარტული</p>
                  <ul className='mt-2 space-y-1 text-xs text-slate-500'>
                    <li>✓ 30 დღე განთავსება</li>
                    <li>✓ ძებნაში გამოჩნდება</li>
                    <li>✓ განაცხადების მართვა</li>
                  </ul>
                </button>

                {/* PREMIUM */}
                <button
                  type='button'
                  onClick={() => setForm(p => ({ ...p, pricingTier: 'PREMIUM' }))}
                  className={[
                    'relative rounded-xl border-2 p-4 text-left transition-all duration-150',
                    form.pricingTier === 'PREMIUM'
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-amber-200',
                  ].join(' ')}
                >
                  <span className='absolute -top-2.5 left-4 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase'>
                    Premium
                  </span>
                  {form.pricingTier === 'PREMIUM' && (
                    <span className='absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center'>
                      <svg className='w-2.5 h-2.5 text-white' fill='none' viewBox='0 0 10 10'>
                        <path d='M2 5l2.5 2.5L8 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    </span>
                  )}
                  <p className='text-xl font-bold text-slate-800'>65 ₾</p>
                  <p className='text-sm font-semibold text-slate-700 mt-0.5'>პრემიუმ</p>
                  <ul className='mt-2 space-y-1 text-xs text-slate-500'>
                    <li>✓ 30 დღე განთავსება</li>
                    <li>✓ კარუსელში გამოჩნდება</li>
                    <li>✓ Premium ბეჯი</li>
                    <li>✓ პირველ ადგილზე</li>
                  </ul>
                </button>
              </div>
            </div>

            <div className='flex items-center justify-between pt-1'>
              <p className='text-xs text-slate-400'>
                გადახდა: <span className='font-semibold text-slate-600'>
                  {form.pricingTier === 'PREMIUM' ? '65 ₾' : '35 ₾'}
                </span>
              </p>
              <button
                type='submit'
                disabled={paying}
                className='bg-teal-600 text-white px-8 py-2.5 rounded-xl hover:bg-teal-700 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed'>
                {paying ? 'გადამისამართება...' : `გადახდა — ${form.pricingTier === 'PREMIUM' ? '65 ₾' : '35 ₾'}`}
              </button>
            </div>
          </form>
        )}

        <div className='space-y-4'>
          {jobs.map(job => (
            <div key={job.id} className={[
              'bg-white rounded-xl shadow-sm p-6 border-l-4',
              job.paymentStatus === 'PENDING' ? 'border-amber-400 opacity-75' :
              job.pricingTier   === 'PREMIUM' ? 'border-amber-400' : 'border-transparent',
            ].join(' ')}>

              {/* Pending payment warning */}
              {job.paymentStatus === 'PENDING' && (
                <div className='flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4'>
                  <span className='text-amber-500 text-sm'>⏳</span>
                  <p className='text-xs text-amber-700 font-medium'>გადახდა არ დასრულებულა — ვაკანსია არ ჩანს სხვებისთვის</p>
                </div>
              )}

              <div className='flex justify-between items-start'>
                <div>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <h3 className='text-lg font-semibold text-slate-800'>{job.title}</h3>
                    {job.pricingTier === 'PREMIUM' && (
                      <span className='bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase'>
                        Premium
                      </span>
                    )}
                  </div>
                  <p className='text-slate-500 text-sm'>{job.location || 'Remote'} · {job.jobRegime}</p>
                  <p className='text-slate-700 font-medium mt-1'>
                    {(job.salaryMin || 0).toLocaleString()} ₾
                  </p>
                </div>
                <div className='text-right space-y-1'>
                  <div className='flex items-center gap-2 justify-end'>
                    <span className={'inline-block px-3 py-1 rounded-full text-xs font-medium ' + (job.status === 'HIRING' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500')}>
                      {job.status === 'HIRING' ? 'აქტიური' : 'დახურული'}
                    </span>
                  </div>
                  <p className='text-slate-500 text-sm'>👁 {job.views}</p>
                  <p className='text-slate-500 text-sm'>📋 {job._count.applications}</p>
                  <p className='text-slate-400 text-xs'>{job.priceAmount} ₾ · {job.pricingTier === 'PREMIUM' ? 'Premium' : 'სტანდარტული'}</p>
                </div>
              </div>

              <div className='flex gap-4 mt-4'>
                {job.paymentStatus !== 'PENDING' && (
                  <button
                    onClick={() => navigate('/jobs/' + job.id)}
                    className='text-sm text-teal-600 hover:underline'>
                    ნახვა
                  </button>
                )}
                <button
                  onClick={() => viewApplicants(job)}
                  className='text-sm text-teal-600 hover:underline'>
                  განმცხადებლები ({job._count.applications})
                </button>
                {job.status === 'HIRING' && job.paymentStatus === 'PAID' && (
                  <button
                    onClick={() => handleClose(job.id)}
                    className='text-sm text-slate-500 hover:underline'>
                    დახურვა
                  </button>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  className='text-sm text-red-400 hover:underline'>
                  წაშლა
                </button>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className='text-center py-12 text-slate-400'>
              No jobs posted yet. Click "Post New Job" to get started!
            </div>
          )}
        </div>

        {selectedJob && (
          <div className='mt-10'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-bold text-slate-800'>
                Applicants for: {selectedJob.title}
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className='text-sm text-slate-400 hover:underline'>
                Close
              </button>
            </div>

            {applicants.length === 0 ? (
              <p className='text-slate-400 text-center py-8'>No applicants yet</p>
            ) : (
              <div className='space-y-4'>
                {applicants.map(app => (
                  <div key={app.id} className='bg-white rounded-xl shadow-sm p-6'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h4 className='font-semibold text-slate-800'>{app.candidate.fullName}</h4>
                        {app.candidate.headline && (
                          <p className='text-slate-500 text-sm'>{app.candidate.headline}</p>
                        )}
                        {app.coverLetter && (
                          <p className='text-slate-600 text-sm mt-2 italic'>"{app.coverLetter}"</p>
                        )}
                        {app.cvUrl && (
                          <a
                            href={assetUrl(app.cvUrl)}
                            target='_blank'
                            rel='noreferrer'
                            className='inline-block mt-2 text-teal-600 text-sm hover:underline'>
                            Download CV
                          </a>
                        )}
                        <p className='text-slate-400 text-xs mt-2'>
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className='text-right'>
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          className='text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                          <option value='PENDING'>Pending</option>
                          <option value='REVIEWING'>Reviewing</option>
                          <option value='SHORTLISTED'>Shortlisted</option>
                          <option value='REJECTED'>Rejected</option>
                          <option value='HIRED'>Hired</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}