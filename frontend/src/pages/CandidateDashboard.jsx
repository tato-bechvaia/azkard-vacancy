import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

const STATUS_COLORS = {
  PENDING:     'bg-yellow-50 text-yellow-700',
  REVIEWING:   'bg-blue-50 text-blue-700',
  SHORTLISTED: 'bg-teal-50 text-teal-700',
  REJECTED:    'bg-red-50 text-red-500',
  HIRED:       'bg-green-50 text-green-700',
};

export default function CandidateDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile]           = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const [form, setForm]                 = useState({ fullName: '', headline: '', location: '' });
  const [message, setMessage]           = useState('');

  useEffect(() => {
    api.get('/applications/mine').then(({ data }) => setApplications(data));
    api.get('/profiles/me').then(({ data }) => {
      setProfile(data);
      setForm({ fullName: data.fullName, headline: data.headline || '', location: data.location || '' });
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/profiles/me', form);
      setProfile(data);
      setEditMode(false);
      setMessage('Profile updated!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <nav className='bg-white shadow-sm px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-teal-600 cursor-pointer' onClick={() => navigate('/jobs')}>
          Azkard Vacancy
        </h1>
        <div className='flex gap-4 items-center'>
          <span className='text-sm text-slate-500'>Candidate Dashboard</span>
          <button onClick={logout} className='text-sm text-red-500 hover:underline'>Logout</button>
        </div>
      </nav>

      <div className='max-w-4xl mx-auto py-10 px-4'>

        {/* Profile Section */}
        <div className='bg-white rounded-2xl shadow-sm p-6 mb-8'>
          <div className='flex justify-between items-start mb-4'>
            <h2 className='text-xl font-bold text-slate-800'>My Profile</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className='text-sm text-teal-600 hover:underline'>
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {message && <p className='text-teal-600 text-sm mb-4'>{message}</p>}

          {editMode ? (
            <form onSubmit={handleUpdate} className='space-y-4'>
              <input
                required placeholder='Full Name' value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                placeholder='Headline (e.g. React Developer)' value={form.headline}
                onChange={e => setForm(p => ({ ...p, headline: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <input
                placeholder='Location' value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                className='w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500'
              />
              <button type='submit'
                className='bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium'>
                Save
              </button>
            </form>
          ) : (
            <div className='space-y-2'>
              <p className='text-slate-800 font-semibold text-lg'>{profile?.fullName}</p>
              <p className='text-slate-500'>{profile?.headline || 'No headline yet'}</p>
              <p className='text-slate-500 text-sm'>📍 {profile?.location || 'No location set'}</p>
            </div>
          )}
        </div>

        {/* Applications Section */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold text-slate-800'>My Applications</h2>
          <button
            onClick={() => navigate('/jobs')}
            className='bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 font-medium text-sm'>
            Browse Jobs
          </button>
        </div>

        <div className='space-y-4'>
          {applications.map(app => (
            <div key={app.id} className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3
                    className='text-lg font-semibold text-slate-800 cursor-pointer hover:text-teal-600'
                    onClick={() => navigate('/jobs/' + app.jobId)}>
                    {app.job.title}
                  </h3>
                  <p className='text-teal-600 font-medium'>{app.job.employer.companyName}</p>
                  <p className='text-slate-500 text-sm mt-1'>
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                  {app.coverLetter && (
                    <p className='text-slate-500 text-sm mt-2 italic'>"{app.coverLetter}"</p>
                  )}
                </div>
                <span className={'px-3 py-1 rounded-full text-xs font-medium ' + STATUS_COLORS[app.status]}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className='text-center py-12 text-slate-400'>
              No applications yet.{' '}
              <span className='text-teal-600 cursor-pointer hover:underline' onClick={() => navigate('/jobs')}>
                Browse jobs
              </span>{' '}
              to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}