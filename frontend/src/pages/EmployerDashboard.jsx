import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

export default function EmployerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]               = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants]   = useState([]);
  const [message, setMessage]         = useState('');
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    salaryMin: '', salaryMax: '', jobRegime: 'FULL_TIME',
    jobPeriod: '', experience: 'NONE', applicationMethod: 'CV_ONLY'
  });

  const fetchJobs = () => {
    api.get('/jobs/mine').then(({ data }) => setJobs(data));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', form);
      setMessage('Job posted successfully!');
      setShowForm(false);
      setForm({
        title: '', description: '', location: '',
        salaryMin: '', salaryMax: '', jobRegime: 'FULL_TIME',
        jobPeriod: '', experience: 'NONE', applicationMethod: 'CV_ONLY'
      });
      fetchJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post job');
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
        <h1
          className='text-xl font-bold text-teal-600 cursor-pointer'
          onClick={() => navigate('/jobs')}>
          Azkard Vacancy
        </h1>
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
          <form onSubmit={handleCreate} className='bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-4'>
            <h3 className='text-lg font-semibold text-slate-800'>New Job Post</h3>

            <input
              required placeholder='Job Title' value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />

            <textarea
              required placeholder='Job Description' value={form.description} rows={4}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
            />

            <div className='grid grid-cols-2 gap-4'>
              <input
                placeholder='Location (optional)' value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                placeholder='Job Period (e.g. 1 month)' value={form.jobPeriod}
                onChange={e => setForm(p => ({ ...p, jobPeriod: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                required type='number' placeholder='Min Salary (GEL)' value={form.salaryMin}
                onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                type='number' placeholder='Max Salary (GEL)' value={form.salaryMax}
                onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <select
                value={form.jobRegime}
                onChange={e => setForm(p => ({ ...p, jobRegime: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='FULL_TIME'>Full Time</option>
                <option value='REMOTE'>Remote</option>
                <option value='HYBRID'>Hybrid</option>
              </select>

              <select
                value={form.experience}
                onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='NONE'>No Experience</option>
                <option value='ONE_TO_THREE'>1-3 Years</option>
                <option value='THREE_TO_FIVE'>3-5 Years</option>
                <option value='FIVE_PLUS'>5+ Years</option>
              </select>

              <select
                value={form.applicationMethod}
                onChange={e => setForm(p => ({ ...p, applicationMethod: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'>
                <option value='CV_ONLY'>CV Only</option>
                <option value='FORM_ONLY'>Form Only</option>
                <option value='BOTH'>CV + Form</option>
              </select>
            </div>

            <button
              type='submit'
              className='w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-medium'>
              Post Job
            </button>
          </form>
        )}

        <div className='space-y-4'>
          {jobs.map(job => (
            <div key={job.id} className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='text-lg font-semibold text-slate-800'>{job.title}</h3>
                  <p className='text-slate-500 text-sm'>{job.location || 'Remote'} · {job.jobRegime}</p>
                  <p className='text-slate-700 font-medium mt-1'>
                    {job.salaryMin.toLocaleString()} GEL
                    {job.salaryMax && ' - ' + job.salaryMax.toLocaleString() + ' GEL'}
                  </p>
                </div>
                <div className='text-right'>
                  <span className={'inline-block px-3 py-1 rounded-full text-xs font-medium ' + (job.status === 'HIRING' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500')}>
                    {job.status}
                  </span>
                  <p className='text-slate-500 text-sm mt-2'>👁 {job.views} views</p>
                  <p className='text-slate-500 text-sm'>📋 {job._count.applications} applications</p>
                </div>
              </div>

              <div className='flex gap-4 mt-4'>
                <button
                  onClick={() => navigate('/jobs/' + job.id)}
                  className='text-sm text-teal-600 hover:underline'>
                  View Post
                </button>
                <button
                  onClick={() => viewApplicants(job)}
                  className='text-sm text-teal-600 hover:underline'>
                  View Applicants ({job._count.applications})
                </button>
                {job.status === 'HIRING' && (
                  <button
                    onClick={() => handleClose(job.id)}
                    className='text-sm text-slate-500 hover:underline'>
                    Close Job
                  </button>
                )}
                <button
                  onClick={() => handleDelete(job.id)}
                  className='text-sm text-red-400 hover:underline'>
                  Delete
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
                            href={'http://localhost:5000' + app.cvUrl}
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