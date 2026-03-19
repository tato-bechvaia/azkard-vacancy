import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-dark-600'>
      <Navbar />

      {/* Hero */}
      <div className='max-w-6xl mx-auto px-6 pt-40 pb-20'>
        <div className='text-center max-w-3xl mx-auto'>
          <div className='inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-2 mb-8'>
            <div className='w-2 h-2 rounded-full bg-brand-400 animate-pulse'></div>
            <span className='text-brand-400 text-sm font-medium'>Georgia's modern job platform</span>
          </div>

          <h1 className='text-5xl md:text-7xl font-bold text-white mb-6 leading-tight'>
            Find your next
            <span className='bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent'> career move</span>
          </h1>

          <p className='text-dark-100 text-xl mb-10 leading-relaxed'>
            Connect with top companies in Georgia. Upload your CV, apply in seconds, and land your dream job.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => navigate('/jobs')}
              className='bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition'>
              Browse Jobs
            </button>
            <button
              onClick={() => navigate('/register')}
              className='border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition'>
              Post a Job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto'>
          {[
            { number: '500+', label: 'Active Jobs' },
            { number: '200+', label: 'Companies' },
            { number: '10k+', label: 'Candidates' },
          ].map((stat) => (
            <div key={stat.label} className='text-center'>
              <p className='text-3xl font-bold text-white'>{stat.number}</p>
              <p className='text-dark-100 text-sm mt-1'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className='max-w-6xl mx-auto px-6 py-20 border-t border-white/5'>
        <h2 className='text-3xl font-bold text-white text-center mb-12'>Why Azkard?</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {[
            { icon: '⚡', title: 'Apply in seconds', desc: 'Upload your CV once and apply to any job with one click.' },
            { icon: '🎯', title: 'Smart matching', desc: 'AI-powered recommendations match you with the right jobs.' },
            { icon: '📊', title: 'Real analytics', desc: 'Employers get detailed insights on every job post.' },
          ].map((f) => (
            <div key={f.title} className='bg-dark-400 border border-white/5 rounded-2xl p-6 hover:border-brand-600/30 transition'>
              <div className='text-3xl mb-4'>{f.icon}</div>
              <h3 className='text-white font-semibold text-lg mb-2'>{f.title}</h3>
              <p className='text-dark-100 text-sm leading-relaxed'>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className='max-w-6xl mx-auto px-6 py-20'>
        <div className='bg-gradient-to-r from-brand-600/20 to-brand-800/20 border border-brand-600/20 rounded-3xl p-12 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>Ready to hire top talent?</h2>
          <p className='text-dark-100 mb-8'>Post your first job for free and reach thousands of candidates.</p>
          <button
            onClick={() => navigate('/register')}
            className='bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition'>
            Start Hiring Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className='border-t border-white/5 py-8'>
        <div className='max-w-6xl mx-auto px-6 flex justify-between items-center'>
          <span className='text-dark-100 text-sm'>© 2026 Azkard. All rights reserved.</span>
          <span className='text-dark-100 text-sm'>Made in Georgia 🇬🇪</span>
        </div>
      </div>
    </div>
  );
}